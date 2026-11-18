// A media query list that a test drives. It records its change listeners.
class FakeMediaQueryList extends EventTarget implements MediaQueryList {
  readonly media: string

  onchange: MediaQueryList['onchange'] = null

  readonly listeners = new Set<EventListenerOrEventListenerObject>()

  private readonly isMatching: (query: string) => boolean

  constructor(media: string, isMatching: (query: string) => boolean) {
    super()
    this.media = media
    this.isMatching = isMatching
  }

  get matches(): boolean {
    return this.isMatching(this.media)
  }

  override addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: AddEventListenerOptions | boolean,
  ): void {
    super.addEventListener(type, listener, options)
    if (type === 'change' && listener) {
      this.listeners.add(listener)
    }
  }

  override removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: EventListenerOptions | boolean,
  ): void {
    super.removeEventListener(type, listener, options)
    if (type === 'change' && listener) {
      this.listeners.delete(listener)
    }
  }

  // The deprecated names of the two methods above.
  addListener(listener: MediaQueryList['onchange']): void {
    this.addEventListener('change', listener as EventListener | null)
  }

  removeListener(listener: MediaQueryList['onchange']): void {
    this.removeEventListener('change', listener as EventListener | null)
  }
}

export type FakeMatchMedia = {
  // Like a browser, fires change on the lists of that query only when its value changes.
  setMatches: (query: string, matches: boolean) => void
  // The change listeners on every list of that query.
  listenerCount: (query: string) => number
}

// Call it in a describe. Each test starts with only `matching` matching, and the default
// matchMedia of setup-jsdom.ts comes back after it.
export const useFakeMatchMedia = (matching: string[] = []): FakeMatchMedia => {
  let matchingNow = new Set<string>()
  let lists: FakeMediaQueryList[] = []
  let original: typeof window.matchMedia

  beforeEach(() => {
    matchingNow = new Set(matching)
    lists = []
    original = window.matchMedia
    // A new list on each call, as browsers do.
    window.matchMedia = (query: string) => {
      const list = new FakeMediaQueryList(query, (media) => matchingNow.has(media))
      lists.push(list)
      return list
    }
  })

  afterEach(() => {
    window.matchMedia = original
  })

  const listsOf = (query: string) => lists.filter((list) => list.media === query)

  return {
    setMatches: (query, matches) => {
      if (matchingNow.has(query) === matches) {
        return
      }
      if (matches) {
        matchingNow.add(query)
      } else {
        matchingNow.delete(query)
      }
      // jsdom has no MediaQueryListEvent.
      listsOf(query).forEach((list) =>
        list.dispatchEvent(Object.assign(new Event('change'), { matches, media: query })),
      )
    },
    listenerCount: (query) =>
      listsOf(query).reduce((count, list) => count + list.listeners.size, 0),
  }
}
