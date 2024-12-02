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

  const connectWallet = useCallback(async (type: WalletProvider) => {
    const provider = getProvider(type);
    if (!provider) {
      alert(`${type} wallet not found. Please install the extension.`);
      return;
    }

    try {
      // Tenter de se connecter et obtenir la clé publique
      const response = await provider.connect();
      
      // Mise à jour immédiate et complète de l'état
      setConnection({
        provider,
        publicKey: response.publicKey,
        providerType: type
      });
    } catch (error) {
      console.error(`Error connecting to ${type}:`, error);
      // En cas d'erreur, réinitialiser l'état
      setConnection({
        provider: null,
        publicKey: null,
        providerType: null
      });
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    if (!connection.provider) return;
    
    try {
      await connection.provider.disconnect();
      setConnection({
        provider: null,
        publicKey: null,
        providerType: null
      });
    } catch (error) {
      console.error("Error disconnecting:", error);
    }
  }, [connection.provider]);

  useEffect(() => {
    if (!connection.provider) return;

    const handleAccountChanged = (publicKey: PublicKey | null) => {
      setConnection(prev => ({
        ...prev,
        publicKey: publicKey
      }));
    };

    const handleDisconnect = () => {
      setConnection({
        provider: null,
        publicKey: null,
        providerType: null
      });
    };

    // Ajouter les écouteurs d'événements
    connection.provider.on('accountChanged', handleAccountChanged);
    connection.provider.on('disconnect', handleDisconnect);

    // Vérifier si nous avons déjà une connexion active
    if (connection.provider.isConnected) {
      connection.provider.publicKey && handleAccountChanged(connection.provider.publicKey);
    }

    // Nettoyage lors du démontage
    return () => {
      if (connection.provider) {
        connection.provider.removeListener('accountChanged', handleAccountChanged);
        connection.provider.removeListener('disconnect', handleDisconnect);
      }
    };
  }, [connection.provider]);

  return {
    connection,
    connectWallet,
    disconnectWallet
  };
};
