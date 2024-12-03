// src/utils/wallet.ts

import { WalletProvider } from '../types/wallet';

declare global {
  interface Window {
    phantom?: {
      solana?: any;
    };
    solflare?: any;
  }
}

export const isPhantomBrowser = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('phantom');
};

export const isSolflareBrowser = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('solflare');
};

export const isInAppBrowser = () => {
  return isPhantomBrowser() || isSolflareBrowser();
};

const getDesktopProvider = (type: WalletProvider) => {
  switch (type) {
    case 'phantom':
      return window?.phantom?.solana;
    case 'solflare':
      return window?.solflare;
    default:
      return null;
  }
};

export const getProvider = async (type: WalletProvider) => {
  // Si nous sommes dans le navigateur Solflare
  if (isSolflareBrowser() && type === 'solflare') {
    let attempts = 0;
    while (!window.solflare && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    // Si l'utilisateur est déjà connecté dans le navigateur Solflare,
    // on peut vérifier directement la connexion
    if (window.solflare?.isConnected) {
      return window.solflare;
    }
    
    return window.solflare;
  }

  // Reste du code pour les autres cas
  if (isInAppBrowser()) {
    if (type === 'phantom' && isPhantomBrowser()) {
      let attempts = 0;
      while (!window.phantom?.solana && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      return window.phantom?.solana;
    }
  }

  const desktopProvider = getDesktopProvider(type);
  if (desktopProvider) {
    return desktopProvider;
  }

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    const dappUrl = window.location.href;
    const encodedUrl = encodeURIComponent(dappUrl);
    
    if (type === 'phantom') {
      window.location.href = `https://phantom.app/ul/browse/${encodedUrl}`;
    } else if (type === 'solflare') {
      window.location.href = `https://solflare.com/ul/v1/browse/${encodedUrl}`;
    }
  } else {
    const downloadUrls = {
      phantom: 'https://phantom.app/download',
      solflare: 'https://solflare.com/download'
    };
    window.open(downloadUrls[type], '_blank');
  }
  
  return null;
}
