import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import type { MessageDescriptor } from '@/shared/i18n/i18n.types'

const root = resolve(__dirname, '../../..')

const sourceCatalogue = (): Record<string, string> =>
  JSON.parse(readFileSync(resolve(root, 'src/intl/messages.json'), 'utf8'))

describe('message descriptors', () => {
  it('extracts to the same keys, in the same order, as src/intl/messages.json', () => {
    // `npm run translations:extract` without `--out-file`: prints instead of writing the catalogue.
    const extracted = execFileSync(
      resolve(root, 'node_modules/.bin/formatjs'),
      ['extract', 'src/**/*.ts*', '--format', 'simple', '--ignore', 'src/*.d.ts'],
      { cwd: root, encoding: 'utf8' },
    )

    expect(Object.entries(JSON.parse(extracted))).toEqual(Object.entries(sourceCatalogue()))
  }, 30_000)

  it('declares each id of src/intl/messages.json once, with its defaultMessage', () => {
    const modules = import.meta.glob<Record<string, Record<string, MessageDescriptor>>>(
      '/src/**/*.messages.ts',
      { eager: true },
    )
    const descriptors = Object.values(modules)
      .flatMap((module) => Object.values(module))
      .flatMap((messages) => Object.values(messages))
    const ids = descriptors.map(({ id }) => id)

    expect(ids.filter((id, index) => ids.indexOf(id) !== index)).toEqual([])
    expect(
      Object.fromEntries(descriptors.map(({ id, defaultMessage }) => [id, defaultMessage])),
    ).toEqual(sourceCatalogue())
  })
})
