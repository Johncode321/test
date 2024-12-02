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
      
      // Sur mobile, getProvider retourne null après la redirection
      if (!provider) {
        // Ne pas afficher d'alerte sur mobile
        if (!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) {
          alert(`${type} wallet not found. Please install the extension.`);
        }
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
        const phantom = connection.provider as PhantomProvider;
        
        if (phantom.isConnected) {
          // D'abord essayer la déconnexion standard
          try {
            await phantom.disconnect();
          } catch (e) {
            console.error('Standard disconnect error:', e);
            // Si la déconnexion standard échoue, essayer via request
            try {
              await phantom.request({
                method: "disconnect",
                params: {}
              });
            } catch (e) {
              console.error('Request disconnect error:', e);
            }
          }
        }

        // Nettoyage des écouteurs d'événements
        phantom.removeListener('disconnect', () => {});
        phantom.removeListener('accountChanged', () => {});
      } else {
        // Pour Solflare et autres wallets
        await connection.provider.disconnect();
      }

      // Mise à jour de l'état après la déconnexion
      updateConnectionState(null, null, null);

    } catch (error) {
      console.error("Error during disconnect:", error);
      // Forcer la réinitialisation en cas d'erreur
      updateConnectionState(null, null, null);
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
