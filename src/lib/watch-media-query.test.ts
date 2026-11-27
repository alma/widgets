import { watchMediaQuery } from '@/lib/watch-media-query'
import { useFakeMatchMedia } from '@/test/utils/match-media'

const WIDE = '(min-width: 800px)'

describe('watchMediaQuery', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('with matchMedia', () => {
    const media = useFakeMatchMedia()

    it('should read the current match', () => {
      media.setMatches(WIDE, true)

      expect(watchMediaQuery(WIDE, vi.fn()).matches).toBe(true)
    })

    it('should call onChange on each change until stop()', () => {
      const onChange = vi.fn()
      const watch = watchMediaQuery(WIDE, onChange)

      media.setMatches(WIDE, true)
      expect(onChange).toHaveBeenCalledWith(true)
      expect(watch.matches).toBe(true)

      watch.stop()
      media.setMatches(WIDE, false)
      expect(onChange).toHaveBeenCalledOnce()
      expect(media.listenerCount(WIDE)).toBe(0)
    })
  })

  // Safari before 14 has no addEventListener on a MediaQueryList.
  it('should listen with addListener when the list has no addEventListener', () => {
    const addListener = vi.fn()
    const removeListener = vi.fn()
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: false,
      addListener,
      removeListener,
    } as unknown as MediaQueryList)
    const onChange = vi.fn()

    const watch = watchMediaQuery(WIDE, onChange)
    const [[listener]] = addListener.mock.calls
    listener({ matches: true })

    expect(onChange).toHaveBeenCalledWith(true)
    watch.stop()
    expect(removeListener).toHaveBeenCalledWith(listener)
  })

  it('should not match when matchMedia is missing', () => {
    vi.stubGlobal('matchMedia', undefined)

    const watch = watchMediaQuery(WIDE, vi.fn())

    expect(watch.matches).toBe(false)
    expect(() => watch.stop()).not.toThrow()
  })

  // Firefox returns null in a hidden iframe.
  it('should not match when matchMedia returns null', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue(null as unknown as MediaQueryList)

    const watch = watchMediaQuery(WIDE, vi.fn())

    expect(watch.matches).toBe(false)
    expect(() => watch.stop()).not.toThrow()
  })
})
