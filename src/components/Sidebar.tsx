import { WalletConnection } from '../types/wallet';
import { Button } from './Button';
import { MessageInput } from './MessageInput';
import { SignatureDisplay } from './SignatureDisplay';
import { WalletInfo } from './WalletInfo';
import { SolanaLogo } from './SolanaLogo';

import phantomLogo from '../assets/phantom_logo.svg';
import solflareLogo from '../assets/solflare_logo.svg';
import phantomIcon from '../assets/phantom.svg';
import solflareIcon from '../assets/solflare.svg';

// Define wallet options with their styles
const walletOptions = [
  {
    id: 'phantom',
    name: 'Phantom',
    logo: phantomLogo,
    bgColor: 'bg-[#ab9ff2]'
  },
  {
    id: 'solflare',
    name: 'Solflare',
    logo: solflareLogo,
    bgColor: 'bg-[#fc7227]'
  },
  {
    id: 'backpack',
    name: 'Backpack',
    logo: "/api/placeholder/24/24",  // Placeholder for now
    bgColor: 'bg-[#6C5CE7]'
  },
  {
    id: 'atomic',
    name: 'Atomic',
    logo: "/api/placeholder/24/24",
    bgColor: 'bg-[#2ecc71]'
  },
  {
    id: 'exodus',
    name: 'Exodus',
    logo: "/api/placeholder/24/24",
    bgColor: 'bg-[#3498db]'
  },
  {
    id: 'mathwallet',
    name: 'Math Wallet',
    logo: "/api/placeholder/24/24",
    bgColor: 'bg-[#e74c3c]'
  },
  {
    id: 'trustwallet',
    name: 'Trust Wallet',
    logo: "/api/placeholder/24/24",
    bgColor: 'bg-[#3498db]'
  },
  {
    id: 'metamask',
    name: 'MetaMask',
    logo: "/api/placeholder/24/24",
    bgColor: 'bg-[#f39c12]'
  }
];

interface SignerPanelProps {
  connection: WalletConnection;
  message: string;
  signature: string;
  onMessageChange: (message: string) => void;
  onConnect: (type: WalletProvider) => void;
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
  const isConnected = !!connection.publicKey;

  const renderWalletButton = (wallet: WalletInfo) => (
    <Button 
      key={wallet.id}
      variant="primary" 
      onClick={() => onConnect(wallet.id)}
      className={`${wallet.bgColor} flex items-center justify-center gap-2`}
    >
      <img 
        src={wallet.logo} 
        alt={`${wallet.name} logo`} 
        className="w-6 h-6" 
      />
      Open with {wallet.name}
    </Button>
  );

  return (
    <div className="w-full max-w-md bg-gray-800/50 backdrop-blur-lg p-8 rounded-2xl border border-gray-700 shadow-xl">
      {!isConnected ? (
        <div className="space-y-6">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <SolanaLogo className="w-20 h-20" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Solana Message Signer</h1>
            <p className="text-gray-400 text-sm">
              Connect your wallet to sign messages securely
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {walletOptions.map(renderWalletButton)}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Connected wallet UI remains the same */}
          <div className="flex items-center gap-3 mb-6">
            <img 
              src={connection.providerType === 'phantom' ? phantomIcon : solflareIcon} 
              alt={`${connection.providerType} Logo`}
              className="w-10 h-10" 
            />
            <div>
              <h2 className="text-lg font-bold text-white">Sign Message</h2>
              <p className="text-gray-400 text-sm">Connected with {connection.providerType}</p>
            </div>
          </div>
          
          <WalletInfo connection={connection} />
          
          <MessageInput
            value={message}
            onChange={onMessageChange}
            providerType={connection.providerType}
          />
          
          <Button
            variant="primary"
            onClick={onSign}
            disabled={!message}
            className={connection.providerType === 'phantom' ? 'bg-[#ab9ff2]' : 'bg-[#fc7227]'}
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
