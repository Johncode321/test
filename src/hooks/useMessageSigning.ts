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
    
    console.log("Provider type:", connection.providerType);
    console.log("Available methods on provider:", Object.keys(connection.provider));

    try {
      const encodedMessage = new TextEncoder().encode(message);

      if (connection.providerType === 'backpack') {
        try {
          // Log toutes les méthodes disponibles
          console.log("Backpack provider methods:", Object.getOwnPropertyNames(connection.provider));
          console.log("Is provider connected?", connection.provider.isConnected);
          console.log("Public key:", connection.provider.publicKey?.toString());
          
          // Essayer la méthode de signature standard
          console.log("Attempting standard signature...");
          const signedData = await connection.provider.signMessage(encodedMessage);
          console.log("Standard signature result:", signedData);

          setSignature(signedData.toString());
        } catch (error) {
          console.error("Failed with standard signature, error:", error);
          
          try {
            // Essayer la méthode alternative
            console.log("Attempting alternative signature...");
            const signedData = await connection.provider.sign(encodedMessage);
            console.log("Alternative signature result:", signedData);
            
            setSignature(signedData.toString());
          } catch (error) {
            console.error("Alternative method also failed:", error);
            setSignature('');
          }
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
