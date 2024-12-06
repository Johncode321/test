// utils/wallet.ts

export const getProvider = async (type: WalletProvider) => {
  console.log(`Getting provider for ${type}`);
  
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isInAppBrowser = isPhantomBrowser() || isSolflareBrowser();
  const isStandaloneBrowser = isMobile && !isInAppBrowser;

  // Check if we're in a normal mobile browser (not in-app)
  if (isStandaloneBrowser) {
    // Pour mobile Chrome, utiliser directement le provider s'il existe
    if (type === 'phantom' && window.phantom?.solana) {
      return window.phantom.solana;
    }
    if (type === 'solflare' && window.solflare) {
      return window.solflare;
    }

    // Si le provider n'existe pas encore, charger le SDK approprié
    try {
      if (type === 'phantom') {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@solana/web3.js@latest/lib/index.iife.min.js';
        document.head.appendChild(script);
        await new Promise((resolve) => script.onload = resolve);
        return window.phantom?.solana;
      } else if (type === 'solflare') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@solflare-wallet/sdk@1.3.0/dist/index.min.js';
        document.head.appendChild(script);
        await new Promise((resolve) => script.onload = resolve);
        return window.solflare;
      }
    } catch (error) {
      console.error('Error loading SDK:', error);
    }
  }

  // Pour in-app browser et desktop, garder la logique existante
  if (isInAppBrowser) {
    if (type === 'phantom' && isPhantomBrowser()) {
      return window.phantom?.solana;
    }
    if (type === 'solflare' && isSolflareBrowser()) {
      return window.solflare;
    }
  }

  // Pour desktop
  if (!isMobile) {
    if (type === 'solflare' && window.solflare) {
      return window.solflare;
    }
    if (type === 'phantom' && window.phantom?.solana) {
      return window.phantom.solana;
    }

    // Si le wallet n'est pas installé sur desktop
    const downloadUrls = {
      phantom: 'https://phantom.app/download',
      solflare: 'https://solflare.com/download'
    };
    window.open(downloadUrls[type], '_blank');
  }
  
  return null;
};
