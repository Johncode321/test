// src/hooks/useWallet.ts

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
  
  // Si nous sommes dans le navigateur in-app
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

  // Pour les navigateurs desktop normaux
  try {
    let desktopProvider = null;
    if (type === 'phantom') {
      desktopProvider = window?.phantom?.solana;
    } else if (type === 'solflare') {
      let attempts = 0;
      while (!window.solflare && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      desktopProvider = window.solflare;
    }
    
    if (desktopProvider) {
      console.log(`Desktop provider found for ${type}`);
      
      if (type === 'solflare') {
        // Attendre un peu que le provider soit complètement initialisé
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Vérifier si le provider est prêt
        if (typeof desktopProvider.isConnected === 'undefined') {
          console.log('Solflare provider not ready, redirecting to download');
          window.open('https://solflare.com/download', '_blank');
          return null;
        }
      }
      
      return desktopProvider;
    }
  } catch (error) {
    console.error('Error getting desktop provider:', error);
  }

  // Pour mobile ou si le wallet n'est pas installé
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    const dappUrl = window.location.href;
    const encodedUrl = encodeURIComponent(dappUrl);
    
    if (type === 'phantom') {
      window.location.href = `https://phantom.app/ul/browse/${encodedUrl}`;
    } else if (type === 'solflare') {
      window.location.href = `https://solflare.com/ul/v1/browse/${encodedUrl}`;
    }
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

      // Pour Solflare spécifiquement
      if (type === 'solflare') {
        try {
          // Vérifier d'abord si déjà connecté
          if (provider.isConnected) {
            const publicKey = await provider.publicKey;
            if (publicKey) {
              console.log("Solflare already connected, updating state");
              updateConnectionState(provider, publicKey, type);
              return;
            }
          }

          // Si non connecté, tenter la connexion
          console.log("Attempting Solflare connection");
          const response = await provider.connect();
          
          // Attendre un peu pour s'assurer que la connexion est établie
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Vérifier à nouveau la connexion
          const publicKey = await provider.publicKey;
          if (publicKey) {
            console.log("Solflare connection successful");
            updateConnectionState(provider, publicKey, type);
            return;
          }
        } catch (error) {
          console.error("Solflare specific error:", error);
          throw error;
        }
      } 
      
      // Pour les autres wallets (Phantom, etc.)
      else {
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
      // Détecter si on est sur mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isSolflareInApp = isSolflareBrowser() && isMobile;

      if (connection.providerType === 'solflare') {
        if (isSolflareInApp) {
          // Pour Solflare mobile in-app browser
          await connection.provider.disconnect();
          // Réinitialiser l'état local
          updateConnectionState(null, null, null);
          // Ne pas recharger la page sur mobile in-app
        } else {
          // Pour Solflare desktop
          updateConnectionState(null, null, null);
          setTimeout(() => {
            window.location.reload();
          }, 100);
        }
      } else {
        // Pour les autres wallets (comme Phantom)
        await connection.provider.disconnect();
        updateConnectionState(null, null, null);
      }
    } catch (error) {
      console.error("Error during disconnect:", error);
      // En cas d'erreur, forcer la déconnexion sans reload sur mobile
      updateConnectionState(null, null, null);
      if (!isMobile) {
        window.location.reload();
      }
    }
  }, [connection.provider, connection.providerType, updateConnectionState]);

  useEffect(() => {
    const provider = connection.provider;
    if (!provider) return;

    const handleAccountChanged = async (publicKey: PublicKey | null) => {
      if (publicKey) {
        updateConnectionState(provider, publicKey, connection.providerType);
      } else {
        // Si publicKey est null, vérifier si toujours connecté (pour Solflare)
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

  // Effet pour vérifier la connexion automatiquement au chargement
  useEffect(() => {
    const checkInitialConnection = async () => {
      if (window.solflare && window.solflare.isConnected) {
        try {
          const publicKey = await window.solflare.publicKey;
          if (publicKey) {
            updateConnectionState(window.solflare, publicKey, 'solflare');
          }
        } catch (error) {
          console.error("Error checking initial Solflare connection:", error);
        }
      }
    };

    checkInitialConnection();
  }, [updateConnectionState]);

  return {
    connection,
    connectWallet,
    disconnectWallet,
    isInAppBrowser: isInAppBrowser()
  };
};
