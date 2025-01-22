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
    console.log("Starting signature process with", connection.providerType);

    try {
      const encodedMessage = new TextEncoder().encode(message);

      if (connection.providerType === 'backpack') {
        try {
          console.log("Attempting to sign with Backpack...");
          const signedData = await connection.provider.signMessage(encodedMessage);
          console.log("Raw Backpack signature:", signedData);
          
          // Si c'est déjà une chaîne
          const signature = typeof signedData === 'string' 
            ? signedData 
            : encode(signedData);

          console.log("Final signature:", signature);
          setSignature(signature);
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
