import { existsSync, readdirSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

const src = resolve(__dirname)
const lintFixtures = join(src, '__lint-fixtures__')

const templateFiles = () =>
  readdirSync(src, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.template.ts'))
    .map((entry) => join(entry.parentPath, entry.name))
    .filter((path) => !path.startsWith(lintFixtures))

it('finds a .stories.ts file next to each .template.ts file', () => {
  const withoutStories = templateFiles()
    .filter((path) => !existsSync(path.replace(/\.template\.ts$/, '.stories.ts')))
    .map((path) => relative(src, path))
  expect(withoutStories, 'These templates have no .stories.ts file next to them').toEqual([])
})
