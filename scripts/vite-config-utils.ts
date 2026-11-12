import { resolve } from 'node:path'

import { icuParserAlias } from './vite-plugin-icu'

// Kept out of vite.config.ts, so vitest.config.ts doesn't load the build plugins.
export const src = (path = '') => resolve(__dirname, '..', 'src', path)

export const alias = [{ find: '@', replacement: src() }, icuParserAlias]

// Only the keys the bundle reads. Defining the whole process.env would inline the build machine's env.
export const define = {
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
  'process.env.BUILD_VERSION': JSON.stringify(process.env.BUILD_VERSION ?? 'dev'),
}
