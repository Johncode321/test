import { WalletConnection } from '../types/wallet';
import { Button } from './Button';
import { MessageInput } from './MessageInput';
import { SignatureDisplay } from './SignatureDisplay';
import { WalletInfo } from './WalletInfo';
import { SolanaLogo } from './SolanaLogo';
import phantomLogo from '../assets/phantom_logo.svg';
import phantomIcon from '../assets/phantom.svg';
import solflareLogo from '../assets/solflare_logo.svg';
import solflareIcon from '../assets/solflare.svg';
import backpackLogo from '../assets/backpack_logo.svg';
import backpackIcon from '../assets/backpack.svg';
import trustlogo from '../assets/trustlogo.svg';
import atomicIcon from '../assets/atomic.svg';

const isPhantomBrowser = () => navigator.userAgent.toLowerCase().includes('phantom');
const isSolflareBrowser = () => navigator.userAgent.toLowerCase().includes('solflare');
const isBackpackBrowser = () => navigator.userAgent.toLowerCase().includes('backpack');
const isTrustWalletBrowser = () => navigator.userAgent.toLowerCase().includes('trustwallet');

interface SignerPanelProps {
  connection: WalletConnection;
  message: string;
  signature: string;
  onMessageChange: (message: string) => void;
  onConnect: (type: 'phantom' | 'solflare' | 'backpack' | 'trustwallet' | 'Atomic') => void;
  onDisconnect: () => void;
  onSign: () => void;
  onCopySignature: () => void;
}

const renderWalletButtons = (onConnect) => {
  if (isPhantomBrowser()) {
    return (
      <Button 
        variant="primary" 
        onClick={() => onConnect('phantom')}
        className="bg-[#ab9ff2] flex items-center justify-center gap-2 w-full"
      >
        <img src={phantomLogo} alt="Phantom" className="w-6 h-6" />
        Connect with Phantom
      </Button>
    );
  }

  if (isSolflareBrowser()) {
    return (
      <Button 
        variant="primary" 
        onClick={() => onConnect('solflare')}
        className="bg-[#fc7227] flex items-center justify-center gap-2 w-full"
      >
        <img src={solflareLogo} alt="Solflare" className="w-6 h-6" />
        Connect with Solflare
      </Button>
    );
  }

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile && (isBackpackBrowser() || !!window?.backpack?.solana)) {
    return (
      <Button 
        variant="primary"
        onClick={() => onConnect('backpack')}
        className="bg-[#e33e3f] flex items-center justify-center gap-2 w-full"
      >
        <img src={backpackLogo} alt="Backpack" className="w-6 h-6" />
        Connect with Backpack
      </Button>
    );
  }

  if (isTrustWalletBrowser()) {
    return (
      <Button 
        variant="primary"
        onClick={() => onConnect('trustwallet')}
        className="bg-[#0500ff] flex items-center justify-center gap-2 w-full"
      >
        <img src={trustlogo} alt="Trust Wallet" className="w-6 h-6" />
        Connect with Trust Wallet
      </Button>
    );
  }

  return (
    <div className="space-y-4">
      <Button 
        variant="primary" 
        onClick={() => onConnect('phantom')}
        className="bg-[#ab9ff2] flex items-center justify-center gap-2 w-full"
      >
        <img src={phantomLogo} alt="Phantom" className="w-6 h-6" />
        Open with Phantom
      </Button>
      
      <Button 
        variant="primary" 
        onClick={() => onConnect('solflare')}
        className="bg-[#fc7227] flex items-center justify-center gap-2 w-full"
      >
        <img src={solflareLogo} alt="Solflare" className="w-6 h-6" />
        Open with Solflare
      </Button>

      <Button 
        variant="primary"
        onClick={() => onConnect('backpack')}
        className="bg-[#e33e3f] flex items-center justify-center gap-2 w-full"
      >
        <img src={backpackLogo} alt="Backpack" className="w-6 h-6" />
        Open with Backpack
      </Button>

      <Button 
        variant="primary"
        onClick={() => onConnect('atomic')}
        className="bg-[#2ecc71] flex items-center justify-center gap-2 w-full"
      >
        <img src={atomicIcon} alt="Atomic" className="w-6 h-6" />
      Open with Atomic
      </Button>

      <Button 
        variant="primary"
        disabled
        className="bg-[#3498db] flex items-center justify-center gap-2 w-full opacity-50 cursor-not-allowed"
      >
        <img src="/api/placeholder/24/24" alt="Exodus" className="w-6 h-6" />
        Open with Exodus
      </Button>

      
       <Button 
        variant="primary"
        disabled
        className="bg-[#3498db] flex items-center justify-center gap-2 w-full opacity-50 cursor-not-allowed"
      >
        <img src="/api/placeholder/24/24" alt="Exodus" className="w-6 h-6" />
        Open with Glow
      </Button>     

      
      <Button 
        variant="primary"
        onClick={() => onConnect('trustwallet')}
        className="bg-[#0500ff] flex items-center justify-center gap-2 w-full"
      >
        <img src={trustlogo} alt="Trust Wallet" className="w-6 h-6" />
        Open with Trust Wallet
      </Button>

      <Button 
        variant="primary"
        disabled
        className="bg-[#f39c12] flex items-center justify-center gap-2 w-full opacity-50 cursor-not-allowed"
      >
        <img src="/api/placeholder/24/24" alt="MetaMask" className="w-6 h-6" />
        Open with MetaMask
      </Button>

      <Button 
        variant="primary"
        disabled
        className="bg-[#e74c3c] flex items-center justify-center gap-2 w-full opacity-50 cursor-not-allowed"
      >
        <img src="/api/placeholder/24/24" alt="Math Wallet" className="w-6 h-6" />
        Open with Math Wallet
      </Button>
      
    </div>
  );
};

export const SignerPanel = ({ 
  connection, 
  message, 
  signature, 
  onMessageChange, 
  onConnect, 
  onDisconnect, 
  onSign, 
  onCopySignature 
}: SignerPanelProps) => {
  const isConnected = !!connection.publicKey;

  const getWalletIcon = () => {
    switch(connection.providerType) {
      case 'phantom':
        return phantomIcon;
      case 'backpack':
        return backpackIcon;
      case 'solflare':
        return solflareIcon;
      case 'trustwallet':
        return trustlogo;
      case 'atomic':
      return atomicIcon;
      default:
        return phantomIcon;
    }
  };

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
              {(isPhantomBrowser() || isSolflareBrowser() || isBackpackBrowser() || isTrustWalletBrowser())
                ? "Connect your wallet to sign messages"
                : "Choose your wallet to sign messages"}
            </p>
          </div>
          
          {renderWalletButtons(onConnect)}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <img 
              src={getWalletIcon()}
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
            className={
              connection.providerType === 'phantom' ? 'bg-[#ab9ff2]' :
              connection.providerType === 'backpack' ? 'bg-[#e33e3f]' :
              connection.providerType === 'trustwallet' ? 'bg-[#0500ff]' :
              connection.providerType === 'atomic' ? 'bg-[#2ecc71]' :
              'bg-[#fc7227]'
            }
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
