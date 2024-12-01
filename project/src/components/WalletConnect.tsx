import React from 'react';
import { WalletProvider } from '../types/wallet';
import { Button, WalletInfo, Input } from './styled';

interface WalletConnectProps {
  publicKey: string | null;
  providerType: WalletProvider | null;
  message: string;
  onConnect: (type: WalletProvider) => void;
  onDisconnect: () => void;
  onMessageChange: (message: string) => void;
  onSignMessage: () => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({
  publicKey,
  providerType,
  message,
  onConnect,
  onDisconnect,
  onMessageChange,
  onSignMessage,
}) => {
  if (!publicKey) {
    return (
      <>
        <h2>Wallet Connection</h2>
        <Button primary onClick={() => onConnect('phantom')}>
          Connect Phantom
        </Button>
        <Button primary onClick={() => onConnect('solflare')}>
          Connect Solflare
        </Button>
      </>
    );
  }

  return (
    <>
      <h2>Wallet Connection</h2>
      <WalletInfo>
        Connected to {providerType}:
        <br />
        {publicKey}
      </WalletInfo>
      <Input
        value={message}
        onChange={(e) => onMessageChange(e.target.value)}
        placeholder="Enter your message to sign..."
      />
      <Button primary onClick={onSignMessage} disabled={!message}>
        Sign Message
      </Button>
      <Button onClick={onDisconnect}>
        Disconnect
      </Button>
    </>
  );
};