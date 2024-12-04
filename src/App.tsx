import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletContextProvider } from './contexts/WalletContextProvider';
import { SignerPanel } from './components/SignerPanel';
import { useMessageSigning } from './hooks/useMessageSigning';

function AppContent() {
  const { publicKey, disconnect, connected, signMessage } = useWallet();
  const { connection } = useConnection();
  const { message, signature, setMessage, signMessageWithAdapter, copySignature } = useMessageSigning();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <SignerPanel
        connection={{
          publicKey,
          providerType: connected ? 'wallet-adapter' : null,
          provider: connected ? { signMessage } : null
        }}
        message={message}
        signature={signature}
        onMessageChange={setMessage}
        onConnect={() => {}} // Handled by WalletMultiButton now
        onDisconnect={disconnect}
        onSign={signMessageWithAdapter}
        onCopySignature={copySignature}
      />
    </div>
  );
}

export default function App() {
  return (
    <WalletContextProvider>
      <AppContent />
    </WalletContextProvider>
  );
}
