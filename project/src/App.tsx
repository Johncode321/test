import React from 'react';
import { Container, Card, Button, WalletInfo, Input, SignatureDisplay } from './components/styled';
import { CopyButton } from './components/CopyButton';
import { useWallet } from './hooks/useWallet';

function App() {
  const {
    publicKey,
    providerType,
    message,
    lastSignature,
    setMessage,
    connectWallet,
    disconnectWallet,
    signMessage,
  } = useWallet();

  return (
    <Container>
      <Card>
        <h1>Solana Wallet Signer</h1>
        {!publicKey ? (
          <>
            <Button primary onClick={() => connectWallet('phantom')}>
              Connect Phantom
            </Button>
            <Button primary onClick={() => connectWallet('solflare')}>
              Connect Solflare
            </Button>
          </>
        ) : (
          <>
            <WalletInfo>
              <h2>Connected Wallet</h2>
              <p>
                <strong>Provider:</strong> {providerType}
              </p>
              <p className="address">
                <strong>Address:</strong> {publicKey}
                <CopyButton text={publicKey} label="Copy address" />
              </p>
            </WalletInfo>

            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message to sign..."
            />

            {lastSignature && (
              <SignatureDisplay>
                <h3>
                  Signature (Base58)
                  <CopyButton text={lastSignature} label="Copy signature" />
                </h3>
                <p>{lastSignature}</p>
              </SignatureDisplay>
            )}

            <Button primary onClick={signMessage} disabled={!message}>
              Sign Message
            </Button>
            <Button onClick={disconnectWallet}>
              Disconnect
            </Button>
          </>
        )}
      </Card>
    </Container>
  );
}

export default App;