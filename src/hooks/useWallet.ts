\import { useState, useEffect, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import { WalletConnection, WalletProvider } from '../types/wallet';
import { getProvider, isMobileDevice, handleMobileRedirect } from '../utils/wallet';

interface PhantomProvider {
  publicKey: PublicKey | null;
  isConnected: boolean | null;
  signMessage: (message: Uint8Array | string, display?: 'utf8' | 'hex') => Promise<any>;
  connect: (opts?: Partial<{ onlyIfTrusted: boolean }>) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: string, handler: (args: any) => void) => void;
  request: (method: string, params: any) => Promise<unknown>;
  removeAllListeners?: (event: string) => void;
  removeListener: (event: string, handler: (args: any) => void) => void;
}

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
      // Vérifier si mobile et gérer la redirection si nécessaire
      if (handleMobileRedirect(type)) {
        return;
      }

      const provider = getProvider(type);
      if (!provider) return;

      // Mettre à jour le provider
      updateConnectionState(provider, null, type);

      // Tenter la connexion
      const response = await provider.connect();
      
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
      await connection.provider.disconnect();
      
      if (isMobileDevice()) {
        // Forcer un rechargement sur mobile après déconnexion
        setTimeout(() => window.location.reload(), 100);
      }

      updateConnectionState(null, null, null);
    } catch (error) {
      console.error("Error during disconnect:", error);
      updateConnectionState(null, null, null);
    }
  }, [connection.provider, connection.providerType, updateConnectionState]);

  // Gérer les événements de wallet
  useEffect(() => {
    const provider = connection.provider;
    if (!provider) return;

    const handleAccountChanged = (publicKey: PublicKey | null) => {
      updateConnectionState(provider, publicKey, connection.providerType);
    };

    const handleDisconnect = () => {
      updateConnectionState(null, null, null);
    };

    // Ajouter les écouteurs d'événements
    provider.on('connect', (publicKey: PublicKey) => handleAccountChanged(publicKey));
    provider.on('disconnect', handleDisconnect);
    provider.on('accountChanged', handleAccountChanged);

    return () => {
      if (provider.removeAllListeners) {
        provider.removeAllListeners('connect');
        provider.removeAllListeners('disconnect');
        provider.removeAllListeners('accountChanged');
      } else {
        provider.removeListener('connect', handleAccountChanged);
        provider.removeListener('disconnect', handleDisconnect);
        provider.removeListener('accountChanged', handleAccountChanged);
      }
    };
  }, [connection.provider, connection.providerType, updateConnectionState]);

  return {
    connection,
    connectWallet,
    disconnectWallet,
    isMobile: isMobileDevice()
  };
};
