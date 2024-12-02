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
  // Vérifie si on est dans le navigateur intégré de Phantom
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('phantom');
};

export const isSolflareBrowser = () => {
  // Vérifie si on est dans le navigateur intégré de Solflare
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('solflare');
};

export const isInAppBrowser = () => {
  return isPhantomBrowser() || isSolflareBrowser();
};

export const getProvider = async (type: WalletProvider) => {
  // Si on est dans le navigateur in-app, on attend que le provider soit injecté
  if (isInAppBrowser()) {
    if (type === 'phantom' && isPhantomBrowser()) {
      // Attendre que Phantom injecte son provider
      let attempts = 0;
      while (!window.phantom?.solana && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      return window.phantom?.solana;
    }

    if (type === 'solflare' && isSolflareBrowser()) {
      // Attendre que Solflare injecte son provider
      let attempts = 0;
      while (!window.solflare && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      return window.solflare;
    }
  }

  // Si on n'est pas dans un navigateur in-app, on redirige
  const dappUrl = window.location.href;
  const encodedUrl = encodeURIComponent(dappUrl);
  
  if (type === 'phantom') {
    window.location.href = `https://phantom.app/ul/browse/${encodedUrl}`;
  } else if (type === 'solflare') {
    window.location.href = `https://solflare.com/ul/v1/browse/${encodedUrl}`;
  }
  
  return null;
};
