import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4000,
    host: '0.0.0.0',
    strictPort: false
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // 确保资源路径正确
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    }
  },
  // GitHub Pages部署需要base路径
  base: process.env.NODE_ENV === 'production' ? '/IOT-Testing/' : './',
  // 确保正确处理路由
  optimizeDeps: {
    exclude: ['lucide-react']
  }
});
