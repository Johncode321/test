import { PublicKey } from '@solana/web3.js';

export type WalletProvider = 'phantom' | 'solflare';

export interface WalletConnection {
  provider: any;
  publicKey: PublicKey | null;
  providerType: WalletProvider | null;
}