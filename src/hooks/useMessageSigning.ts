// src/hooks/useMessageSigning.ts
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import base58 from 'bs58';

export const useMessageSigning = () => {
  const { signMessage } = useWallet();
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');

  const signMessageWithAdapter = async () => {
    try {
      if (!signMessage || !message) return;

      const encodedMessage = new TextEncoder().encode(message);
      const signatureBytes = await signMessage(encodedMessage);
      const base58Signature = base58.encode(signatureBytes);
      setSignature(base58Signature);
    } catch (error) {
      console.error('Error signing message:', error);
      setSignature('');
    }
  };

  const copySignature = async () => {
    if (signature) {
      await navigator.clipboard.writeText(signature);
    }
  };

  return {
    message,
    signature,
    setMessage,
    signMessageWithAdapter,
    copySignature
  };
};
