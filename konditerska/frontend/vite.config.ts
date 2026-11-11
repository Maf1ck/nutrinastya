import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const API_TARGET = process.env.API_URL ?? 'http://localhost:3001'
const tokensPath = fileURLToPath(new URL('./src/styles/tokens', import.meta.url)).split(path.sep).join('/')

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Design tokens and mixins are available in every component without imports.
        additionalData: `@use "${tokensPath}" as *;`,
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': API_TARGET,
      '/uploads': API_TARGET,
    },
  },
})
