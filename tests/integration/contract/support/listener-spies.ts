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
  // Per target, the listeners attached by type. The DOM keys a listener by its type, its callback
  // and its capture flag, so the same callback added twice is attached once, and added with and
  // without capture is attached twice.
  let recorded = new Map<unknown, Map<string, Set<string>>>()
  const callbackIds = new WeakMap<object, number>()
  let lastId = 0
  const keyOf = (listener: Listener, options?: AddEventListenerOptions | boolean) => {
    if (!callbackIds.has(listener)) {
      lastId += 1
      callbackIds.set(listener, lastId)
    }
    const capture = typeof options === 'object' ? options?.capture : options
    return `${callbackIds.get(listener)}:${capture ? 'capture' : 'bubble'}`
  }

  const add = (
    target: unknown,
    type: string,
    listener: Listener,
    options?: AddEventListenerOptions | boolean,
  ) => {
    // A `once` listener removes itself when it fires, and the spy can't see that. It is not
    // counted, so a `once` listener that never fires goes unnoticed.
    if (typeof options === 'object' && options?.once) return
    const byType = recorded.get(target) ?? new Map<string, Set<string>>()
    recorded.set(target, byType)
    byType.set(type, (byType.get(type) ?? new Set()).add(keyOf(listener, options)))
  }
  const remove = (
    target: unknown,
    type: string,
    listener: Listener,
    options?: EventListenerOptions | boolean,
  ) => {
    recorded.get(target)?.get(type)?.delete(keyOf(listener, options))
  }

  // jsdom gives `window` its own addEventListener, so patching the prototype alone would miss it.
  // Where `window` has none, the prototype patch already covers it, and an own property added here
  // would outlive restore().
  const owners: EventTarget[] = [EventTarget.prototype]
  if (Object.prototype.hasOwnProperty.call(window, 'addEventListener')) owners.push(window)
  const patched = owners.map((target) => {
    const owner: EventTarget = target
    const originalAdd = owner.addEventListener
    const originalRemove = owner.removeEventListener
    owner.addEventListener = function spiedAdd(
      this: EventTarget,
      type: string,
      listener: Listener | null,
      options?: AddEventListenerOptions | boolean,
    ) {
      if (listener && labelOf(this, mediaQueryLists)) add(this, type, listener, options)
      return originalAdd.call(this, type, listener, options)
    } as typeof originalAdd
    owner.removeEventListener = function spiedRemove(
      this: EventTarget,
      type: string,
      listener: Listener | null,
      options?: EventListenerOptions | boolean,
    ) {
      if (listener) remove(this, type, listener, options)
      return originalRemove.call(this, type, listener, options)
    } as typeof originalRemove
    return { owner, originalAdd, originalRemove }
  })

  const originalMatchMedia = window.matchMedia
  window.matchMedia = (query: string) => {
    const list = originalMatchMedia.call(window, query)
    mediaQueryLists.add(list)
    const { addEventListener, removeEventListener, addListener, removeListener } = list
    list.addEventListener = (
      type: string,
      listener: Listener,
      options?: AddEventListenerOptions | boolean,
    ) => {
      add(list, type, listener, options)
      return addEventListener.call(list, type, listener, options)
    }
    list.removeEventListener = (
      type: string,
      listener: Listener,
      options?: EventListenerOptions | boolean,
    ) => {
      remove(list, type, listener, options)
      return removeEventListener.call(list, type, listener, options)
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
