import { PublicKey } from '@solana/web3.js';

export type WalletProvider = 'phantom' | 'solflare' | 'backpack' | 'trustwallet';

export interface WalletConnection {
  provider: any;
  publicKey: PublicKey | null;
  providerType: WalletProvider | null;
}
