import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  server: {
    // Zahteve na /api preusmeri na backend, da brskalnik vidi en sam izvor
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})