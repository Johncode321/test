export const getProvider = (type: 'phantom' | 'solflare') => {
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