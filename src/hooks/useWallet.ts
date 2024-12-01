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

  const connectWallet = async (type: WalletProvider) => {
    const provider = getProvider(type);
    if (!provider) {
      alert(`${type} wallet not found. Please install the extension.`);
      return;
    }

    try {
      await provider.connect();
      setConnection(prev => ({ ...prev, provider, providerType: type }));
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
      setConnection(prev => ({ ...prev, publicKey: null }));
    };

    const handleAccountChanged = (publicKey: PublicKey | null) => {
      setConnection(prev => ({ ...prev, publicKey }));
    };

    connection.provider.on('connect', handleConnect);
    connection.provider.on('disconnect', handleDisconnect);
    connection.provider.on('accountChanged', handleAccountChanged);

    return () => {
      connection.provider.disconnect();
    };
  }, [connection.provider]);

  return {
    connection,
    connectWallet,
    disconnectWallet
  };
};