import { PublicKey } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { transact } from '@solana-mobile/wallet-adapter-mobile';

export type WalletProvider = 'phantom' | 'solflare';

export interface WalletConnection {
  provider: any;
  publicKey: PublicKey | null;
  providerType: WalletProvider | null;
}

export interface MobileWalletAdapterConfig {
  cluster: WalletAdapterNetwork;
  appIdentity: {
    name: string;
    uri: string;
    icon: string;
  };
}

export interface AuthorizationResult {
  accounts: {
    address: string;
    label?: string;
  }[];
  authToken: string;
}

export interface MobileProvider {
  authorize: (config: MobileWalletAdapterConfig) => Promise<AuthorizationResult>;
  signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
  deauthorize: () => Promise<void>;
}

export interface WalletAdapterSession {
  publicKey: string;
  signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
  disconnect: () => Promise<void>;
}
