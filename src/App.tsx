// src/App.tsx
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletContextProvider } from './contexts/WalletContextProvider';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useMessageSigning } from './hooks/useMessageSigning';
import { SignerPanel } from './components/SignerPanel';

function AppContent() {
  const { publicKey, signMessage, disconnect } = useWallet();
  const { message, signature, setMessage, signMessageWithAdapter, copySignature } = useMessageSigning();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <SignerPanel
        connection={{
          publicKey,
          providerType: null,
          provider: null
        }}
        message={message}
        signature={signature}
        onMessageChange={setMessage}
        onConnect={() => {}} // Handled by WalletMultiButton
        onDisconnect={disconnect}
        onSign={signMessageWithAdapter}
        onCopySignature={copySignature}
      />
      
      {/* Add wallet modal button */}
      <div className="fixed top-4 right-4">
        <WalletMultiButton />
      </div>
    </div>
  );
}

function App() {
  return (
    <WalletContextProvider>
      <AppContent />
    </WalletContextProvider>
  );
}

export default App;
