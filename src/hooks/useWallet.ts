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
      if (connection.providerType === 'phantom') {
        // Pour Phantom, on force la déconnexion en rechargeant la page
        updateConnectionState(null, null, null);
        window.location.reload();
      } else {
        // Pour les autres wallets (comme Solflare)
        await connection.provider.disconnect();
        updateConnectionState(null, null, null);
      }
    } catch (error) {
      console.error("Error disconnecting:", error);
      // En cas d'erreur, on force quand même la déconnexion
      updateConnectionState(null, null, null);
    }
  }, [connection.provider, connection.providerType, updateConnectionState]);

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
