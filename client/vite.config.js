import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          if (id.includes('html2canvas') || id.includes('canvg') || id.includes('svg-pathdata')) {
            return 'resume-capture';
          }

          if (id.includes('jspdf')) {
            return 'resume-pdf';
          }

          if (id.includes('recharts') || id.includes('victory-vendor') || id.includes('/d3-')) {
            return 'analytics-vendor';
          }

          if (
            id.includes('framer-motion') ||
            id.includes('motion-dom') ||
            id.includes('motion-utils')
          ) {
            return 'motion-vendor';
          }
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.js',
  },
});
