import { readFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'

import { test as vitestTest } from 'vitest'

import { isReferenceBuild } from './load-bundle'

const contractDir = resolve(__dirname, '..')

const readExpectedFailures = (): Record<string, string> =>
  JSON.parse(readFileSync(resolve(contractDir, 'expected-failures.json'), 'utf8'))

/**
 * The ID of the running test: `<file relative to the contract folder> > <describe names> > <test name>`.
 * Once merged, these names don't change, because expected-failures.json keys on them.
 */
const currentTestId = (): string => {
  const { testPath, currentTestName } = expect.getState()
  return `${relative(contractDir, testPath ?? '')} > ${currentTestName}`
}

type TestFn = (...args: never[]) => unknown

const track =
  (fn: TestFn): TestFn =>
  async (...args) => {
    // The list only applies to the Lit build. The reference build must pass everything.
    const id = isReferenceBuild ? undefined : currentTestId()
    if (id === undefined || !(id in readExpectedFailures())) return fn(...args)

    let failed = false
    try {
      await fn(...args)
    } catch {
      failed = true
    }
    if (!failed) {
      throw new Error(
        `"${id}" passes on dist/. Remove it from tests/integration/contract/expected-failures.json.`,
      )
    }
    return undefined
  }

/** Same signature as Vitest's test(name, fn, timeout), plus the expected failures of dist/. */
export const test = (name: string, fn: TestFn, timeout?: number) =>
  vitestTest(name, track(fn) as never, timeout)

export const it = test
