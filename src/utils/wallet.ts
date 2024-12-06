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

  // Code spécifique pour les navigateurs mobiles standards (non in-app)
  if (isStandaloneBrowser) {
    const dappUrl = 'https://test-beta-rouge-19.vercel.app';
    const encodedUrl = encodeURIComponent(dappUrl);
    const refParam = encodeURIComponent(dappUrl);

    if (type === 'phantom') {
      window.location.href = `https://phantom.app/ul/browse/${encodedUrl}?ref=${refParam}`;
      return null;
    }

    if (type === 'solflare') {
      window.location.href = `https://solflare.com/ul/v1/browse/${encodedUrl}?ref=${refParam}`;
      return null;
    }
  }

  // Gestion des in-app browsers
  if (isInAppBrowser()) {
    if (type === 'phantom' && isPhantomBrowser()) {
      return window.phantom?.solana;
    }
    if (type === 'solflare' && isSolflareBrowser()) {
      return window.solflare;
    }
  }

  // Gestion desktop
  if (!isMobile) {
    if (type === 'phantom') {
      if (!window?.phantom?.solana) {
        window.open('https://phantom.app/download', '_blank');
        return null;
      }
      return window.phantom.solana;
    }
    
    if (type === 'solflare') {
      if (!window.solflare) {
        window.open('https://solflare.com/download', '_blank');
        return null;
      }
      return window.solflare;
    }
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
