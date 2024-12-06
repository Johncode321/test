// utils/wallet.ts
import { WalletProvider } from '../types/wallet';

declare global {
  interface Window {
    phantom?: {
      solana?: any;
    };
    solflare?: any;
  }
}

// Export toutes les fonctions d'utilitaire
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

export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const getDesktopProvider = async (type: WalletProvider) => {
  switch (type) {
    case 'phantom':
      return window?.phantom?.solana;
    case 'solflare': {
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
  
  const isMobile = isMobileDevice();
  const isStandaloneBrowser = isMobile && !isInAppBrowser();

  // Pour mobile Chrome standard
  if (isStandaloneBrowser) {
    // Tenter d'obtenir le provider directement
    const provider = type === 'phantom' ? window?.phantom?.solana : window?.solflare;
    if (provider) return provider;

    // Sinon, charger le SDK
    try {
      if (type === 'phantom') {
        await loadScript('https://unpkg.com/@solana/web3.js@latest/lib/index.iife.min.js');
        return window.phantom?.solana;
      } else if (type === 'solflare') {
        await loadScript('https://cdn.jsdelivr.net/npm/@solflare-wallet/sdk@1.3.0/dist/index.min.js');
        return window.solflare;
      }
    } catch (error) {
      console.error('Error loading SDK:', error);
    }
  }

  // Pour in-app browser
  if (isInAppBrowser()) {
    if (type === 'phantom' && isPhantomBrowser()) {
      return window.phantom?.solana;
    }
    if (type === 'solflare' && isSolflareBrowser()) {
      return window.solflare;
    }
  }

  // Pour desktop
  if (!isMobile) {
    const provider = await getDesktopProvider(type);
    if (provider) return provider;

    // Si le wallet n'est pas installé sur desktop
    const downloadUrls = {
      phantom: 'https://phantom.app/download',
      solflare: 'https://solflare.com/download'
    };
    window.open(downloadUrls[type], '_blank');
  }
  
  return null;
};

const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
};
