import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: [
      'lucide-react',
      '@mui/material',
      '@mui/x-date-pickers',
      '@mui/system',
      '@emotion/react',
      '@emotion/styled'
    ],
  },
});