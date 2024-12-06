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

const createPhantomDeepLink = (dappUrl: string) => {
  const encodedUrl = encodeURIComponent(dappUrl);
  const ref = encodeURIComponent(dappUrl);
  return `https://phantom.app/ul/browse/${encodedUrl}?ref=${ref}`;
};

const createSolflareDeepLink = (dappUrl: string) => {
  const params = new URLSearchParams({
    ref: window.location.origin
  });
  return `solflare://v1/browse/${encodeURIComponent(dappUrl)}?${params.toString()}`;
};

export const getProvider = async (type: WalletProvider) => {
  console.log(`Getting provider for ${type}`);
  
  const isMobile = isMobileDevice();
  const isStandaloneBrowser = isMobile && !isInAppBrowser();

  // Gestion des deep links sur mobile (hors wallet browser)
  if (isStandaloneBrowser) {
    const dappUrl = 'https://test-beta-rouge-19.vercel.app';
    
    if (type === 'phantom') {
      const deepLink = createPhantomDeepLink(dappUrl);
      window.location.href = deepLink;
      return null;
    }

    if (type === 'solflare') {
      const deepLink = createSolflareDeepLink(dappUrl);
      window.location.href = deepLink;
      return null;
    }
  }

  // Gestion dans les wallet browsers
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

  // Gestion desktop
  if (!isMobile) {
    try {
      const provider = await getDesktopProvider(type);
      if (!provider) {
        // Redirection vers la page de téléchargement si le wallet n'est pas installé
        const downloadUrls = {
          phantom: 'https://phantom.app/download',
          solflare: 'https://solflare.com/download'
        };
        window.open(downloadUrls[type], '_blank');
        return null;
      }
      return provider;
    } catch (error) {
      console.error('Error getting desktop provider:', error);
      return null;
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
