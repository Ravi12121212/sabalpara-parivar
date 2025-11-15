import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    allowedHosts: [
  'f9be78a7bc22.ngrok-free.app',
  '739c021d44fd.ngrok-free.app'
    ],
  },
});
