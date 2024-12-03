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

const getDesktopProvider = async (type: WalletProvider) => {
  switch (type) {
    case 'phantom':
      return window?.phantom?.solana;
    case 'solflare': {
      // Attendre que Solflare soit disponible
      let attempts = 0;
      while (!window.solflare && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      return window.solflare;
    }
    default:
      return null;
  }
};

export const getProvider = async (type: WalletProvider) => {
  console.log(`Getting provider for ${type}`);
  
  // Si nous sommes dans le navigateur in-app
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

  // Pour les navigateurs desktop normaux
  try {
    const desktopProvider = await getDesktopProvider(type);
    
    if (desktopProvider) {
      console.log(`Desktop provider found for ${type}`);
      
      if (type === 'solflare') {
        // Attendre un peu que le provider soit complètement initialisé
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Vérifier si le provider est prêt
        if (typeof desktopProvider.isConnected === 'undefined') {
          console.log('Solflare provider not ready, redirecting to download');
          window.open('https://solflare.com/download', '_blank');
          return null;
        }
      }
      
      return desktopProvider;
    }
  } catch (error) {
    console.error('Error getting desktop provider:', error);
  }

  // Pour mobile ou si le wallet n'est pas installé
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
};
