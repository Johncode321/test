/// <reference types="vite/client" />

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
  atomic?: {
    solana?: any;
  };
  mathwallet?: {
    solana?: any;
  };
  metamask?: {
    solana?: any;
  };
}
