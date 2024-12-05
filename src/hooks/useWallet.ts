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

const isInAppBrowser = () => {
  return isPhantomBrowser() || isSolflareBrowser();
};

// Get provider function
const getProvider = async (type: WalletProvider) => {
  console.log(`Getting provider for ${type}`);
  
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isStandaloneBrowser = !isInAppBrowser();

  // Pour Solflare sur mobile
  if (type === 'solflare') {
    try {
      // Détecter si le provider est déjà injecté
      if (window.solflare) {
        return window.solflare;
      }

      // Attendre un peu l'injection naturelle
      await new Promise(resolve => setTimeout(resolve, 100));
      if (window.solflare) {
        return window.solflare;
      }

      // Si on est sur mobile dans un navigateur standard, attendre l'injection
      if (isMobile && isStandaloneBrowser) {
        let attempts = 0;
        while (!window.solflare && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        if (window.solflare) {
          return window.solflare;
        }
      }
      
      // Si toujours pas de provider, rediriger vers l'app
      if (isMobile) {
        const currentUrl = window.location.href;
        const url = encodeURIComponent(currentUrl);
        const params = new URLSearchParams({
          ref: window.location.origin
        });
        window.location.href = `solflare://v1/browse/${url}?${params.toString()}`;
        return null;
      }
    } catch (error) {
      console.error('Error getting Solflare provider:', error);
    }
  }

  // Pour Phantom sur mobile
  if (type === 'phantom') {
    try {
      if (window.phantom?.solana) {
        return window.phantom.solana;
      }

      await new Promise(resolve => setTimeout(resolve, 100));
      if (window.phantom?.solana) {
        return window.phantom.solana;
      }

      if (isMobile && isStandaloneBrowser) {
        let attempts = 0;
        while (!window.phantom?.solana && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        if (window.phantom?.solana) {
          return window.phantom.solana;
        }
      }

      // Si toujours pas de provider, rediriger vers l'app
      if (isMobile) {
        const currentUrl = window.location.href;
        const url = encodeURIComponent(currentUrl);
        window.location.href = `https://phantom.app/ul/browse/${url}?ref=${encodeURIComponent(window.location.origin)}`;
        return null;
      }
    } catch (error) {
      console.error('Error getting Phantom provider:', error);
    }
  }

  // Pour les navigateurs desktop
  try {
    let provider = null;
    if (type === 'solflare') {
      provider = window.solflare;
    } else {
      provider = window?.phantom?.solana;
    }

    if (provider) {
      return provider;
    }
  } catch (error) {
    console.error('Error getting desktop provider:', error);
  }

  // Si on est sur desktop et que le wallet n'est pas installé
  if (!isMobile) {
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

      // Pour Solflare spécifiquement
      if (type === 'solflare') {
        try {
          // Si déjà connecté, mettre à jour l'état
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

      // Pour Solflare sur mobile
      if (connection.providerType === 'solflare' && isSolflareInApp) {
        try {
          await connection.provider.disconnect();
          updateConnectionState(null, null, null);
          // Pas de reload pour mobile
        } catch (error) {
          console.error("Error disconnecting Solflare mobile:", error);
          // Force disconnect
          updateConnectionState(null, null, null);
        }
      } else {
        // Pour desktop et autres wallets
        await connection.provider.disconnect();
        updateConnectionState(null, null, null);
        setTimeout(() => window.location.reload(), 100);
      }
    } catch (error) {
      console.error("Error during disconnect:", error);
      updateConnectionState(null, null, null);
    }
  }, [connection.provider, connection.providerType, updateConnectionState]);

  // Event listeners
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
