import { PublicKey } from '@solana/web3.js';

export type WalletProvider = 
  | 'phantom' 
  | 'solflare' 
  | 'backpack'
  | 'atomic'
  | 'exodus'
  | 'mathwallet'
  | 'trustwallet'
  | 'metamask';

export interface WalletConnection {
  provider: any;
  publicKey: PublicKey | null;
  providerType: WalletProvider | null;
}

export interface WalletInfo {
  id: WalletProvider;
  name: string;
  logo: string;
  bgColor: string;
}
