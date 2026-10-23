// PostToolUse hook: lints the .ts or .css file under src/ that Claude just edited, with the config
// of the checkout that holds it. Exit code 2 shows the errors to Claude, after the edit. Exit code
// 1 means the hook itself failed: the transcript shows the first line, and Claude gets nothing.
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, extname, join, relative, sep } from 'node:path'

const MAX_ERRORS = 20

// .git is a folder in the main checkout and a file in a worktree.
const findCheckout = (file) => {
  let dir = dirname(file)
  while (!existsSync(join(dir, '.git'))) {
    const parent = dirname(dir)
    if (parent === dir) {
      return undefined
    }
    dir = parent
  }
  return dir
}

const readFilePath = () => {
  let input
  try {
    input = JSON.parse(readFileSync(0, 'utf8'))
  } catch {
    throw new Error('the hook input is not JSON')
  }
  const file = input?.tool_input?.file_path
  if (typeof file !== 'string') {
    throw new Error('the hook input has no tool_input.file_path')
  }
  return file
}

const load = (root, name) => {
  try {
    return createRequire(join(root, 'package.json'))(name)
  } catch {
    throw new Error(`can't load ${name} from ${root}: run npm ci`)
  }
}

const lintTs = async (root, file) => {
  const { ESLint } = load(root, 'eslint')
  // lint-staged runs Prettier at commit time, and Prettier also adds the final newline.
  const eslint = new ESLint({
    cwd: root,
    overrideConfig: { rules: { 'prettier/prettier': 'off', 'eol-last': 'off' } },
  })
  if (await eslint.isPathIgnored(file)) {
    return []
  }
  const [result] = await eslint.lintFiles([file])
  return result.messages
    .filter((message) => message.severity === 2)
    .map((message) => ({
      line: message.line ?? 0,
      column: message.column ?? 0,
      rule: message.ruleId ?? 'parser',
      text: message.message,
    }))
}

const lintCss = async (root, file) => {
  const stylelint = load(root, 'stylelint')
  const { results } = await stylelint.lint({ files: [file] })
  return results
    .flatMap((result) => result.warnings)
    .filter((warning) => warning.severity === 'error')
    .map((warning) => ({
      line: warning.line,
      column: warning.column,
      rule: warning.rule,
      // Stylelint ends the text with the rule name, which the report already shows.
      text: warning.text.replace(` (${warning.rule})`, ''),
    }))
}

const LINTERS = { '.ts': lintTs, '.css': lintCss }

const format = (name, errors) => {
  const shown = errors.slice(0, MAX_ERRORS)
  const at = (error) => `${error.line}:${error.column}`
  const atWidth = Math.max(...shown.map((error) => at(error).length))
  const ruleWidth = Math.max(...shown.map((error) => error.rule.length))
  return [
    `${name} has ${errors.length} lint error(s). The edit is saved: fix the file.`,
    ...shown.map(
      (error) => `  ${at(error).padEnd(atWidth)}  ${error.rule.padEnd(ruleWidth)}  ${error.text}`,
    ),
    ...(errors.length > MAX_ERRORS
      ? [`  and ${errors.length - MAX_ERRORS} more: run npm run lint.`]
      : []),
  ].join('\n')
}

const main = async () => {
  const file = readFilePath()
  const lint = LINTERS[extname(file)]
  if (!lint) {
    return 0
  }
  const root = findCheckout(file)
  if (!root || !relative(root, file).startsWith(`src${sep}`)) {
    return 0
  }
  // typescript-eslint looks for tsconfig.json in the working directory.
  process.chdir(root)
  const errors = await lint(root, file)
  if (errors.length === 0) {
    return 0
  }
  console.error(format(relative(root, file), errors))
  return 2
}

try {
  process.exitCode = await main()
} catch (error) {
  console.error(`lint-edited-file: ${String(error?.message ?? error).split('\n')[0]}`)
  process.exitCode = 1
}
