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
          const signedData = await connection.provider.signMessage(encodedMessage);
          console.log("Backpack signature response:", signedData);
          
          // Vérifions la structure de l'objet reçu
          if (signedData && typeof signedData === 'object') {
            // Si c'est un Uint8Array ou Buffer
            if (signedData instanceof Uint8Array) {
              const base58Signature = encode(signedData);
              setSignature(base58Signature);
            }
            // Si c'est un objet avec une propriété signature
            else if ('signature' in signedData) {
              const base58Signature = encode(signedData.signature);
              setSignature(base58Signature);
            }
            // Si c'est un objet avec des données brutes
            else if ('data' in signedData) {
              const base58Signature = encode(signedData.data);
              setSignature(base58Signature);
            }
            // Autres propriétés possibles
            else {
              const possibleKeys = ['signatures', 'signed', 'signatureBytes'];
              for (const key of possibleKeys) {
                if (key in signedData && signedData[key]) {
                  const base58Signature = encode(signedData[key]);
                  setSignature(base58Signature);
                  break;
                }
              }
            }
          }
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
