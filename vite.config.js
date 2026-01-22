import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import tailwindcss from "@tailwindcss/vite"
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  server:{
    proxy:{
      "/attendance":"https://attendance-backend-hhkn.onrender.com"
    }
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
})
