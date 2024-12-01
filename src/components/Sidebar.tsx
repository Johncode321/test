import { WalletConnection } from '../types/wallet';
import { Button } from './Button';
import { MessageInput } from './MessageInput';
import { SignatureDisplay } from './SignatureDisplay';
import { WalletInfo } from './WalletInfo';
import { Wallet, PenSquare } from 'lucide-react';

interface SidebarProps {
  connection: WalletConnection;
  message: string;
  signature: string;
  onMessageChange: (message: string) => void;
  onConnect: (type: 'phantom' | 'solflare') => void;
  onDisconnect: () => void;
  onSign: () => void;
  onCopySignature: () => void;
}

export const Sidebar = ({
  connection,
  message,
  signature,
  onMessageChange,
  onConnect,
  onDisconnect,
  onSign,
  onCopySignature,
}: SidebarProps) => {
  return (
    <div className="w-full md:w-[400px] bg-gray-800/50 backdrop-blur-lg p-6 border-r border-gray-700">
      {!connection.publicKey ? (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet size={24} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
            <p className="text-gray-400 text-sm mt-2">Choose your preferred wallet to continue</p>
          </div>
          <Button 
            variant="primary" 
            onClick={() => onConnect('phantom')}
            className="bg-gradient-to-r from-purple-600 to-purple-700"
          >
            Connect Phantom
          </Button>
          <Button 
            variant="primary" 
            onClick={() => onConnect('solflare')}
            className="bg-gradient-to-r from-orange-500 to-orange-600"
          >
            Connect Solflare
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