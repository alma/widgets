import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
  server: {
    open: true,
  },
  preview: {
    open: true,
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Alma',
      formats: ['es', 'umd'],
      fileName: (format) => `alma-widgets.${format === 'es' ? 'js' : 'umd.js'}`,
    },
    rollupOptions: {
      output: {
        assetFileNames: 'alma-widgets.[ext]',
        exports: 'named',
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        // Keep console logs for the POC to make debugging eligibility issues easier.
        // We can re-enable dropping console logs for production later.
        drop_console: false,
        drop_debugger: true,
      },
    },
    cssCodeSplit: false,
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
