import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: "./", // Assure des chemins relatifs pour IPFS (essaye "/" si besoin)
  plugins: [react()],
  build: {
    target: "esnext", // Utilisation de ES Modules récents
    rollupOptions: {
      output: {
        format: "esm", // Forcer le format en ES Module
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    headers: {
      'Content-Type': 'application/javascript' // Forcer le bon MIME type pour les scripts
    }
  }
});
