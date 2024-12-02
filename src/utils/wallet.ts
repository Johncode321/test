import { WalletProvider } from '../types/wallet';

declare global {
  interface Window {
    phantom?: {
      solana?: any;
    };
    solflare?: any;
  }
}

// Fonction pour détecter si on est sur mobile
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const getMobileDeepLink = (type: WalletProvider) => {
  const dappUrl = window.location.href;
  const encodedUrl = encodeURIComponent(dappUrl);

  switch (type) {
    case 'phantom':
      // Sur mobile, utiliser le format universel de Phantom
      return `https://phantom.app/ul/browse/${encodedUrl}`;
    case 'solflare':
      // Sur mobile, utiliser le format universel de Solflare
      return `https://solflare.com/ul/v1/browse/${encodedUrl}`;
    default:
      return null;
  }
};

export const getProvider = (type: WalletProvider) => {
  // Vérifier si on est sur mobile
  if (isMobileDevice()) {
    const deepLink = getMobileDeepLink(type);
    if (deepLink) {
      window.location.href = deepLink;
      return null;
    }
  }

  // Sur desktop, utiliser l'extension comme avant
  if (type === 'phantom' && 'phantom' in window) {
    const provider = window.phantom?.solana;
    if (provider?.isPhantom) return provider;
  }
  
  if (type === 'solflare' && 'solflare' in window) {
    const provider = window.solflare;
    if (provider?.isSolflare) return provider;
  }

  // Si le wallet n'est pas installé et qu'on est sur desktop
  if (!isMobileDevice()) {
    const urls = {
      phantom: 'https://phantom.app/download',
      solflare: 'https://solflare.com/download'
    };
    window.open(urls[type], '_blank');
  }

  return null;
};
