import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  build: {
    target: 'es2015',
    outDir: 'dist',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Alma',
      formats: ['umd', 'es'],
      fileName: (format) => `widgets.${format}.js`,
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'widgets.umd.css'
          return assetInfo?.name || '[name].[ext]'
        },
      },
      watch: {
        exclude: ['node_modules/**', 'examples'],
      },
      external: [],
    },
    sourcemap: true,
    minify: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      assets: resolve(__dirname, './src/assets'),
      components: resolve(__dirname, './src/components'),
      hooks: resolve(__dirname, './src/hooks'),
      utils: resolve(__dirname, './src/utils'),
      Widgets: resolve(__dirname, './src/Widgets'),
      intl: resolve(__dirname, './src/intl'),
      react: 'preact/compat',
      'react-dom': 'preact/compat',
    },
  },
  define: {
    'process.env': process.env,
  },
  plugins: [dts({ outDir: 'dist/types' }), nodePolyfills()],
})
