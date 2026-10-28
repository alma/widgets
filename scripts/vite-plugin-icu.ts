import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// The bare name resolves to the no-parser stub wherever icuParserAlias applies, as in Vitest.
import { parse, type MessageFormatElement } from '@formatjs/icu-messageformat-parser/index.js'
import type { Alias, Plugin } from 'vite'

const intlDir = resolve(__dirname, '..', 'src', 'intl')
const defaultSourceFile = resolve(intlDir, 'messages.json')
const CATALOGUE = /[\\/]src[\\/]intl[\\/]messages[\\/]messages\.[a-z]{2}\.json$/
const SOURCE = /[\\/]src[\\/]intl[\\/]messages\.json$/

type Catalogue = Record<string, string>
export type CompiledCatalogue = Record<string, MessageFormatElement[]>

const readCatalogue = (file: string): Catalogue => JSON.parse(readFileSync(file, 'utf8'))

// A missing key gets the source (French) message.
export const compileCatalogue = (
  catalogue: Catalogue,
  source: Catalogue,
  onMissing: (id: string) => void,
): CompiledCatalogue => {
  const filled = { ...catalogue }
  Object.entries(source).forEach(([id, message]) => {
    if (id in filled) return
    onMissing(id)
    filled[id] = message
  })
  return Object.fromEntries(Object.entries(filled).map(([id, message]) => [id, parse(message)]))
}

// Keeps the parser out of the bundle. Its parse() throws, so an uncompiled message fails loudly.
export const icuParserAlias: Alias = {
  find: /^@formatjs\/icu-messageformat-parser$/,
  replacement: '@formatjs/icu-messageformat-parser/lib/no-parser.js',
}

// Compiles in memory, so git tracks no compiled file and a Crowdin download needs no extra step.
export const icuCatalogues = (sourceFile = defaultSourceFile): Plugin => {
  let source: Catalogue | undefined
  const readSource = () => {
    source ??= readCatalogue(sourceFile)
    return source
  }

  return {
    name: 'alma-icu-catalogues',
    enforce: 'pre',
    watchChange(id) {
      if (SOURCE.test(id)) source = undefined
    },
    load(id) {
      // createIntl formats these default messages when a translation fails.
      if (SOURCE.test(id)) return JSON.stringify(compileCatalogue(readSource(), {}, () => {}))
      if (!CATALOGUE.test(id)) return null
      this.addWatchFile(sourceFile)
      const compiled = compileCatalogue(readCatalogue(id), readSource(), (key) =>
        this.warn(`${id} lacks the key "${key}". It falls back to the source message.`),
      )
      return JSON.stringify(compiled)
    },
  }
}
