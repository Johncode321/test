import { useState, useEffect, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import { WalletConnection, WalletProvider } from '../types/wallet';
import { getProvider } from '../utils/wallet';

// Définition du type PhantomProvider
type DisplayEncoding = 'utf8' | 'hex';
type PhantomEvent = 'connect' | 'disconnect' | 'accountChanged';
type PhantomRequestMethod =
  | 'connect'
  | 'disconnect'
  | 'signAndSendTransaction'
  | 'signTransaction'
  | 'signAllTransactions'
  | 'signMessage';

interface PhantomProvider {
  publicKey: PublicKey | null;
  isConnected: boolean | null;
  signMessage: (message: Uint8Array | string, display?: DisplayEncoding) => Promise<any>;
  connect: (opts?: Partial<{ onlyIfTrusted: boolean }>) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: PhantomEvent, handler: (args: any) => void) => void;
  request: (method: PhantomRequestMethod, params: any) => Promise<unknown>;
  removeAllListeners?: (event: PhantomEvent) => void;
  removeListener: (event: PhantomEvent, handler: (args: any) => void) => void;
}

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
        const phantom = window.phantom?.solana as PhantomProvider;
        
        try {
          // Déconnexion directe avec le provider global Phantom
          if (phantom?.isConnected) {
            await phantom.request({
              method: "disconnect",
              params: {}
            });
            await phantom.disconnect();
          }
        } catch (e) {
          console.error('Phantom global provider disconnect error:', e);
        }

        try {
          // Déconnexion via le provider stocké dans connection
          if (connection.provider.isConnected) {
            await connection.provider.request({
              method: "disconnect",
              params: {}
            });
            await connection.provider.disconnect();
          }
        } catch (e) {
          console.error('Stored provider disconnect error:', e);
        }
        
        // S'assurer que les listeners sont retirés
        window.phantom?.solana?.removeAllListeners?.('disconnect');
        window.phantom?.solana?.removeAllListeners?.('accountChanged');
        connection.provider.removeAllListeners?.('disconnect');
        connection.provider.removeAllListeners?.('accountChanged');
      } else {
        // Pour Solflare et autres wallets
        await connection.provider.disconnect();
      }

      // Réinitialiser l'état
      updateConnectionState(null, null, null);
      
      // Recharger la page pour s'assurer d'un état propre
      setTimeout(() => {
        window.location.reload();
      }, 50);
      
    } catch (error) {
      console.error("Error disconnecting:", error);
      // Forcer la réinitialisation même en cas d'erreur
      updateConnectionState(null, null, null);
      window.location.reload();
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
