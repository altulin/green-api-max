import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],

  // на GitHub Pages сайт лежит по адресу /green-api-max/,
  // при разработке — в корне
  base: command === 'build' ? '/green-api-max/' : '/',

  server: {
    port: 3000,
    host: '127.0.0.1',
  },
}))
