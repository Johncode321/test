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

// Interface pour standardiser les informations des wallets
export interface WalletConfig {
  id: WalletProvider;
  name: string;
  logo: string;
  bgColor: string;
  connectionUrl?: string;  // URL pour redirection mobile/installation
  downloadUrl?: string;    // URL de téléchargement du wallet
}
