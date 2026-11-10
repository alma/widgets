import { watchMediaQuery } from '@/shared/ui/watch-media-query'
import { useFakeMatchMedia } from '@/test/match-media'

const WIDE = '(min-width: 800px)'

describe('watchMediaQuery', () => {
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

  // Firefox returns null in a hidden iframe.
  it('should not match when matchMedia returns null', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue(null as unknown as MediaQueryList)

    const watch = watchMediaQuery(WIDE, vi.fn())

    expect(watch.matches).toBe(false)
    expect(() => watch.stop()).not.toThrow()
  })
})
