// src/hooks/useWallet.ts

import { useState, useEffect, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import { WalletConnection, WalletProvider } from '../types/wallet';
import { getProvider, isInAppBrowser, isSolflareBrowser } from '../utils/wallet';

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
          await new Promise(resolve => setTimeout(resolve, 500));
          
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
      await connection.provider.disconnect();
      updateConnectionState(null, null, null);
      
      if (isInAppBrowser()) {
        setTimeout(() => window.location.reload(), 100);
      }
    } catch (error) {
      console.error("Error during disconnect:", error);
      updateConnectionState(null, null, null);
    }
  }, [connection.provider, connection.providerType, updateConnectionState]);

  // Écouter les changements d'état du wallet
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

    // Ajout des écouteurs d'événements
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
