// Counts the listeners a test leaves on window, document, body and each MediaQueryList.
type Listener = EventListenerOrEventListenerObject
type Options = AddEventListenerOptions | EventListenerOptions | boolean

export type ListenerCounts = Record<string, number>

export type ListenerSpies = {
  // Listeners added and not removed during the test, keyed `target:type`.
  attached: () => ListenerCounts
}

// Call it in a describe. The spies go in before each test and come out after it.
export const useListenerSpies = (): ListenerSpies => {
  const mediaQueryLists = new Set<unknown>()
  // The DOM keys a listener by its type, its callback and its capture flag.
  let recorded = new Map<unknown, Map<string, Set<string>>>()
  let callbackIds = new WeakMap<object, number>()
  let lastId = 0
  let restore = () => {}

  const labelOf = (target: unknown): string | undefined => {
    if (target === window) return 'window'
    if (target === document) return 'document'
    if (target === document.body) return 'document.body'
    return mediaQueryLists.has(target) ? 'MediaQueryList' : undefined
  }

  const keyOf = (listener: Listener, options?: Options) => {
    if (!callbackIds.has(listener)) {
      lastId += 1
      callbackIds.set(listener, lastId)
    }
    const capture = typeof options === 'object' ? options.capture : options
    return `${callbackIds.get(listener)}:${capture ? 'capture' : 'bubble'}`
  }

  const add = (target: unknown, type: string, listener: Listener | null, options?: Options) => {
    // A `once` listener removes itself when it fires, which the spy can't see.
    if (!listener || !labelOf(target) || (options as AddEventListenerOptions | undefined)?.once) {
      return
    }
    const byType = recorded.get(target) ?? new Map<string, Set<string>>()
    recorded.set(target, byType)
    byType.set(type, (byType.get(type) ?? new Set()).add(keyOf(listener, options)))
  }

  const remove = (target: unknown, type: string, listener: Listener | null, options?: Options) => {
    if (listener) recorded.get(target)?.get(type)?.delete(keyOf(listener, options))
  }

  beforeEach(() => {
    mediaQueryLists.clear()
    recorded = new Map()
    callbackIds = new WeakMap()

    // jsdom gives window its own addEventListener, which the prototype patch would miss.
    const owners: EventTarget[] = [EventTarget.prototype]
    if (Object.prototype.hasOwnProperty.call(window, 'addEventListener')) owners.push(window)
    const patched = owners.map((owner) => {
      const { addEventListener, removeEventListener } = owner
      Object.assign(owner, {
        addEventListener(
          this: EventTarget,
          type: string,
          listener: Listener | null,
          options?: Options,
        ) {
          add(this, type, listener, options)
          return addEventListener.call(this, type, listener, options)
        },
        removeEventListener(
          this: EventTarget,
          type: string,
          listener: Listener | null,
          options?: Options,
        ) {
          remove(this, type, listener, options)
          return removeEventListener.call(this, type, listener, options)
        },
      })
      return () => Object.assign(owner, { addEventListener, removeEventListener })
    })

    // The unit project's matchMedia returns plain objects, so each list gets wrapped.
    const { matchMedia } = window
    window.matchMedia = (query: string) => {
      const list = matchMedia.call(window, query)
      mediaQueryLists.add(list)
      const { addEventListener, removeEventListener, addListener, removeListener } = list
      Object.assign(list, {
        addEventListener: (type: string, listener: Listener, options?: Options) => {
          add(list, type, listener, options)
          return addEventListener.call(list, type, listener, options)
        },
        removeEventListener: (type: string, listener: Listener, options?: Options) => {
          remove(list, type, listener, options)
          return removeEventListener.call(list, type, listener, options)
        },
        addListener: (listener: MediaQueryList['onchange']) => {
          add(list, 'change', listener as Listener)
          return addListener.call(list, listener)
        },
        removeListener: (listener: MediaQueryList['onchange']) => {
          remove(list, 'change', listener as Listener)
          return removeListener.call(list, listener)
        },
      })
      return list
    }

    restore = () => {
      patched.reverse().forEach((undo) => undo())
      window.matchMedia = matchMedia
    }
  })

  afterEach(() => {
    restore()
  })

  return {
    attached: () => {
      const counts: ListenerCounts = {}
      recorded.forEach((byType, target) => {
        byType.forEach((listeners, type) => {
          const key = `${labelOf(target)}:${type}`
          if (listeners.size > 0) counts[key] = (counts[key] ?? 0) + listeners.size
        })
      })
      return counts
    },
  }
}
