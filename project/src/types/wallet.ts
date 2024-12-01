import { PublicKey } from '@solana/web3.js';

export type WalletProvider = 'phantom' | 'solflare';

export interface WalletProviderInstance {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signMessage: (message: Uint8Array, encoding: string) => Promise<any>;
  on: (event: string, callback: (publicKey: PublicKey) => void) => void;
  isPhantom?: boolean;
  isSolflare?: boolean;
}