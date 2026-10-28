import { html } from 'lit'

import { LightDomElement } from '@/shared/ui/lit/light-dom-element'
import { MediaQueryController } from '@/shared/ui/media-query.controller'
import { useFakeMatchMedia } from '@/test/match-media'

const WIDE = '(min-width: 800px)'

class MediaQueryHost extends LightDomElement {
  readonly wide = new MediaQueryController(this, WIDE)

  // The value that each render saw.
  renders: boolean[] = []

  protected override render() {
    this.renders.push(this.wide.matches)
    return html`${this.wide.matches ? 'wide' : 'narrow'}`
  }
}
customElements.define('test-media-query-host', MediaQueryHost)

const createHost = (): MediaQueryHost =>
  document.createElement('test-media-query-host') as MediaQueryHost

const appendHost = (): MediaQueryHost => {
  const host = createHost()
  document.body.append(host)
  return host
}

describe('MediaQueryController', () => {
  describe('with matchMedia', () => {
    const media = useFakeMatchMedia()

    it('should not match before the host connects', () => {
      media.setMatches(WIDE, true)

      expect(createHost().wide.matches).toBe(false)
    })

    it('should render the match from the first render on', () => {
      media.setMatches(WIDE, true)
      const host = appendHost()

      expect(host.renders).toEqual([true])
      expect(host.textContent).toBe('wide')
    })

    it('should render no match from the first render on', () => {
      const host = appendHost()

      expect(host.renders).toEqual([false])
      expect(host.textContent).toBe('narrow')
    })

    it('should update the host once on each change', async () => {
      const host = appendHost()

      media.setMatches(WIDE, true)
      await host.updateComplete
      expect(host.wide.matches).toBe(true)
      expect(host.renders).toEqual([false, true])

      media.setMatches(WIDE, false)
      await host.updateComplete
      expect(host.wide.matches).toBe(false)
      expect(host.renders).toEqual([false, true, false])
    })

    it('should listen only while the host is connected', () => {
      const host = appendHost()
      expect(media.listenerCount(WIDE)).toBe(1)

      host.remove()
      expect(media.listenerCount(WIDE)).toBe(0)

      document.body.append(host)
      expect(media.listenerCount(WIDE)).toBe(1)
    })

    it('should read the value again when the host reconnects', async () => {
      const host = appendHost()
      host.remove()
      media.setMatches(WIDE, true)
      expect(host.renders).toEqual([false])

      document.body.append(host)
      await host.updateComplete
      expect(host.wide.matches).toBe(true)
      expect(host.renders).toEqual([false, true])
    })

    it('should not update the host on reconnect when the value stayed the same', async () => {
      const host = appendHost()
      host.remove()

      document.body.append(host)
      await host.updateComplete
      expect(host.renders).toEqual([false])
    })

    it('should give each host its own listener', async () => {
      const first = appendHost()
      const second = appendHost()
      expect(media.listenerCount(WIDE)).toBe(2)

      first.remove()
      expect(media.listenerCount(WIDE)).toBe(1)

      media.setMatches(WIDE, true)
      await second.updateComplete
      expect(second.renders).toEqual([false, true])
      expect(first.renders).toEqual([false])
    })
  })

  describe('without matchMedia', () => {
    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('should not match when matchMedia is missing', () => {
      vi.stubGlobal('matchMedia', undefined)
      const host = createHost()

      expect(() => document.body.append(host)).not.toThrow()
      expect(host.renders).toEqual([false])
      expect(() => host.remove()).not.toThrow()
    })

    // Firefox in a hidden iframe.
    it('should not match when matchMedia returns null', () => {
      vi.spyOn(window, 'matchMedia').mockReturnValue(null as never)
      const host = createHost()

      expect(() => document.body.append(host)).not.toThrow()
      expect(host.renders).toEqual([false])
      expect(() => host.remove()).not.toThrow()
    })
  })
})
