import { useState, useEffect } from 'react';
import { encode } from 'bs58';
import { WalletConnection } from '../types/wallet';

export const useMessageSigning = (connection: WalletConnection) => {
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');

  // Réinitialiser l'état quand le wallet change
  useEffect(() => {
    setMessage('');
    setSignature('');
  }, [connection.publicKey, connection.providerType]);

  const signMessage = async () => {
    if (!connection.provider || !message) return;
    try {
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await connection.provider.signMessage(encodedMessage, "utf8");
      const base58Signature = encode(signedMessage.signature);
      setSignature(base58Signature);
    } catch (error) {
      console.error("Error signing:", error);
      setSignature(''); // Réinitialiser la signature en cas d'erreur
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
    signMessage,
    copySignature
  };
};
