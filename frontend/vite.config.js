import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  envDir: '../backend',
  envPrefix: ['VITE_', 'GOOGLE_EARTH_'],
  server: {
    port: 5173,
    open: true
  }
})
