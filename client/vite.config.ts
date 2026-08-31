import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),nodePolyfills()],
  server: {
    host: '0.0.0.0', // This tells Vite to listen to your whole Wi-Fi network
    port: 5173      
  }
})
