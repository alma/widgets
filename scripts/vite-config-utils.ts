import { resolve } from 'node:path'

import { icuParserAlias } from './vite-plugin-icu'

// Kept out of vite.config.ts, so vitest.config.ts doesn't load the build plugins.
export const src = (path = '') => resolve(__dirname, '..', 'src', path)

export const alias = [{ find: '@', replacement: src() }, icuParserAlias]

export const define = {
  'import.meta.env.BUILD_VERSION': JSON.stringify(process.env.BUILD_VERSION ?? 'dev'),
}
