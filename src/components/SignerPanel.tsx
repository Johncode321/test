import { useEffect } from 'react';
import { WalletConnection } from '../types/wallet';
import { Button } from './Button';
import { MessageInput } from './MessageInput';
import { SignatureDisplay } from './SignatureDisplay';
import { WalletInfo } from './WalletInfo';
import { MessageCircle, Wallet, PenSquare, ExternalLink } from 'lucide-react';
import { isMobileDevice } from '../utils/wallet';

interface SignerPanelProps {
  connection: WalletConnection;
  message: string;
  signature: string;
  onMessageChange: (message: string) => void;
  onConnect: (type: 'phantom' | 'solflare') => void;
  onDisconnect: () => void;
  onSign: () => void;
  onCopySignature: () => void;
}

export const SignerPanel = ({
  connection,
  message,
  signature,
  onMessageChange,
  onConnect,
  onDisconnect,
  onSign,
  onCopySignature,
}: SignerPanelProps) => {
  const isMobile = isMobileDevice();
  const isConnected = !!connection.publicKey;

  // Log des changements de connexion pour le debug
  useEffect(() => {
    console.log('Connection state changed:', {
      isConnected,
      providerType: connection.providerType,
      publicKey: connection.publicKey?.toBase58(),
      isMobile
    });
  }, [connection, isConnected, isMobile]);

  return (
    <div className="w-full max-w-md bg-gray-800/50 backdrop-blur-lg p-8 rounded-2xl border border-gray-700 shadow-xl">
      {!isConnected ? (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Solana Message Signer</h1>
            <p className="text-gray-400 text-sm">
              {isMobile 
                ? "Open in your preferred wallet"
                : "Choose your preferred wallet to continue"}
            </p>
          </div>
          
          <Button 
            variant="primary" 
            onClick={() => onConnect('phantom')}
            className="bg-gradient-to-r from-purple-600 to-purple-700 flex items-center justify-center gap-2"
          >
            {isMobile ? (
              <>
                Open in Phantom <ExternalLink size={16} />
              </>
            ) : (
              'Connect Phantom'
            )}
          </Button>
          
          <Button 
            variant="primary" 
            onClick={() => onConnect('solflare')}
            className="bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center gap-2"
          >
            {isMobile ? (
              <>
                Open in Solflare <ExternalLink size={16} />
              </>
            ) : (
              'Connect Solflare'
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <PenSquare size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Sign Message</h2>
              <p className="text-gray-400 text-sm">Connected with {connection.providerType}</p>
            </div>
          </div>
          
          <WalletInfo connection={connection} />
          
          <MessageInput
            value={message}
            onChange={onMessageChange}
          />
          
          <Button
            variant="primary"
            onClick={onSign}
            disabled={!message}
            className="bg-gradient-to-r from-purple-600 to-purple-700"
          >
            Sign Message
          </Button>

          {signature && (
            <SignatureDisplay
              signature={signature}
              onCopy={onCopySignature}
            />
          )}
          
          <Button 
            onClick={onDisconnect}
            className="!bg-transparent border border-gray-600 hover:bg-gray-700/50"
          >
            Disconnect
          </Button>
        </div>
      )}
    </div>
  );
};