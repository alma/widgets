export interface MediaQueryWatch {
  readonly matches: boolean
  stop(): void
}

// For a query that must listen outside the host's lifecycle. Call stop() to remove the listener.
export const watchMediaQuery = (
  query: string,
  onChange: (matches: boolean) => void,
): MediaQueryWatch => {
  // Firefox returns null in a hidden iframe.
  const list = window.matchMedia?.(query) ?? null
  const listener = (event: MediaQueryListEvent): void => onChange(event.matches)
  list?.addEventListener('change', listener)
  return {
    get matches() {
      return list?.matches ?? false
    },
    stop: () => list?.removeEventListener('change', listener),
  }
}
