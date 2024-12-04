// src/components/SignerPanel.tsx
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { MessageInput } from './MessageInput';
import { SignatureDisplay } from './SignatureDisplay';
import { WalletInfo } from './WalletInfo';
import { PenSquare } from 'lucide-react';
import { WalletConnection } from '../types/wallet';

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
  onDisconnect,
  onSign,
  onCopySignature,
}: SignerPanelProps) => {
  const isConnected = !!connection.publicKey;

  return (
    <div className="w-full max-w-md bg-gray-800/50 backdrop-blur-lg p-8 rounded-2xl border border-gray-700 shadow-xl">
      {!isConnected ? (
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Solana Message Signer</h1>
            <p className="text-gray-400 text-sm">Connect your wallet to continue</p>
          </div>
          <div className="flex justify-center">
            <WalletMultiButton />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <PenSquare size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Sign Message</h2>
              <p className="text-gray-400 text-sm">Connected with wallet</p>
            </div>
          </div>
          
          <WalletInfo connection={connection} />
          
          <MessageInput
            value={message}
            onChange={onMessageChange}
          />
          
          <button
            onClick={onSign}
            disabled={!message}
            className="w-full px-6 py-3.5 rounded-xl text-sm font-medium 
              bg-gradient-to-r from-purple-600 to-purple-700 
              text-white shadow-lg shadow-purple-600/20
              disabled:opacity-50 disabled:cursor-not-allowed
              transform active:scale-[0.98] transition-all duration-200"
          >
            Sign Message
          </button>

          {signature && (
            <SignatureDisplay
              signature={signature}
              onCopy={onCopySignature}
            />
          )}
          
          <button 
            onClick={onDisconnect}
            className="w-full px-6 py-3.5 rounded-xl text-sm font-medium
              bg-transparent border border-gray-600 text-white
              hover:bg-gray-700/50 transform active:scale-[0.98] 
              transition-all duration-200"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};
