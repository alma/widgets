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
        // To make the widget work in standalone, we need to bundle react and all dependencies
        // But it increases the build size, so we want to create an option for users that already have a
        // React environment to use the widget without react bundled.
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
