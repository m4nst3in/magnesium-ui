import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  server: {
    watch: { usePolling: true },
  },
  plugins: [
    react(),
    dts({ include: 'src', exclude: ['src/demo/**/*'], entryRoot: 'src' }),
  ],
  build: {
    sourcemap: true,
    minify: false,
    lib: {
      entry: 'src/index.ts',
      name: 'MagnesiumUI',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
      cssFileName: 'magnesium-ui',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  },
})
