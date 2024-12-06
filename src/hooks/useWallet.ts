import { useState, useEffect, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import { WalletConnection, WalletProvider } from '../types/wallet';

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

const isMobileBrowser = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const getProvider = async (type: WalletProvider) => {
  console.log(`Getting provider for ${type}`);
  
  const isMobile = isMobileBrowser();

  // Si on est sur mobile et pas dans un in-app browser
  if (isMobile && !isInAppBrowser()) {
    // Injecter le SDK approprié pour le mobile
    if (type === 'solflare') {
      if (!window.solflare) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@solflare-wallet/sdk@1.3.0/dist/index.min.js';
        document.head.appendChild(script);
        await new Promise((resolve) => script.onload = resolve);
      }
      // Utiliser l'API native de Solflare
      const provider = window.solflare;
      try {
        await provider.connect({ forceModal: true });
        return provider;
      } catch (error) {
        console.error('Error connecting to Solflare:', error);
        return null;
      }
    } else {
      // Pour Phantom sur mobile
      const dappUrl = 'https://test-beta-rouge-19.vercel.app';
      const encodedUrl = encodeURIComponent(dappUrl);
      window.location.href = `https://phantom.app/ul/browse/${encodedUrl}`;
      return null;
    }
  }

  // Pour les wallets in-app existants
  if (isInAppBrowser()) {
    if (type === 'phantom' && isPhantomBrowser()) {
      return window.phantom?.solana;
    }
    if (type === 'solflare' && isSolflareBrowser()) {
      return window.solflare;
    }
  }

  // Pour les navigateurs desktop
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

      if (connection.providerType === 'solflare' && isSolflareInApp) {
        try {
          await connection.provider.disconnect();
          updateConnectionState(null, null, null);
        } catch (error) {
          console.error("Error disconnecting Solflare mobile:", error);
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
