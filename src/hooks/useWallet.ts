import { useState, useEffect, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import { WalletConnection, WalletProvider } from '../types/wallet';
import { getProvider } from '../utils/wallet';

export const useWallet = () => {
  const [connection, setConnection] = useState<WalletConnection>({
    provider: null,
    publicKey: null,
    providerType: null
  });

  const updateConnectionState = useCallback((provider: any, publicKey: PublicKey | null, type: WalletProvider | null) => {
    setConnection({
      provider,
      publicKey,
      providerType: type
    });
  }, []);

  const connectWallet = useCallback(async (type: WalletProvider) => {
    try {
      const provider = getProvider(type);
      if (!provider) {
        alert(`${type} wallet not found. Please install the extension.`);
        return;
      }

      // Mettre à jour le provider immédiatement
      updateConnectionState(provider, null, type);

      // Attendre la connexion
      const response = await provider.connect();
      
      // Mettre à jour avec la clé publique une fois connecté
      if (response?.publicKey) {
        updateConnectionState(provider, response.publicKey, type);
      }
    } catch (error) {
      console.error(`Error connecting to ${type}:`, error);
      updateConnectionState(null, null, null);
    }
  }, [updateConnectionState]);

  const disconnectWallet = useCallback(async () => {
    if (!connection.provider || !connection.providerType) return;

    try {
      // Réinitialiser d'abord l'état local
      updateConnectionState(null, null, null);

      if (connection.providerType === 'phantom') {
        try {
          // Forcer la déconnexion de Phantom
          await connection.provider.request({ 
            method: "disconnect" 
          });
        } catch (e) {
          console.error('Error disconnecting Phantom:', e);
        }
      } else {
        // Pour Solflare et autres wallets
        await connection.provider.disconnect();
      }
    } catch (error) {
      console.error("Error disconnecting:", error);
    }
  }, [connection.provider, connection.providerType, updateConnectionState]);

  useEffect(() => {
    const provider = connection.provider;
    if (!provider) return;

    const handleAccountChanged = (publicKey: PublicKey | null) => {
      if (publicKey) {
        updateConnectionState(provider, publicKey, connection.providerType);
      } else {
        updateConnectionState(null, null, null);
      }
    };

    const handleDisconnect = () => {
      updateConnectionState(null, null, null);
    };

    // Écouteurs d'événements spécifiques à Phantom
    if (connection.providerType === 'phantom') {
      provider.on('accountChanged', handleAccountChanged);
      provider.on('disconnect', handleDisconnect);
    } else {
      // Pour Solflare et autres wallets
      provider.on('connect', (publicKey: PublicKey) => handleAccountChanged(publicKey));
      provider.on('disconnect', handleDisconnect);
      provider.on('accountChanged', handleAccountChanged);
    }

    return () => {
      if (connection.providerType === 'phantom') {
        provider.removeListener('accountChanged', handleAccountChanged);
        provider.removeListener('disconnect', handleDisconnect);
      } else {
        provider.removeAllListeners();
      }
    };
  }, [connection.provider, connection.providerType, updateConnectionState]);

  return {
    connection,
    connectWallet,
    disconnectWallet
  };
};
