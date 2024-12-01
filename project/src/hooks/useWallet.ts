import { useState, useEffect, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import { WalletProvider, WalletProviderInstance } from '../types/wallet';
import { getProvider } from '../utils/wallet';

export const useWallet = () => {
  const [provider, setProvider] = useState<WalletProviderInstance | null>(null);
  const [providerType, setProviderType] = useState<WalletProvider | null>(null);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [message, setMessage] = useState<string>("");
  const [lastSignature, setLastSignature] = useState<string | null>(null);

  const connectWallet = async (type: WalletProvider) => {
    const walletProvider = getProvider(type);
    if (!walletProvider) {
      alert(`${type} wallet not found. Please install the extension.`);
      return;
    }

    try {
      setProvider(walletProvider);
      setProviderType(type);
      await walletProvider.connect();
    } catch (error: any) {
      alert(`Error connecting to ${type}: ${error.message}`);
    }
  };

  const disconnectWallet = async () => {
    if (!provider) return;
    try {
      await provider.disconnect();
      setPublicKey(null);
      setProvider(null);
      setProviderType(null);
      setLastSignature(null);
    } catch (error: any) {
      alert(`Error disconnecting: ${error.message}`);
    }
  };

  const signMessage = async () => {
    if (!provider || !message) return;
    try {
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await provider.signMessage(encodedMessage, "utf8");
      const base58Signature = bs58.encode(signedMessage.signature);
      setLastSignature(base58Signature);
    } catch (error: any) {
      alert(`Error signing message: ${error.message}`);
    }
  };

  useEffect(() => {
    if (!provider) return;

    provider.on('connect', (publicKey: PublicKey) => {
      setPublicKey(publicKey);
    });

    provider.on('disconnect', () => {
      setPublicKey(null);
      setLastSignature(null);
    });

    provider.on('accountChanged', (publicKey: PublicKey | null) => {
      setPublicKey(publicKey);
      setLastSignature(null);
    });

    return () => {
      provider.disconnect();
    };
  }, [provider]);

  return {
    publicKey: publicKey?.toBase58() || null,
    providerType,
    message,
    lastSignature,
    setMessage,
    connectWallet,
    disconnectWallet,
    signMessage,
  };
};