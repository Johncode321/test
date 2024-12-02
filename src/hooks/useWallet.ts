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

      // Vérifier si le wallet est déjà connecté
      if (provider.isConnected && provider.publicKey) {
        updateConnectionState(provider, provider.publicKey, type);
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
    if (!connection.provider) return;

    try {
      await connection.provider.disconnect();
      updateConnectionState(null, null, null);
    } catch (error) {
      console.error("Error disconnecting:", error);
    }
  }, [connection.provider, updateConnectionState]);

  useEffect(() => {
    const provider = connection.provider;
    if (!provider) return;

    const handleAccountChanged = (publicKey: PublicKey | null) => {
      updateConnectionState(provider, publicKey, connection.providerType);
    };

    const handleConnect = (publicKey: PublicKey) => {
      updateConnectionState(provider, publicKey, connection.providerType);
    };

    const handleDisconnect = () => {
      updateConnectionState(null, null, null);
    };

    provider.on('connect', handleConnect);
    provider.on('disconnect', handleDisconnect);
    provider.on('accountChanged', handleAccountChanged);

    // Si déjà connecté, mettre à jour l'état
    if (provider.isConnected && provider.publicKey) {
      handleConnect(provider.publicKey);
    }

    return () => {
      provider.removeListener('connect', handleConnect);
      provider.removeListener('disconnect', handleDisconnect);
      provider.removeListener('accountChanged', handleAccountChanged);
    };
  }, [connection.provider, connection.providerType, updateConnectionState]);

  return {
    connection,
    connectWallet,
    disconnectWallet
  };
};
