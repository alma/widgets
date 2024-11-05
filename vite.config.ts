import { resolve } from 'path'
import { defineConfig, UserConfig } from 'vite'
import packageJson from './package.json'
import dts from 'vite-plugin-dts'

export function generateViteConfig(hasReact: boolean = false): UserConfig {
  return {
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'Alma',
        formats: ['umd', 'es'],
        fileName: (format) => `widgets.${format}.js`,
      },
      outDir: 'dist',
      rollupOptions: {
        watch: {
          exclude: ['node_modules/**', 'examples'],
        },
        external: hasReact ? Object.keys(packageJson.dependencies) : [],
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
      },
    },
    define: {
      'process.env': process.env,
    },
    plugins: [dts({ outDir: 'dist/types' })],
  }
}

export default defineConfig(generateViteConfig())
