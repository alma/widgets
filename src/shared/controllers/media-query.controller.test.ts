import { html } from 'lit'

import { MediaQueryController } from '@/shared/controllers/media-query.controller'
import { LightDomElement } from '@/shared/custom-elements/light-dom-element'
import { useFakeMatchMedia } from '@/test/utils/match-media'

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
  })
})
