// src/utils/wallet.ts
import { WalletProvider } from '../types/wallet';
import { PublicKey } from '@solana/web3.js';
import { 
  transact, 
  Web3MobileWallet 
} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';

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

const getMobileProvider = async () => {
  try {
    const wallet = await transact(async (wallet: Web3MobileWallet) => {
      const auth = await wallet.authorize({
        cluster: 'mainnet-beta',
        identity: {
          name: 'Solana Message Signer',
          uri: window.location.origin,
          icon: '/solana-logo.svg'
        }
      });
      
      return {
        wallet,
        publicKey: new PublicKey(auth.accounts[0].address),
        authToken: auth.auth_token
      };
    });

    return {
      publicKey: wallet.publicKey,
      signMessage: async (message: Uint8Array) => {
        return await transact(async (w) => {
          const signedMessage = await w.signMessage(message);
          return signedMessage;
        });
      },
      disconnect: async () => {
        await transact(async (w) => {
          await w.deauthorize();
        });
      },
      isConnected: true
    };
  } catch (error) {
    console.error('Mobile provider error:', error);
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
  
  // Si mobile et pas dans un wallet browser
  if (isMobileDevice() && !isInAppBrowser()) {
    return getMobileProvider();
  }
  
  // Si dans un in-app browser
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

  // Pour desktop
  try {
    const desktopProvider = await getDesktopProvider(type);
    if (desktopProvider) {
      await new Promise(resolve => setTimeout(resolve, 100));
      return desktopProvider;
    }
  } catch (error) {
    console.error('Desktop provider error:', error);
  }

  // Si pas de wallet, rediriger vers store/download
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
