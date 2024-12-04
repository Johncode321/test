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
  
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Check if we're in an in-app browser
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

  // For desktop browsers
  try {
    const desktopProvider = await getDesktopProvider(type);
    if (desktopProvider) {
      return desktopProvider;
    }
  } catch (error) {
    console.error('Error getting desktop provider:', error);
  }

  // For mobile or if wallet is not installed
  if (isMobile) {
    // The URL you want to open in the wallet's in-app browser
    const dappUrl = 'https://test-beta-rouge-19.vercel.app/';
    const encodedUrl = encodeURIComponent(dappUrl);
    const ref = encodeURIComponent(window.location.origin);
    
    if (type === 'solflare') {
      // Updated Solflare deeplink using 'solflare://' protocol
      const deeplink = `solflare://v1/browse/${encodedUrl}?ref=${ref}`;
      window.location.href = deeplink;
    } else if (type === 'phantom') {
      window.location.href = `https://phantom.app/ul/browse/${encodedUrl}?ref=${ref}`;
    }
    return null;
  } else {
    // For desktop: open wallet download page if not installed
    const downloadUrls = {
      phantom: 'https://phantom.app/download',
      solflare: 'https://solflare.com/download'
    };
    window.open(downloadUrls[type], '_blank');
  }
  
  return null;
};
