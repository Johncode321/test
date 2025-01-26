/// <reference types="vite/client" />
declare module '*.svg' {
  const content: string;
  export default content;
}

interface Window {
  phantom?: {
    solana?: any;
  };
  solflare?: any;
  backpack?: {
    solana?: any;
  };
  exodus?: {
    solana?: any;
  };
  trustwallet?: {
    solana?: any;
  };
  atomicwallet?: {
    solana?: any;
  };
  mathwallet?: {
    solana?: any;
  };
  ethereum?: {
    isMetaMask?: boolean;
    request?: (args: { method: string; params?: any[] }) => Promise<any>;
  };
  metamask?: {
    solana?: any;
  };
}
