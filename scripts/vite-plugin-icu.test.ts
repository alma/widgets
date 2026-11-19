import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'

import { parse } from '@formatjs/icu-messageformat-parser/index.js'
import IntlMessageFormat from 'intl-messageformat'

import { compileCatalogue, icuCatalogues } from './vite-plugin-icu'
import compiledFR from '@/intl/messages/messages.fr.json'

const root = resolve(__dirname, '..')
const catalogueDir = resolve(root, 'src/intl/messages')
const CATALOGUES = readdirSync(catalogueDir).filter((file) =>
  /^messages\.[a-z]{2}\.json$/.test(file),
)

const catalogueFile = (lang: string) => resolve(catalogueDir, `messages.${lang}.json`)
const readJson = (file: string) => JSON.parse(readFileSync(file, 'utf8'))

const tempDirs: string[] = []
const tempDir = () => {
  const dir = mkdtempSync(resolve(tmpdir(), 'icu-'))
  tempDirs.push(dir)
  return dir
}

// Writes the file and its folders.
const writeJson = (file: string, content: unknown) => {
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, JSON.stringify(content))
}

afterAll(() => tempDirs.forEach((dir) => rmSync(dir, { recursive: true, force: true })))

type LoadHook = (this: unknown, id: string) => string | null
type WatchChangeHook = (id: string) => void

const load = (id: string, warn = vi.fn(), plugin = icuCatalogues()) =>
  (plugin.load as LoadHook).call({ warn, addWatchFile: vi.fn() }, id)

describe('icuCatalogues', () => {
  const expected = tempDir()

  beforeAll(() => {
    execFileSync(
      resolve(root, 'node_modules/.bin/formatjs'),
      ['compile-folder', '--ast', '--format', 'simple', catalogueDir, expected],
      { cwd: root },
    )
  })

  it.each(CATALOGUES)('compiles %s like formatjs compile --ast --format simple', (file) => {
    expect(JSON.parse(load(resolve(catalogueDir, file)) ?? '')).toEqual(
      readJson(resolve(expected, file)),
    )
  })

  it('compiles the source messages, which hold the default messages', () => {
    const source = readJson(resolve(root, 'src/intl/messages.json'))

    expect(JSON.parse(load(resolve(root, 'src/intl/messages.json')) ?? '')).toEqual(
      compileCatalogue(source, {}, () => {}),
    )
  })

  it('reads the source again once it changes', () => {
    const dir = tempDir()
    const source = resolve(dir, 'src/intl/messages.json')
    const catalogue = resolve(dir, 'src/intl/messages/messages.de.json')
    writeJson(source, { a: 'A' })
    writeJson(catalogue, {})
    const plugin = icuCatalogues(source)
    const keys = () => Object.keys(JSON.parse(load(catalogue, vi.fn(), plugin) ?? ''))

    expect(keys()).toEqual(['a'])
    writeJson(source, { a: 'A', b: 'B' })
    expect(keys()).toEqual(['a'])
    ;(plugin.watchChange as WatchChangeHook)(source)
    expect(keys()).toEqual(['a', 'b'])
  })

  it('lets Vite load every other file', () => {
    expect(load(resolve(root, 'package.json'))).toBeNull()
    expect(load(resolve(root, 'src/intl/messages.json?raw'))).toBeNull()
  })

  it('serves the compiled catalogue to the code under test', () => {
    expect(compiledFR).toEqual(JSON.parse(load(catalogueFile('fr')) ?? ''))
  })

  it('makes intl-messageformat throw on an uncompiled message', () => {
    expect(() => new IntlMessageFormat('{a}', 'en')).toThrow(/uncompiled message/)
  })
})

describe('compileCatalogue', () => {
  it('fills a missing key with the source message and names it', () => {
    const onMissing = vi.fn()

    const compiled = compileCatalogue(
      { a: 'A {count, plural, one {item} other {items}}' },
      { a: 'Un', b: 'Bonjour <strong>{name}</strong>' },
      onMissing,
    )

    expect(onMissing).toHaveBeenCalledExactlyOnceWith('b')
    expect(Object.keys(compiled)).toEqual(['a', 'b'])
    expect(compiled.b).toEqual(parse('Bonjour <strong>{name}</strong>'))
  })

  it('warns through Vite with the file and the key that a catalogue lacks', () => {
    const source = readJson(resolve(root, 'src/intl/messages.json'))
    const [missingKey, ...otherKeys] = Object.keys(source)
    const file = resolve(tempDir(), 'src/intl/messages/messages.de.json')
    writeJson(file, Object.fromEntries(otherKeys.map((key) => [key, source[key]])))
    const warn = vi.fn()

    const compiled = JSON.parse(load(file, warn) ?? '')

    expect(warn).toHaveBeenCalledExactlyOnceWith(expect.stringContaining(file))
    expect(warn).toHaveBeenCalledWith(expect.stringContaining(`"${missingKey}"`))
    expect(compiled[missingKey]).toEqual(parse(source[missingKey]))
  })
})
