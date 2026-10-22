// Proves that each lint ban, import zone and layer ban still fires, on the fixtures in
// src/__lint-fixtures__/. Each fixture says in its header what must catch it:
//
//   // path: src/domain/plans/fixture.ts         lint the fixture as if it were at this path
//   // expect: no-restricted-syntax "No attachShadow"
//   // expect: nothing                           no ban, zone or layer ban may fire
//
// A CSS fixture uses /* expect: <stylelint rule> */. Every expected rule must fire with a message
// that contains its text, and nothing else from these rules may fire. The harness writes no file.
import { readdirSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join, relative, resolve } from 'node:path'

const root = process.cwd()
const require = createRequire(join(root, 'package.json'))
const { ESLint } = require('eslint')
const stylelint = require('stylelint')

const FIXTURES = 'src/__lint-fixtures__'
const ONLY_BROWSER_TEST = 'src/modal.browser.test.ts'
const ESLINT_RULES = new Set([
  'no-restricted-syntax',
  'no-restricted-imports',
  'no-restricted-globals',
  'no-restricted-properties',
  'import/no-restricted-paths',
])
const STYLELINT_RULES = new Set([
  'selector-max-specificity',
  'selector-max-type',
  'at-rule-disallowed-list',
  'selector-pseudo-class-disallowed-list',
  'selector-pseudo-element-disallowed-list',
])

// The bans need no type information, and import/no-cycle can't follow a file that isn't on disk.
const eslint = new ESLint({
  cwd: root,
  ignore: false,
  overrideConfig: {
    parserOptions: { project: null },
    rules: { '@typescript-eslint/no-floating-promises': 'off', 'import/no-cycle': 'off' },
  },
})
const stylelintConfig = { ...require(join(root, '.stylelintrc.cjs')), ignoreFiles: [] }

const listFiles = (dir) =>
  readdirSync(join(root, dir), { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(root, join(entry.parentPath, entry.name)))
    .sort()

const readHeader = (code) => {
  const header = { path: undefined, expects: [] }
  for (const [, key, value] of code.matchAll(
    /^\s*(?:\/\/|\/\*)\s*(path|expect):\s*(.+?)\s*(?:\*\/)?$/gm,
  )) {
    if (key === 'path') {
      header.path = value
    } else if (value !== 'nothing') {
      const [, rule, text = ''] = value.match(/^(\S+)(?:\s+"(.*)")?$/)
      header.expects.push({ rule, text })
    } else {
      header.nothing = true
    }
  }
  return header
}

const lintFixture = async (fixture, code, header) => {
  if (fixture.endsWith('.css')) {
    const { results } = await stylelint.lint({
      code,
      codeFilename: resolve(root, fixture),
      config: stylelintConfig,
      configBasedir: root,
    })
    return results[0].warnings
      .filter((warning) => STYLELINT_RULES.has(warning.rule))
      .map((warning) => ({ rule: warning.rule, message: warning.text }))
  }
  const [result] = await eslint.lintText(code, { filePath: resolve(root, header.path ?? fixture) })
  const fatal = result.messages.find((message) => message.fatal)
  if (fatal) {
    throw new Error(`could not parse: ${fatal.message}`)
  }
  return result.messages
    .filter((message) => ESLINT_RULES.has(message.ruleId))
    .map((message) => ({ rule: message.ruleId, message: message.message }))
}

const matches = (expect, found) => found.rule === expect.rule && found.message.includes(expect.text)

const checkFixture = async (fixture) => {
  const code = readFileSync(join(root, fixture), 'utf8')
  const header = readHeader(code)
  if (!header.nothing && header.expects.length === 0) {
    return { ok: false, detail: 'declares no expect line' }
  }
  const found = await lintFixture(fixture, code, header)
  const missing = header.expects.filter((expect) => !found.some((item) => matches(expect, item)))
  const unexpected = found.filter((item) => !header.expects.some((expect) => matches(expect, item)))
  if (missing.length > 0 || unexpected.length > 0) {
    const lines = [
      ...missing.map((expect) => `did not fire: ${expect.rule} "${expect.text}"`),
      ...unexpected.map((item) => `also fired: ${item.rule}: ${item.message}`),
    ]
    return { ok: false, detail: lines.join(' | ') }
  }
  const caught = [...new Set(found.map((item) => `${item.rule}: ${item.message}`))]
  return { ok: true, detail: caught.length > 0 ? caught.join(' | ') : 'nothing fired' }
}

let failures = 0
const report = (ok, name, detail) => {
  if (!ok) failures += 1
  console.log(`${ok ? '✓' : '✗'} ${name}: ${detail}`)
}

for (const fixture of listFiles(FIXTURES)) {
  const name = relative(FIXTURES, fixture)
  try {
    const { ok, detail } = await checkFixture(fixture)
    report(ok, name, detail)
  } catch (error) {
    report(false, name, error.message)
  }
}

// Only the modal's focus tests need a real browser.
const browserTests = listFiles('src').filter(
  (file) => file.endsWith('.browser.test.ts') && file !== ONLY_BROWSER_TEST,
)
report(
  browserTests.length === 0,
  'browser tests',
  browserTests.length === 0
    ? `no *.browser.test.ts file but ${ONLY_BROWSER_TEST}`
    : `only ${ONLY_BROWSER_TEST} may run in Chromium, found ${browserTests.join(', ')}`,
)

console.log(failures === 0 ? '\nEvery check fired.' : `\n${failures} check(s) failed.`)
process.exitCode = failures === 0 ? 0 : 1
