import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Multi-page Vite build:
//   /             → index.html              (Command & Dispatch demo, src/)
//   /ideas/       → ideas/index.html        (Homepage concepts, src-ideas/)
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ideas: resolve(__dirname, 'ideas/index.html'),
      },
    },
  },
})
