// An escaped error is a throw from add(), a window `error` event or an unhandled rejection. The
// minified messages differ between the two builds, so the tests only ever compare error types.
import { expect } from 'vitest'

export type Escapes = {
  /** The type of each escaped error, in order. */
  types: string[]
  /** Records a throw that the test caught around add() or a timer. */
  record: (error: unknown) => void
  /** Stops listening and hands the unhandled-rejection listeners back to Vitest. */
  stop: () => Promise<string[]>
}

export const typeOf = (error: unknown): string =>
  error instanceof Error || (typeof error === 'object' && error !== null && 'name' in error)
    ? String((error as { name: unknown }).name)
    : typeof error

/**
 * Collects the escaped errors until stop() runs. While it listens, it takes the unhandled
 * rejections away from Vitest, which fails a run on any of them. stop() puts Vitest's listeners
 * back, so a rejection that escapes outside this window still fails the run.
 */
export const collectEscapes = (): Escapes => {
  const types: string[] = []
  const record = (error: unknown) => {
    types.push(typeOf(error))
  }

  const onWindowError = (event: ErrorEvent) => {
    event.preventDefault()
    record(event.error ?? event)
  }
  window.addEventListener('error', onWindowError)

  const savedRejection = process.listeners('unhandledRejection')
  const savedException = process.listeners('uncaughtException')
  process.removeAllListeners('unhandledRejection')
  process.removeAllListeners('uncaughtException')
  process.on('unhandledRejection', record)
  process.on('uncaughtException', record)

  return {
    types,
    record,
    stop: async () => {
      // Node reports a rejection once the microtask queue has drained, so let it do that.
      await new Promise((resolve) => {
        setImmediate(resolve)
      })
      await new Promise((resolve) => {
        setImmediate(resolve)
      })
      window.removeEventListener('error', onWindowError)
      process.removeAllListeners('unhandledRejection')
      process.removeAllListeners('uncaughtException')
      savedRejection.forEach((listener) => process.on('unhandledRejection', listener))
      savedException.forEach((listener) => process.on('uncaughtException', listener))
      return types
    },
  }
}

const countByType = (types: string[]): Record<string, number> =>
  types.reduce<Record<string, number>>(
    (counts, type) => ({ ...counts, [type]: (counts[type] ?? 0) + 1 }),
    {},
  )

/**
 * Accepts the same escaped errors as master, or fewer, and fails on one more or on a type that
 * master doesn't throw.
 */
export const expectNoMoreEscaped = (actual: string[], master: string[]) => {
  const allowed = countByType(master)
  Object.entries(countByType(actual)).forEach(([type, count]) => {
    expect(count, `escaped ${type} errors, master has ${allowed[type] ?? 0}`).toBeLessThanOrEqual(
      allowed[type] ?? 0,
    )
  })
}
