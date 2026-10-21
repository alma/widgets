import { globSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import postcss from 'postcss'

const SRC_DIR = resolve(__dirname, '..')

// master's !important declarations. No new ones.
const MASTER_IMPORTANT: Record<string, number> = {
  'widgets/eligibility-modal/templates/modal-shell.module.css': 1,
  'widgets/payment-plans/templates/payment-plans.module.css': 3,
}

const countImportant = (file: string): number => {
  let count = 0
  postcss.parse(readFileSync(file, 'utf8')).walkDecls((decl) => {
    if (decl.important) count += 1
  })
  return count
}

describe('CSS limits', () => {
  const files = globSync('**/*.css', { cwd: SRC_DIR })

  it('finds the CSS files of src/', () => {
    expect(files).toContain('styles/main.css')
  })

  it.each(files)('adds no !important to %s', (file) => {
    expect(countImportant(resolve(SRC_DIR, file))).toBeLessThanOrEqual(MASTER_IMPORTANT[file] ?? 0)
  })
})
