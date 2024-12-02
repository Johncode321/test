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

export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

const WALLET_CONFIGS = {
  phantom: {
    name: 'Phantom',
    mobile: {
      deepLink: 'https://phantom.app/ul/browse/',
      downloadUrl: 'https://phantom.app/download'
    }
  },
  solflare: {
    name: 'Solflare',
    mobile: {
      deepLink: 'https://solflare.com/ul/v1/browse/',
      downloadUrl: 'https://solflare.com/download'
    }
  }
};

const buildDeepLink = (type: WalletProvider) => {
  const dappUrl = window.location.href;
  const encodedUrl = encodeURIComponent(dappUrl);
  const config = WALLET_CONFIGS[type];
  return `${config.mobile.deepLink}${encodedUrl}`;
};

const getProviderFromWindow = (type: WalletProvider) => {
  switch (type) {
    case 'phantom':
      return window.phantom?.solana;
    case 'solflare':
      return window.solflare;
    default:
      return null;
  }
};

export const getProvider = (type: WalletProvider) => {
  const provider = getProviderFromWindow(type);
  
  if (provider) {
    return provider;
  }

  // Si pas de provider et sur mobile, rediriger vers l'app
  if (isMobileDevice()) {
    const deepLink = buildDeepLink(type);
    window.location.href = deepLink;
    return null;
  }

  // Sur desktop sans provider, ouvrir la page de téléchargement
  window.open(WALLET_CONFIGS[type].mobile.downloadUrl, '_blank');
  return null;
};

export const handleMobileRedirect = (type: WalletProvider) => {
  if (isMobileDevice()) {
    const deepLink = buildDeepLink(type);
    window.location.href = deepLink;
    return true;
  }
  return false;
};
