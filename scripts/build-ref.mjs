// Builds the reference bundle: master's React code at the commit in scripts/ref-sha.txt (or in
// REF), from a git worktree in .ref-worktree/, into dist-ref/. The contract tests run on it first.
import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const worktree = resolve(root, '.ref-worktree')
const output = resolve(root, 'dist-ref')
const force = process.argv.includes('--force')

const run = (command, args, options = {}) =>
  execFileSync(command, args, { cwd: root, stdio: 'inherit', ...options })
const read = (command, args) => execFileSync(command, args, { cwd: root, encoding: 'utf8' }).trim()

const requested =
  process.env.REF?.trim() || readFileSync(resolve(root, 'scripts/ref-sha.txt'), 'utf8').trim()

try {
  // The commit may be missing from a shallow or stale clone.
  run('git', ['fetch', 'origin', 'master'])
  const sha = read('git', ['rev-parse', '--verify', `${requested}^{commit}`])

  const shaFile = resolve(output, 'REF_SHA')
  if (
    !force &&
    existsSync(shaFile) &&
    existsSync(resolve(output, 'widgets.umd.js')) &&
    readFileSync(shaFile, 'utf8').trim() === sha
  ) {
    console.log('dist-ref is up to date')
    process.exit(0)
  }

  run('git', ['worktree', 'prune'])
  if (existsSync(worktree)) {
    run('git', ['-C', worktree, 'checkout', '--detach', '--force', sha])
  } else {
    run('git', ['worktree', 'add', '--detach', worktree, sha])
  }

  // HUSKY=0 stops master's prepare script from changing the hooks config that all worktrees share.
  run('npm', ['ci'], { cwd: worktree, env: { ...process.env, HUSKY: '0' } })
  run('npm', ['run', 'build'], {
    cwd: worktree,
    env: { ...process.env, BUILD_VERSION: 'contract-test' },
  })

  rmSync(output, { recursive: true, force: true })
  cpSync(resolve(worktree, 'dist'), output, { recursive: true })
  writeFileSync(shaFile, `${sha}\n`)
  console.log(`dist-ref built from ${sha}`)
} catch (error) {
  console.error(`build:ref failed: ${error.message}`)
  process.exit(1)
}
