import { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { WalletConnection, WalletProvider } from '../types/wallet';
import { getProvider } from '../utils/wallet';

export const useWallet = () => {
  const [connection, setConnection] = useState<WalletConnection>({
    provider: null,
    publicKey: null,
    providerType: null
  });

  // Fonction pour vérifier si le wallet est déjà connecté
  const checkWalletConnection = async (provider: any) => {
    try {
      const resp = await provider.connect({ onlyIfTrusted: true });
      return resp.publicKey;
    } catch (error) {
      return null;
    }
  };

  const connectWallet = async (type: WalletProvider) => {
    const provider = getProvider(type);
    if (!provider) {
      alert(`${type} wallet not found. Please install the extension.`);
      return;
    }

    try {
      // D'abord vérifions si nous sommes déjà connectés
      let publicKey = await checkWalletConnection(provider);
      
      if (!publicKey) {
        // Si nous ne sommes pas connectés, demandons une nouvelle connexion
        const response = await provider.connect();
        publicKey = response.publicKey;
      }

      // Mise à jour immédiate de l'état
      setConnection({
        provider,
        publicKey,
        providerType: type
      });
    } catch (error) {
      console.error(`Error connecting to ${type}:`, error);
    }
  };

  const disconnectWallet = async () => {
    if (!connection.provider) return;
    try {
      await connection.provider.disconnect();
      setConnection({ provider: null, publicKey: null, providerType: null });
    } catch (error) {
      console.error("Error disconnecting:", error);
    }
  };

  useEffect(() => {
    if (!connection.provider) return;

    const handleConnect = (publicKey: PublicKey) => {
      setConnection(prev => ({ ...prev, publicKey }));
    };

    const handleDisconnect = () => {
      setConnection({ provider: null, publicKey: null, providerType: null });
    };

    const handleAccountChanged = (publicKey: PublicKey | null) => {
      if (publicKey) {
        setConnection(prev => ({ ...prev, publicKey }));
      } else {
        setConnection(prev => ({ ...prev, publicKey: null }));
      }
    };

    // Ajout des listeners
    connection.provider.on('connect', handleConnect);
    connection.provider.on('disconnect', handleDisconnect);
    connection.provider.on('accountChanged', handleAccountChanged);

    // Vérifie la connexion initiale
    checkWalletConnection(connection.provider)
      .then(publicKey => {
        if (publicKey) {
          setConnection(prev => ({ ...prev, publicKey }));
        }
      });

    // Cleanup
    return () => {
      if (connection.provider) {
        connection.provider.removeListener('connect', handleConnect);
        connection.provider.removeListener('disconnect', handleDisconnect);
        connection.provider.removeListener('accountChanged', handleAccountChanged);
      }
    };
  }, [connection.provider]);

  return {
    connection,
    connectWallet,
    disconnectWallet
  };
};
