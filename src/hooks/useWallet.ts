import { useState, useEffect, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import { WalletConnection, WalletProvider } from '../types/wallet';

// Utility functions
const isPhantomBrowser = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('phantom');
};

const isSolflareBrowser = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('solflare');
};

const isBackpackBrowser = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('backpack');
};

const isInAppBrowser = () => {
  return isPhantomBrowser() || isSolflareBrowser() || isBackpackBrowser();
};

// Get provider function
const getProvider = async (type: WalletProvider) => {
  console.log(`Getting provider for ${type}`);
  
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isStandaloneBrowser = !isInAppBrowser();
  const isTelegram = navigator.userAgent.toLowerCase().includes('telegram');

  // Si on est sur mobile mais pas dans un wallet browser
  if (isMobile && isStandaloneBrowser) {
    const dappUrl = 'https://test-beta-rouge-19.vercel.app';
    const encodedUrl = encodeURIComponent(dappUrl);
    const refParam = encodeURIComponent(dappUrl);

    if (type === 'phantom') {
      if (isTelegram) {
        window.location.href = `phantom://browse/${encodedUrl}`;
      } else {
        window.location.href = `https://phantom.app/ul/browse/${encodedUrl}?ref=${refParam}`;
      }
      return null;
    }

    if (type === 'solflare') {
      window.location.href = `https://solflare.com/ul/v1/browse/${encodedUrl}?ref=${refParam}`;
      return null;
    }

    if (type === 'backpack') {
      window.location.href = `https://backpack.app/browse/${encodedUrl}?ref=${refParam}`;
      return null;
    }
  }
  
  // Gestion des in-app browsers
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

    if (type === 'backpack' && isBackpackBrowser()) {
      let attempts = 0;
      while (!window.backpack?.solana && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      return window.backpack?.solana;
    }
  }

  // Pour les navigateurs desktop
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

  // Si on est sur desktop et que le wallet n'est pas installé
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
          if (provider.isConnected) {
            console.log("Backpack already connected, getting publicKey");
            const publicKey = await provider.publicKey;
            if (publicKey) {
              updateConnectionState(provider, publicKey, type);
              return;
            }
          }

          console.log("Attempting Backpack connection");
          const response = await provider.connect();
          await new Promise(resolve => setTimeout(resolve, 200));
          
          const publicKey = response?.publicKey || await provider.publicKey;
          if (publicKey) {
            console.log("Backpack connection successful");
            updateConnectionState(provider, publicKey, type);
          }
        } catch (error) {
          console.error("Backpack specific error:", error);
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
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isSolflareInApp = isSolflareBrowser() && isMobile;
      const isBackpackInApp = isBackpackBrowser() && isMobile;

      if ((connection.providerType === 'solflare' && isSolflareInApp) || 
          (connection.providerType === 'backpack' && isBackpackInApp)) {
        try {
          await connection.provider.disconnect();
          updateConnectionState(null, null, null);
        } catch (error) {
          console.error(`Error disconnecting ${connection.providerType} mobile:`, error);
          updateConnectionState(null, null, null);
        }
      } else {
        await connection.provider.disconnect();
        updateConnectionState(null, null, null);
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
        if ((connection.providerType === 'solflare' || connection.providerType === 'backpack') && provider.isConnected) {
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

// Pour TypeScript: déclaration des types globaux
declare global {
  interface Window {
    phantom?: {
      solana?: any;
    };
    solflare?: any;
    backpack?: {
      solana?: any;
    };
  }
}
