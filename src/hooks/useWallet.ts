import { useState, useEffect, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import { WalletConnection, WalletProvider } from '../types/wallet';
import { transact } from '@solana-mobile/wallet-adapter-mobile';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

// Utility functions
const isPhantomBrowser = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('phantom');
};

const isSolflareBrowser = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('solflare');
};

const isInAppBrowser = () => {
  return isPhantomBrowser() || isSolflareBrowser();
};

const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Mobile Wallet Adapter implementation
const getMobileWalletHandle = async () => {
  try {
    return await transact(async (wallet) => {
      const authResult = await wallet.authorize({
        cluster: WalletAdapterNetwork.Mainnet,
        identity: {
          name: "Solana Message Signer",
          uri: window.location.origin,
          icon: "/solana-logo.svg"
        }
      });
      return { wallet, authResult };
    });
  } catch (error) {
    console.error("Mobile wallet authorization error:", error);
    return null;
  }
};

// Get provider function
const getProvider = async (type: WalletProvider) => {
  console.log(`Getting provider for ${type}`);
  
  const isMobile = isMobileDevice();
  const isStandalone = !isInAppBrowser();

  // Si mobile et pas dans un wallet browser, utiliser Mobile Wallet Adapter
  if (isMobile && isStandalone) {
    const mobileHandle = await getMobileWalletHandle();
    if (mobileHandle) {
      const { wallet, authResult } = mobileHandle;
      return {
        publicKey: new PublicKey(authResult.accounts[0].address),
        signMessage: async (message: Uint8Array) => {
          return await transact(async (w) => {
            return await w.signMessage(message);
          });
        },
        disconnect: async () => {
          await transact(async (w) => {
            await w.deauthorize();
          });
        },
        on: () => {},
        removeAllListeners: () => {},
        isConnected: true
      };
    }
    return null;
  }
  
  // Si dans un wallet browser
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
    let provider = null;
    if (type === 'solflare') {
      let attempts = 0;
      while (!window.solflare && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      provider = window.solflare;
    } else {
      provider = window?.phantom?.solana;
    }

    if (provider) {
      await new Promise(resolve => setTimeout(resolve, 100));
      return provider;
    }
  } catch (error) {
    console.error('Error getting desktop provider:', error);
  }

  // Si pas de wallet, rediriger vers store/download
  if (isMobile) {
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

export const useWallet = () => {
  const [connection, setConnection] = useState<WalletConnection>({
    provider: null,
    publicKey: null,
    providerType: null
  });

  const updateConnectionState = useCallback((
    provider: any,
    publicKey: PublicKey | null, 
    type: WalletProvider | null
  ) => {
    setConnection({
      provider,
      publicKey,
      providerType: type
    });
  }, []);

  const connectWallet = useCallback(async (type: WalletProvider) => {
    try {
      const provider = await getProvider(type);
      if (!provider) return;

      // Si provider mobile
      if (provider.publicKey instanceof PublicKey) {
        updateConnectionState(provider, provider.publicKey, type);
        return;
      }

      // Pour Solflare
      if (type === 'solflare') {
        if (provider.isConnected) {
          const publicKey = await provider.publicKey;
          if (publicKey) {
            updateConnectionState(provider, publicKey, type);
            return;
          }
        }

        const response = await provider.connect();
        const publicKey = response?.publicKey || await provider.publicKey;
        if (publicKey) {
          updateConnectionState(provider, publicKey, type);
        }
      } else {
        // Pour Phantom
        const response = await provider.connect();
        if (response?.publicKey) {
          updateConnectionState(provider, response.publicKey, type);
        }
      }
    } catch (error) {
      console.error(`Error connecting to ${type}:`, error);
      updateConnectionState(null, null, null);
    }
  }, [updateConnectionState]);

  const disconnectWallet = useCallback(async () => {
    if (!connection.provider || !connection.providerType) return;

    try {
      await connection.provider.disconnect();
      updateConnectionState(null, null, null);
      
      if (!isMobileDevice()) {
        setTimeout(() => window.location.reload(), 100);
      }
    } catch (error) {
      console.error("Error during disconnect:", error);
      updateConnectionState(null, null, null);
    }
  }, [connection.provider, connection.providerType, updateConnectionState]);

  useEffect(() => {
    const provider = connection.provider;
    if (!provider) return;

    const handleAccountChanged = async (publicKey: PublicKey | null) => {
      if (publicKey) {
        updateConnectionState(provider, publicKey, connection.providerType);
      } else {
        if (connection.providerType === 'solflare' && provider.isConnected) {
          const currentKey = await provider.publicKey;
          if (currentKey) {
            updateConnectionState(provider, currentKey, connection.providerType);
            return;
          }
        }
        updateConnectionState(null, null, null);
      }
    };

    const handleDisconnect = () => {
      updateConnectionState(null, null, null);
    };

    if (provider.on) {
      provider.on('connect', handleAccountChanged);
      provider.on('disconnect', handleDisconnect);
      provider.on('accountChanged', handleAccountChanged);

      return () => {
        provider.removeAllListeners?.('connect');
        provider.removeAllListeners?.('disconnect');
        provider.removeAllListeners?.('accountChanged');
      };
    }
  }, [connection.provider, connection.providerType, updateConnectionState]);

  return {
    connection,
    connectWallet,
    disconnectWallet,
    isInAppBrowser: isInAppBrowser(),
    isMobileDevice: isMobileDevice()
  };
};
