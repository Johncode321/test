import { useState, useEffect, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import { WalletConnection, WalletProvider } from '../types/wallet';

const isPhantomBrowser = () => navigator.userAgent.toLowerCase().includes('phantom');
const isSolflareBrowser = () => navigator.userAgent.toLowerCase().includes('solflare');
const isBackpackBrowser = () => navigator.userAgent.toLowerCase().includes('backpack');
const isTrustWalletBrowser = () => navigator.userAgent.toLowerCase().includes('trust');
const isAtomicBrowser = () => navigator.userAgent.toLowerCase().includes('atomicwallet');
const isInAppBrowser = () => isPhantomBrowser() || isSolflareBrowser() || isBackpackBrowser() || isTrustWalletBrowser() || isAtomicBrowser();

const getProvider = async (type: WalletProvider) => {
  console.log(`Getting provider for ${type}`);

if (type === 'atomic') {
  try {
    // Check for atomic chrome extension
    const provider = window?.atomicwallet?.solana;
    
    if (provider) {
      console.log("Atomic provider found");
      return provider;
    }

    const atomicExtensionId = "eccldaafcjkhcbmjoliioedageeccgip";
    const extensionUrl = `chrome-extension://${atomicExtensionId}/index.html`;
    
    // Open Atomic extension if installed
    fetch(extensionUrl)
      .then(() => {
        window.location.href = `chrome-extension://${atomicExtensionId}/index.html`;
      })
      .catch(() => {
        // Extension not found, redirect to download page
        window.open('https://atomicwallet.io/download', '_blank');
      });
    
    return null;
  } catch (error) {
    console.error('Error getting Atomic provider:', error);
    return null;
  }
}
  
  if (type === 'backpack') {
    try {
      let attempts = 0;
      while (!window.backpack?.solana && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      if (window.backpack?.solana) {
        return window.backpack.solana;
      }
      window.open('https://www.backpack.app/download', '_blank');
      return null;
    } catch (error) {
      console.error('Error getting Backpack provider:', error);
      return null;
    }
  }

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isStandaloneBrowser = !isInAppBrowser();
  const isTelegram = navigator.userAgent.toLowerCase().includes('telegram');

  if (isMobile && isStandaloneBrowser) {
    const dappUrl = 'https://test-beta-rouge-19.vercel.app';
    const encodedUrl = encodeURIComponent(dappUrl);
    const refParam = encodeURIComponent(dappUrl);

    if (type === 'phantom') {
      window.location.href = isTelegram 
        ? `phantom://browse/${encodedUrl}`
        : `https://phantom.app/ul/browse/${encodedUrl}?ref=${refParam}`;
      return null;
    }

    if (type === 'solflare') {
      window.location.href = `https://solflare.com/ul/v1/browse/${encodedUrl}?ref=${refParam}`;
      return null;
    }

    if (type === 'trustwallet') {
      window.location.href = `https://link.trustwallet.com/open_url?coin=501&url=${encodedUrl}`;
      return null;
    }
  }

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

    if (type === 'trustwallet' && isTrustWalletBrowser()) {
      let attempts = 0;
      while (!window.trustwallet?.solana && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      return window.trustwallet?.solana;
    }

    if (type === 'atomic' && isAtomicBrowser()) {
      let attempts = 0;
      while (!window.atomicwallet?.solana && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      return window.atomicwallet?.solana;
    }
  }

  try {
    let provider = null;
    if (type === 'solflare') {
      let attempts = 0;
      while (!window.solflare && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      provider = window.solflare;
    } else if (type === 'backpack') {
      let attempts = 0;
      while (!window.backpack?.solana && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      provider = window.backpack?.solana;
    } else if (type === 'trustwallet') {
      let attempts = 0;
      while (!window.trustwallet?.solana && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      provider = window.trustwallet?.solana;
    } else if (type === 'atomic') {
      let attempts = 0;
      while (!window.atomicwallet?.solana && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      provider = window.atomicwallet?.solana;
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

  if (!isMobile) {
    const downloadUrls = {
      phantom: 'https://phantom.app/download',
      solflare: 'https://solflare.com/download',
      backpack: 'https://www.backpack.app/download',
      trustwallet: 'https://trustwallet.com/download',
      atomic: 'https://atomicwallet.io/download'
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

      if (type === 'solflare') {
        try {
          if (provider.isConnected) {
            console.log("Solflare already connected, getting publicKey");
            const publicKey = await provider.publicKey;
            if (publicKey) {
              updateConnectionState(provider, publicKey, type);
              return;
            }
          }

          console.log("Attempting Solflare connection");
          const response = await provider.connect();
          await new Promise(resolve => setTimeout(resolve, 200));
          
          const publicKey = response?.publicKey || await provider.publicKey;
          if (publicKey) {
            console.log("Solflare connection successful");
            updateConnectionState(provider, publicKey, type);
          }
        } catch (error) {
          console.error("Solflare specific error:", error);
          throw error;
        }
      } else if (type === 'backpack') {
        try {
          console.log("Attempting Backpack connection");
          let publicKey = await provider.publicKey;
          
          if (!publicKey) {
            const response = await provider.connect();
            publicKey = response?.publicKey;
          }

          if (publicKey) {
            console.log("Backpack connection successful");
            updateConnectionState(provider, publicKey, type);
          }
        } catch (error) {
          console.error("Backpack specific error:", error);
          throw error;
        }
      } else if (type === 'trustwallet') {
        try {
          console.log("Attempting Trust Wallet connection");
          let publicKey = await provider.publicKey;
          
          if (!publicKey) {
            const response = await provider.connect();
            publicKey = response?.publicKey;
          }

          if (publicKey) {
            console.log("Trust Wallet connection successful");
            updateConnectionState(provider, publicKey, type);
          }
        } catch (error) {
          console.error("Trust Wallet specific error:", error);
          throw error;
        }
      } else if (type === 'atomic') {
        try {
          console.log("Attempting Atomic Wallet connection");
          let publicKey = await provider.publicKey;
          
          if (!publicKey) {
            const response = await provider.connect();
            publicKey = response?.publicKey;
          }

          if (publicKey) {
            console.log("Atomic Wallet connection successful");
            updateConnectionState(provider, publicKey, type);
          }
        } catch (error) {
          console.error("Atomic specific error:", error);
          throw error;
        }
      } else {
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
    } catch (error) {
      console.error("Error during disconnect:", error);
      updateConnectionState(null, null, null);
    }
  }, [connection.provider, connection.providerType, updateConnectionState]);

  useEffect(() => {
    const provider = connection.provider;
    if (!provider) return;

    const handleAccountChanged = async (publicKey: PublicKey | null) => {
      if (connection.providerType === 'backpack') {
        try {
          const isConnected = await provider.isConnected;
          const isUnlocked = await provider.publicKey;
          
          if (isConnected && isUnlocked) {
            updateConnectionState(provider, isUnlocked, connection.providerType);
            return;
          }
          
          updateConnectionState(provider, null, connection.providerType);
        } catch (error) {
          console.error("Error handling Backpack state change:", error);
          updateConnectionState(null, null, null);
        }
      } else if (publicKey) {
        updateConnectionState(provider, publicKey, connection.providerType);
      } else {
        updateConnectionState(null, null, null);
      }
    };

    const handleDisconnect = async () => {
      if (connection.providerType === 'backpack') {
        try {
          const isStillConnected = await provider.isConnected;
          if (isStillConnected) {
            const currentKey = await provider.publicKey;
            if (currentKey) {
              updateConnectionState(provider, currentKey, connection.providerType);
              return;
            }
          }
        } catch (error) {
          console.error("Error checking Backpack connection status:", error);
        }
      }
      updateConnectionState(null, null, null);
    };

    provider.on('connect', handleAccountChanged);
    provider.on('disconnect', handleDisconnect);
    provider.on('accountChanged', handleAccountChanged);

    return () => {
      provider.removeAllListeners?.('connect');
      provider.removeAllListeners?.('disconnect');
      provider.removeAllListeners?.('accountChanged');
    };
  }, [connection.provider, connection.providerType, updateConnectionState]);

  return {
    connection,
    connectWallet,
    disconnectWallet,
    isInAppBrowser: isInAppBrowser()
  };
};
