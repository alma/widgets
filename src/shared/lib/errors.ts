const PREFIX = '[Alma widgets]'

const loggedMessages = new Set<string>()

export const warnOnce = (message: string, error?: unknown): void => {
  if (loggedMessages.has(message)) {
    return
  }
  loggedMessages.add(message)
  try {
    const args = error === undefined ? [] : [error]
    // eslint-disable-next-line no-console
    console.warn(`${PREFIX} ${message}`, ...args)
  } catch {
    // A broken console must not break the page.
  }
}

export const resetWarnOnce = (): void => {
  loggedMessages.clear()
}
