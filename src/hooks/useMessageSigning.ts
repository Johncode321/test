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
          // Pour Backpack, on doit utiliser directement signMessageBytes
          const signedData = await connection.provider.signMessageBytes(encodedMessage);
          console.log("Backpack signature raw response:", signedData);

          if (signedData && signedData.length > 0) {
            const base58Signature = encode(signedData);
            console.log("Backpack encoded signature:", base58Signature);
            setSignature(base58Signature);
          } else {
            console.error("Invalid signature data from Backpack");
            throw new Error("Invalid signature data");
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
