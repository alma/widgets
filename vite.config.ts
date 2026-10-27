import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import CleanCSS from 'clean-css'
import { defineConfig, type Plugin } from 'vite'

import { icuCatalogues, icuParserAlias } from './scripts/vite-plugin-icu'

const src = (path = '') => resolve(__dirname, 'src', path)

// alias and define are shared with vitest.config.ts.
export const alias = [{ find: '@', replacement: src() }, icuParserAlias]

// Only the keys the bundle reads. Defining the whole process.env would inline the build machine's env.
export const define = {
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
  'process.env.BUILD_VERSION': JSON.stringify(process.env.BUILD_VERSION ?? 'dev'),
}

// Runs once per build, like master. Skips when widgets.css is missing (failed watch rebuild, Storybook).
const minCss = (): Plugin => {
  let outDir = ''
  return {
    name: 'alma-min-css',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      const cssPath = resolve(outDir, 'widgets.css')
      if (!existsSync(cssPath)) return
      const css = readFileSync(cssPath, 'utf8')
      writeFileSync(resolve(outDir, 'widgets.min.css'), new CleanCSS().minify(css).styles)
    },
  }
}

// A file in the folder writeBundle wrote to.
const outFile = (dir: string | undefined, file: string) => {
  if (!dir) throw new Error(`Cannot locate ${file}: the build output has no dir.`)
  return resolve(dir, file)
}

// Runs only after the UMD output is written, so it never copies a stale file. The WooCommerce
// files are plain copies: master's patch that swaps innerHTML for innerText breaks Lit.
const wooCommerceCopy = (): Plugin => ({
  name: 'alma-woocommerce-copy',
  apply: 'build',
  writeBundle({ dir }, bundle) {
    if (!('widgets.umd.js' in bundle)) return
    copyFileSync(outFile(dir, 'widgets.umd.js'), outFile(dir, 'widgets-wc.umd.js'))
    copyFileSync(outFile(dir, 'widgets.umd.js.map'), outFile(dir, 'widgets-wc.umd.js.map'))
  },
})

export default defineConfig({
  // dist/ lands next to this file, whatever the current directory.
  root: __dirname,
  resolve: { alias },
  define,
  build: {
    // No polyfills: ES2021 browsers have everything master polyfilled.
    target: 'es2021',
    outDir: 'dist',
    sourcemap: true,
    lib: {
      entry: src('index.ts'),
      name: 'Alma',
      formats: ['umd', 'es'],
      fileName: (format) => (format === 'es' ? 'widgets.js' : `widgets.${format}.js`),
      cssFileName: 'widgets',
    },
    rollupOptions: {
      output: {
        // Reuse an existing window.Alma, so Alma.InPage survives any load order.
        extend: true,
      },
    },
  },
  plugins: [icuCatalogues(), minCss(), wooCommerceCopy()],
})
