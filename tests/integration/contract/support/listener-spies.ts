// Counts the event listeners that a bundle leaves attached, per target and event type, so the leak
// tests can say "no worse than master". It spies on EventTarget.prototype and keeps the listeners
// of `window`, `document`, `document.body` and of each MediaQueryList that matchMedia returns.
type Listener = EventListenerOrEventListenerObject
type Counts = Record<string, number>

const labelOf = (target: unknown, mediaQueryLists: Set<unknown>): string | undefined => {
  if (target === window) return 'window'
  if (target === document) return 'document'
  if (target === document.body) return 'document.body'
  return mediaQueryLists.has(target) ? 'MediaQueryList' : undefined
}

export type ListenerSpies = {
  /** Forgets what was recorded. Listeners attached before the reset are not counted. */
  reset: () => void
  /** Listeners still attached since the last reset ("added minus removed"), keyed `target:type`. */
  attached: () => Counts
  restore: () => void
}

/**
 * Call it before the bundle loads, because the bundle may read window.matchMedia when it loads. Each
 * MediaQueryList is wrapped so that the spies see its listeners. addListener counts as `change`.
 */
export const spyOnListeners = (): ListenerSpies => {
  const mediaQueryLists = new Set<unknown>()
  // Per target, the listeners attached by type. A Set per type, because the same listener added
  // twice is attached once.
  let recorded = new Map<unknown, Map<string, Set<Listener>>>()

  const add = (target: unknown, type: string, listener: Listener) => {
    const byType = recorded.get(target) ?? new Map<string, Set<Listener>>()
    recorded.set(target, byType)
    byType.set(type, (byType.get(type) ?? new Set()).add(listener))
  }
  const remove = (target: unknown, type: string, listener: Listener) => {
    recorded.get(target)?.get(type)?.delete(listener)
  }

  // jsdom gives `window` its own addEventListener, so patching the prototype alone would miss it.
  const patched = [EventTarget.prototype, window].map((target) => {
    const owner: EventTarget = target
    const originalAdd = owner.addEventListener
    const originalRemove = owner.removeEventListener
    owner.addEventListener = function spiedAdd(
      this: EventTarget,
      type: string,
      listener: Listener | null,
      ...rest: [AddEventListenerOptions | boolean | undefined]
    ) {
      if (listener && labelOf(this, mediaQueryLists)) add(this, type, listener)
      return originalAdd.call(this, type, listener, ...rest)
    } as typeof originalAdd
    owner.removeEventListener = function spiedRemove(
      this: EventTarget,
      type: string,
      listener: Listener | null,
      ...rest: [EventListenerOptions | boolean | undefined]
    ) {
      if (listener) remove(this, type, listener)
      return originalRemove.call(this, type, listener, ...rest)
    } as typeof originalRemove
    return { owner, originalAdd, originalRemove }
  })

  const originalMatchMedia = window.matchMedia
  window.matchMedia = (query: string) => {
    const list = originalMatchMedia.call(window, query)
    mediaQueryLists.add(list)
    const { addEventListener, removeEventListener, addListener, removeListener } = list
    list.addEventListener = (type: string, listener: Listener, ...rest: never[]) => {
      add(list, type, listener)
      return addEventListener.call(list, type, listener, ...rest)
    }
    list.removeEventListener = (type: string, listener: Listener, ...rest: never[]) => {
      remove(list, type, listener)
      return removeEventListener.call(list, type, listener, ...rest)
    }
    list.addListener = (listener) => {
      add(list, 'change', listener as Listener)
      return addListener.call(list, listener)
    }
    list.removeListener = (listener) => {
      remove(list, 'change', listener as Listener)
      return removeListener.call(list, listener)
    }
    return list
  }

  return {
    reset: () => {
      recorded = new Map()
    },
    attached: () => {
      const counts: Counts = {}
      recorded.forEach((byType, target) => {
        const label = labelOf(target, mediaQueryLists)
        byType.forEach((listeners, type) => {
          if (listeners.size > 0)
            counts[`${label}:${type}`] = (counts[`${label}:${type}`] ?? 0) + listeners.size
        })
      })
      return counts
    },
    restore: () => {
      patched.reverse().forEach(({ owner, originalAdd, originalRemove }) => {
        // eslint-disable-next-line no-param-reassign
        owner.addEventListener = originalAdd
        // eslint-disable-next-line no-param-reassign
        owner.removeEventListener = originalRemove
      })
      window.matchMedia = originalMatchMedia
    },
  }
}
