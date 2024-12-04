// src/hooks/useWallet.ts
import { useState, useEffect, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import { WalletConnection, WalletProvider } from '../types/wallet';

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

      // Si c'est un provider mobile
      if (provider.publicKey instanceof PublicKey) {
        updateConnectionState(provider, provider.publicKey, type);
        return;
      }

      // Pour Solflare
      if (type === 'solflare') {
        if (provider.isConnected) {
          const publicKey = await provider.publicKey;
          if (publicKey) {
            updateConnectionState(provider, publicKey, type);
            return;
          }
        }

        const response = await provider.connect();
        const publicKey = response?.publicKey || await provider.publicKey;
        if (publicKey) {
          updateConnectionState(provider, publicKey, type);
        }
      } else {
        // Pour Phantom
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
      
      if (!isMobileDevice()) {
        setTimeout(() => window.location.reload(), 100);
      }
    } catch (error) {
      console.error("Error during disconnect:", error);
      updateConnectionState(null, null, null);
    }
  }, [connection.provider, connection.providerType, updateConnectionState]);

  useEffect(() => {
    const provider = connection.provider;
    if (!provider) return;

    const handleAccountChanged = async (publicKey: PublicKey | null) => {
      if (publicKey) {
        updateConnectionState(provider, publicKey, connection.providerType);
      } else {
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

    if (provider.on) {
      provider.on('connect', handleAccountChanged);
      provider.on('disconnect', handleDisconnect);
      provider.on('accountChanged', handleAccountChanged);

      return () => {
        provider.removeAllListeners?.('connect');
        provider.removeAllListeners?.('disconnect');
        provider.removeAllListeners?.('accountChanged');
      };
    }
  }, [connection.provider, connection.providerType, updateConnectionState]);

  return {
    connection,
    connectWallet,
    disconnectWallet,
    isInAppBrowser: isInAppBrowser(),
    isMobileDevice: isMobileDevice()
  };
};
