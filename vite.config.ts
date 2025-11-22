import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    allowedHosts: [
  'd7c0826e100d.ngrok-free.app',
  'f4455a799fac.ngrok-free.app',
  '079b70a98fd6.ngrok-free.app',
  '67834366b262.ngrok-free.app',
  '8fc442f99b23.ngrok-free.app',
  "4d3f96ae4f05.ngrok-free.app",
    ],
  },
});
