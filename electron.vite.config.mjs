import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      sourcemap: true, // Habilita la generación de source maps
      rollupOptions: {
        external: ['mysql2/promise', 'path', 'fs', 'os', 'util', 'uuid']
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      sourcemap: true, // Habilita la generación de source maps
      rollupOptions: {
        external: ['mysql2/promise', 'path', 'fs', 'os', 'util', 'uuid']
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react()],
    build: {
      sourcemap: true // Habilita la generación de source maps
    }
  }
})
