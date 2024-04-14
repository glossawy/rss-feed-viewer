import path from 'path'

import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: '@app',
        replacement: path.join(__dirname, 'src'),
      },
      {
        find: '@mocks',
        replacement: path.join(__dirname, 'src', 'mocks'),
      },
    ],
  },
})
