import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: true,
    allowedHosts: ['zebra-unpaired-stapling.ngrok-free.dev', '.ngrok-free.dev', '.loca.lt'],
    proxy: {
      '/api': {
        target: 'https://mer.wuqiwan.cn',
        changeOrigin: true,
      },
    },
  },
})
