import path from 'path'

import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      ignored: ['node_modules/**', '.git/**', 'proxy/**'],
    },
  },
  resolve: {
    alias: [
      {
        find: '@app',
        replacement: path.join(__dirname, 'src'),
      },
      {
        find: '@testing',
        replacement: path.join(__dirname, 'src', 'testing'),
      },
      {
        find: '@mocks',
        replacement: path.join(__dirname, 'src', 'testing', 'mocks'),
      },
    ],
  },
})
