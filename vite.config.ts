import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages gibi alt klasörlerde çalışması için base yolunu relative yapıyoruz
  base: './', 
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})