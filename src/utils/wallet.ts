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
  // Vérifier d'abord si on est dans le navigateur in-app
  if (isInAppBrowser()) {
    if (type === 'phantom' && isPhantomBrowser()) {
      let attempts = 0;
      while (!window.phantom?.solana && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      return window.phantom?.solana;
    }

    if (type === 'solflare' && isSolflareBrowser()) {
      let attempts = 0;
      while (!window.solflare && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      return window.solflare;
    }
  }

  // Si on n'est pas dans le navigateur in-app, vérifier l'extension desktop
  const desktopProvider = getDesktopProvider(type);
  if (desktopProvider) {
    return desktopProvider;
  }

  // Si aucun provider n'est trouvé, rediriger vers mobile ou montrer une erreur
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    // Redirection mobile
    const dappUrl = window.location.href;
    const encodedUrl = encodeURIComponent(dappUrl);
    
    if (type === 'phantom') {
      window.location.href = `https://phantom.app/ul/browse/${encodedUrl}`;
    } else if (type === 'solflare') {
      window.location.href = `https://solflare.com/ul/v1/browse/${encodedUrl}`;
    }
  } else {
    // Sur desktop, ouvrir la page de téléchargement de l'extension
    const downloadUrls = {
      phantom: 'https://phantom.app/download',
      solflare: 'https://solflare.com/download'
    };
    window.open(downloadUrls[type], '_blank');
  }
  
  return null;
};
