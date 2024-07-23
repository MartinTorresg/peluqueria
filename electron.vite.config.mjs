import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        external: ['mysql2/promise', 'path', 'fs', 'os', 'util', 'uuid']  // Aquí agrega todos los módulos integrados de Node.js que necesites
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        external: ['mysql2/promise', 'path', 'fs', 'os', 'util', 'uuid']  // Aquí agrega todos los módulos integrados de Node.js que necesites
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react()]
  }
})
