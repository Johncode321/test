import { WalletProvider, WalletAdapterSession, MobileWalletAdapterConfig } from '../types/wallet';
import { transact } from '@solana-mobile/wallet-adapter-mobile';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PublicKey } from '@solana/web3.js';

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

const getMobileProvider = async (type: WalletProvider): Promise<WalletAdapterSession | null> => {
  try {
    const authorization = await transact(async wallet => {
      const config: MobileWalletAdapterConfig = {
        cluster: WalletAdapterNetwork.Mainnet,
        appIdentity: {
          name: "Solana Message Signer",
          uri: window.location.origin,
          icon: "/solana-logo.svg"
        }
      };
      return await wallet.authorize(config);
    });

    // Créer une session avec le wallet mobile
    return {
      publicKey: authorization.accounts[0].address,
      signMessage: async (message: Uint8Array) => {
        return await transact(async wallet => {
          return await wallet.signMessage(message);
        });
      },
      disconnect: async () => {
        await transact(async wallet => {
          await wallet.deauthorize();
        });
      }
    };
  } catch (error) {
    console.error("Mobile wallet error:", error);
    return null;
  }
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
  
  // Si mobile et pas dans un browser de wallet, utiliser Mobile Wallet Adapter
  if (isMobileDevice() && !isInAppBrowser()) {
    return getMobileProvider(type);
  }

  // Si dans un browser de wallet
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

  // Pour les navigateurs desktop
  try {
    const desktopProvider = await getDesktopProvider(type);
    if (desktopProvider) {
      return desktopProvider;
    }
  } catch (error) {
    console.error('Error getting desktop provider:', error);
  }

  // Si pas de provider trouvé, ouvrir le store ou le site de téléchargement
  if (isMobileDevice()) {
    const storeUrls = {
      phantom: 'https://play.google.com/store/apps/details?id=app.phantom',
      solflare: 'https://play.google.com/store/apps/details?id=com.solflare.mobile'
    };
    window.location.href = storeUrls[type];
  } else {
    const downloadUrls = {
      phantom: 'https://phantom.app/download',
      solflare: 'https://solflare.com/download'
    };
    window.open(downloadUrls[type], '_blank');
  }
  
  return null;
};
