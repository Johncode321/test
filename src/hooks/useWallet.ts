import { useState, useEffect, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import { WalletConnection, WalletProvider } from '../types/wallet';

const isPhantomBrowser = () => navigator.userAgent.toLowerCase().includes('phantom');
const isSolflareBrowser = () => navigator.userAgent.toLowerCase().includes('solflare');
const isBackpackBrowser = () => navigator.userAgent.toLowerCase().includes('backpack');
const isInAppBrowser = () => isPhantomBrowser() || isSolflareBrowser() || isBackpackBrowser();

const getProvider = async (type: WalletProvider) => {
  console.log(`Getting provider for ${type}`);
  
  if (type === 'backpack') {
    try {
      let attempts = 0;
      while (!window.backpack?.solana && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      return window.backpack?.solana || (window.open('https://www.backpack.app/download', '_blank'), null);
    } catch (error) {
      console.error('Error getting Backpack provider:', error);
      return null;
    }
  }

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isStandalone = !isInAppBrowser();
  const isTelegram = navigator.userAgent.toLowerCase().includes('telegram');
  const dappUrl = 'https://test-beta-rouge-19.vercel.app';
  const encodedUrl = encodeURIComponent(dappUrl);

  if (isMobile && isStandalone) {
    if (type === 'phantom') {
      window.location.href = isTelegram 
        ? `phantom://browse/${encodedUrl}`
        : `https://phantom.app/ul/browse/${encodedUrl}?ref=${encodedUrl}`;
      return null;
    }
    if (type === 'solflare') {
      window.location.href = `https://solflare.com/ul/v1/browse/${encodedUrl}?ref=${encodedUrl}`;
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
      backpack: 'https://www.backpack.app/download'
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
    setConnection({ provider, publicKey, providerType: type });
  }, []);

  const connectWallet = useCallback(async (type: WalletProvider) => {
    try {
      const provider = await getProvider(type);
      if (!provider) return;

      if (type === 'solflare') {
        if (provider.isConnected) {
          const publicKey = await provider.publicKey;
          if (publicKey) {
            updateConnectionState(provider, publicKey, type);
            return;
          }
        }
        const response = await provider.connect();
        await new Promise(resolve => setTimeout(resolve, 200));
        const publicKey = response?.publicKey || await provider.publicKey;
        if (publicKey) {
          updateConnectionState(provider, publicKey, type);
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
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isSolflareInApp = isSolflareBrowser() && isMobile;

      await connection.provider.disconnect();
      updateConnectionState(null, null, null);

      if (window.localStorage) {
        const walletKeys = ['walletName', 'wallet', 'backpack', 'phantom', 'solflare'];
        walletKeys.forEach(key => window.localStorage.removeItem(key));
      }

      if (!isSolflareInApp) {
        // Force UI update without page reload
        setConnection(prev => ({ ...prev }));
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

    const handleDisconnect = () => updateConnectionState(null, null, null);

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
