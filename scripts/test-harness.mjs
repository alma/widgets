// Proves that each lint ban, import zone and layer ban still fires, on the fixtures in
// src/__lint-fixtures__/. Each fixture says in its header what must catch it:
//
//   // path: src/domain/plans/fixture.ts         lint the fixture as if it were at this path
//   // expect: no-restricted-syntax "No attachShadow"
//   // expect: nothing                           no ban, zone or layer ban may fire
//
// A CSS fixture uses /* expect: <stylelint rule> */. Every expected rule must fire with a message
// that contains its text, and nothing else from these rules may fire.
//
// Then it pastes each code skeleton of the port-react-component skill at the path that its first
// line names, runs the full lint and the typecheck on it, as on a port, and removes it.
//
// Then it runs the Claude Code lint hook on a few files, as Claude Code does after an edit. The
// hook skips the fixtures, so a case copies its fixture where the hook lints it, then removes it.
import { execFileSync, spawnSync } from 'node:child_process'
import { readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
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
const SKELETONS = '.claude/skills/port-react-component/references'
const HOOK = '.claude/hooks/lint-edited-file.mjs'
const PR_TEMPLATE = '.github/pull_request_template.md'
const PR_CHECKLIST = '.claude/skills/lit-review/references/pr-checklist.md'
const HOOK_TIMEOUT_MS = 10_000
// A case with a fixture copies it to `file`, then removes it. The hook runs in `cwd`, the root by
// default, as Claude Code runs it in the session's current directory.
const HOOK_CASES = [
  {
    name: 'ban',
    fixture: 'static-styles.ts',
    file: 'src/widgets/common/fixture.ts',
    expect: 'No static styles',
  },
  {
    name: 'zone',
    fixture: 'layers/zone-domain.ts',
    file: 'src/domain/plans/fixture.ts',
    expect: 'domain/ imports only shared/lib/ and shared/config/',
  },
  {
    name: 'css',
    fixture: 'layer.css',
    file: 'src/styles/fixture.css',
    expect: 'at-rule-disallowed-list',
  },
  { name: 'not linted', file: 'README.md' },
  { name: 'fixture skipped', file: 'src/__lint-fixtures__/static-styles.ts' },
  { name: 'clean', file: 'src/shared/lib/price.ts' },
  { name: 'clean from src/', file: 'src/shared/lib/price.ts', cwd: 'src' },
]

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

// GitHub reads the template from the default branch only, so the skill keeps its own checklist.
const prChecklist = readFileSync(join(root, PR_CHECKLIST), 'utf8').trim()
const holdsPrChecklist = readFileSync(join(root, PR_TEMPLATE), 'utf8').includes(prChecklist)
report(
  holdsPrChecklist,
  'PR checklist',
  holdsPrChecklist
    ? `${PR_TEMPLATE} holds ${PR_CHECKLIST}`
    : `${PR_TEMPLATE} lacks the block of ${PR_CHECKLIST}: change both together`,
)

const gitStatus = () =>
  execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' })
const statusBefore = gitStatus()

// A skeleton is a fenced block whose first line is `// path: <file>`.
const readSkeletons = () =>
  listFiles(SKELETONS)
    .filter((file) => file.endsWith('.md'))
    .flatMap((file) =>
      [...readFileSync(join(root, file), 'utf8').matchAll(/^```\w*\n([\s\S]*?)^```$/gm)].map(
        ([, code]) => ({ file, code, path: code.match(/^\/\/ path: (\S+)\n/)?.[1] }),
      ),
    )
    .filter(({ path }) => path !== undefined)

// Type information on, as in npm run lint. Warnings fail too, since ports copy the skeletons.
const fullEslint = new ESLint({ cwd: root })

const lintSkeleton = async ({ path }) => {
  const [result] = await fullEslint.lintFiles([path])
  const problems = result.messages.map(
    (message) => `${message.line}:${message.column} ${message.ruleId}: ${message.message}`,
  )
  return { ok: problems.length === 0, detail: problems.join(' | ') || 'clean' }
}

const typecheck = () => {
  const { status, stdout } = spawnSync(
    process.execPath,
    [require.resolve('typescript/bin/tsc'), '--noEmit'],
    { cwd: root, encoding: 'utf8' },
  )
  const errors = stdout.split('\n').filter((line) => line.includes('error TS'))
  return { ok: status === 0, detail: errors.join(' | ') || 'no error' }
}

const checkSkeletons = async (skeletons) => {
  const pasted = []
  try {
    for (const { path, code } of skeletons) {
      // wx fails if the file exists, so the finally never removes a file of the repo.
      writeFileSync(join(root, path), code, { flag: 'wx' })
      pasted.push(path)
    }
    for (const skeleton of skeletons) {
      const { ok, detail } = await lintSkeleton(skeleton)
      report(ok, `skeleton ${skeleton.path}`, `${relative(SKELETONS, skeleton.file)}: ${detail}`)
    }
    const { ok, detail } = typecheck()
    report(ok, 'skeletons typecheck', detail)
  } finally {
    pasted.forEach((path) => rmSync(join(root, path), { force: true }))
  }
}

const skeletons = readSkeletons()
if (skeletons.length === 0) {
  report(false, 'skeletons', `no skeleton in ${SKELETONS}`)
} else {
  try {
    await checkSkeletons(skeletons)
  } catch (error) {
    report(false, 'skeletons', error.message)
  }
}

const runHook = (file, cwd = '.') => {
  const started = Date.now()
  const result = spawnSync(process.execPath, [join(root, HOOK)], {
    cwd: join(root, cwd),
    encoding: 'utf8',
    input: JSON.stringify({
      hook_event_name: 'PostToolUse',
      tool_name: 'Write',
      tool_input: { file_path: resolve(root, file) },
    }),
    timeout: HOOK_TIMEOUT_MS,
  })
  return { ...result, seconds: ((Date.now() - started) / 1000).toFixed(1) }
}

const checkHookCase = ({ fixture, file, cwd, expect }) => {
  if (fixture) {
    // wx fails if the file exists, so the finally never removes a file of the repo.
    writeFileSync(join(root, file), readFileSync(join(root, FIXTURES, fixture)), { flag: 'wx' })
  }
  try {
    const { status, stderr, error, seconds } = runHook(file, cwd)
    if (error) {
      const reason =
        error.code === 'ETIMEDOUT' ? `took over ${HOOK_TIMEOUT_MS / 1000}s` : error.message
      return { ok: false, detail: `${file}: ${reason}` }
    }
    if (expect) {
      const ok = status === 2 && stderr.includes(expect)
      return {
        ok,
        detail: ok
          ? `${file}: exit 2 in ${seconds}s with "${expect}"`
          : `${file}: exit ${status}, expected 2 with "${expect}": ${stderr.trim()}`,
      }
    }
    const ok = status === 0 && stderr === ''
    return {
      ok,
      detail: ok ? `${file}: silent in ${seconds}s` : `${file}: exit ${status}: ${stderr.trim()}`,
    }
  } finally {
    if (fixture) {
      rmSync(join(root, file), { force: true })
    }
  }
}

for (const hookCase of HOOK_CASES) {
  try {
    const { ok, detail } = checkHookCase(hookCase)
    report(ok, `hook ${hookCase.name}`, detail)
  } catch (error) {
    report(false, `hook ${hookCase.name}`, error.message)
  }
}
const statusChanged = gitStatus() !== statusBefore
report(
  !statusChanged,
  'copies',
  statusChanged ? 'git status changed: a copy was left behind' : 'git status is as before',
)

console.log(failures === 0 ? '\nEvery check fired.' : `\n${failures} check(s) failed.`)
process.exitCode = failures === 0 ? 0 : 1
