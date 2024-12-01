import { WalletProvider, WalletProviderInstance } from '../types/wallet';

export const getProvider = (type: WalletProvider): WalletProviderInstance | null => {
  if (type === 'phantom' && 'phantom' in window) {
    const provider = (window as any).phantom?.solana;
    if (provider?.isPhantom) return provider;
  }
  if (type === 'solflare' && 'solflare' in window) {
    const provider = (window as any).solflare;
    if (provider?.isSolflare) return provider;
  }
  return null;
};