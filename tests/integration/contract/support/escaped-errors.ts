// An escaped error is a throw from add(), a window `error` event or an unhandled rejection. The
// minified messages change from one build to the next, so the tests only compare error types.
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

/**
 * Runs a scenario while collecting the escaped errors. The listeners go back to Vitest even when
 * the scenario throws, so assert on the result after it returns.
 */
export const withEscapes = async <T>(
  scenario: () => T | Promise<T>,
): Promise<{ result: T; escaped: string[] }> => {
  const escapes = collectEscapes()
  let result: T
  try {
    result = await scenario()
  } catch (error) {
    await escapes.stop()
    throw error
  }
  return { result, escaped: await escapes.stop() }
}
