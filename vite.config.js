import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Output folder
    emptyOutDir: true,
  },
  publicDir: 'public', // Ensure assets are loaded from public/
});
