import { useState, useEffect } from 'react';
import { encode } from 'bs58';
import { WalletConnection } from '../types/wallet';

export const useMessageSigning = (connection: WalletConnection) => {
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');

  useEffect(() => {
    setMessage('');
    setSignature('');
  }, [connection.publicKey, connection.providerType]);

  const signMessage = async () => {
    if (!connection.provider || !message) return;
    
    try {
      const encodedMessage = new TextEncoder().encode(message);

      if (connection.providerType === 'backpack') {
        try {
          await new Promise(resolve => setTimeout(resolve, 100));
          const signedMessage = await connection.provider.signMessage(encodedMessage);
          const base58Signature = encode(signedMessage);
          setSignature(base58Signature);
        } catch (error) {
          console.error("Backpack signing error:", error);
          setSignature('');
        }
      } else {
        // Pour Phantom et Solflare
        const signedMessage = await connection.provider.signMessage(encodedMessage, "utf8");
        console.log("Standard wallet signature response:", signedMessage);
        const base58Signature = encode(signedMessage.signature);
        setSignature(base58Signature);
      }
    } catch (error) {
      console.error("Error during signing process:", error);
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
    signMessage,
    copySignature
  };
};
