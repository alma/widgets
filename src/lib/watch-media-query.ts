export interface MediaQueryWatch {
  readonly matches: boolean
  stop(): void
}

type ChangeListener = (event: MediaQueryListEvent) => void

const listen = (list: MediaQueryList, listener: ChangeListener) => {
  // Safari before 14 only has the deprecated addListener.
  if (typeof list.addEventListener !== 'function') {
    list.addListener(listener)
    return () => list.removeListener(listener)
  }
  list.addEventListener('change', listener)
  return () => list.removeEventListener('change', listener)
}

// For a query that must listen outside the host's lifecycle. Call stop() to remove the listener.
export const watchMediaQuery = (
  query: string,
  onChange: (matches: boolean) => void,
): MediaQueryWatch => {
  // Firefox returns null in a hidden iframe.
  const list = window.matchMedia?.(query) ?? null
  const stop = list ? listen(list, (event) => onChange(event.matches)) : () => {}
  return {
    get matches() {
      return list?.matches ?? false
    },
    stop,
  }
}
