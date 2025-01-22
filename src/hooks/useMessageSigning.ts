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
          console.log("Backpack signature response:", signedData);
          
          // Vérifier si signedData est déjà une chaîne base58
          if (typeof signedData === 'string') {
            setSignature(signedData);
          } 
          // Si c'est un Uint8Array ou un Buffer
          else if (signedData instanceof Uint8Array || Buffer.isBuffer(signedData)) {
            const base58Signature = encode(signedData);
            setSignature(base58Signature);
          }
          // Si c'est un objet avec une propriété signature
          else if (signedData?.signature) {
            const base58Signature = encode(signedData.signature);
            setSignature(base58Signature);
          } else {
            console.error("Unexpected signature format:", signedData);
            throw new Error("Invalid signature format");
          }
        } catch (error) {
          console.error("Backpack signing error:", error);
          setSignature('');
          throw error;
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
