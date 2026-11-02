import { html } from 'lit'

import { LightDomElement } from '@/shared/ui/lit/light-dom-element'
import { AnnounceController } from '@/widgets/payment-plans/controllers/announce.controller'

class AnnounceHost extends LightDomElement {
  readonly announcer = new AnnounceController(this)

  protected override render() {
    return html`${this.announcer.text}`
  }
}
customElements.define('test-announce-host', AnnounceHost)

const appendHost = (): AnnounceHost => {
  const host = document.createElement('test-announce-host') as AnnounceHost
  document.body.append(host)
  return host
}

describe('AnnounceController', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Initial state', () => {
    it('should initialize with empty announcement text', () => {
      const { announcer } = appendHost()

      expect(announcer.text).toBe('')
    })

    it('should provide announce and clearAnnouncement functions', () => {
      const { announcer } = appendHost()

      expect(typeof announcer.announce).toBe('function')
      expect(typeof announcer.clearAnnouncement).toBe('function')
    })
  })

  describe('announce function', () => {
    it('should set announcement text immediately', async () => {
      const host = appendHost()
      const testMessage = 'Test announcement message'

      host.announcer.announce(testMessage)
      await host.updateComplete

      expect(host.announcer.text).toBe(testMessage)
      expect(host).toHaveTextContent(testMessage)
    })

    it('should clear announcement text after default delay (1000ms)', async () => {
      const host = appendHost()
      const testMessage = 'Test announcement message'

      host.announcer.announce(testMessage)

      expect(host.announcer.text).toBe(testMessage)

      vi.advanceTimersByTime(999)
      expect(host.announcer.text).toBe(testMessage)

      vi.advanceTimersByTime(1)
      await host.updateComplete

      expect(host.announcer.text).toBe('')
      expect(host).toHaveTextContent('')
    })

    it('should clear announcement text after custom delay', () => {
      const { announcer } = appendHost()
      const testMessage = 'Test announcement message'
      const customDelay = 2500

      announcer.announce(testMessage, customDelay)

      expect(announcer.text).toBe(testMessage)

      // Should still be present before the custom delay
      vi.advanceTimersByTime(2000)
      expect(announcer.text).toBe(testMessage)

      // Should be cleared after the custom delay
      vi.advanceTimersByTime(500)
      expect(announcer.text).toBe('')
    })

    it('should handle multiple consecutive announcements', () => {
      const { announcer } = appendHost()
      const firstMessage = 'First announcement'
      const secondMessage = 'Second announcement'

      announcer.announce(firstMessage, 1000)
      expect(announcer.text).toBe(firstMessage)

      // Make a second announcement before the first one clears
      vi.advanceTimersByTime(500)
      announcer.announce(secondMessage, 1000)
      expect(announcer.text).toBe(secondMessage)

      // The first clear was cancelled
      vi.advanceTimersByTime(500)
      expect(announcer.text).toBe(secondMessage)

      // The second announcement should clear after its delay
      vi.advanceTimersByTime(500)
      expect(announcer.text).toBe('')
    })

    it('should handle empty string announcements', () => {
      const { announcer } = appendHost()

      announcer.announce('')

      expect(announcer.text).toBe('')
    })
  })

  describe('clearAnnouncement function', () => {
    it('should clear announcement text immediately', () => {
      const { announcer } = appendHost()
      const testMessage = 'Test announcement message'

      announcer.announce(testMessage)
      expect(announcer.text).toBe(testMessage)

      announcer.clearAnnouncement()
      expect(announcer.text).toBe('')
    })

    it('should clear announcement even when called before auto-clear timer', () => {
      const { announcer } = appendHost()
      const testMessage = 'Test announcement message'

      announcer.announce(testMessage, 2000)
      expect(announcer.text).toBe(testMessage)

      // Clear manually before the 2000ms timer
      vi.advanceTimersByTime(500)
      announcer.clearAnnouncement()
      expect(announcer.text).toBe('')
      expect(vi.getTimerCount()).toBe(0)

      // Should still be empty after the original timer would have fired
      vi.advanceTimersByTime(1500)
      expect(announcer.text).toBe('')
    })

    it('should work when called on empty announcement text', () => {
      const { announcer } = appendHost()

      announcer.clearAnnouncement()

      expect(announcer.text).toBe('')
    })
  })

  describe('Edge cases', () => {
    it('should handle very short delay times', () => {
      const { announcer } = appendHost()
      const testMessage = 'Test announcement message'

      announcer.announce(testMessage, 1)
      expect(announcer.text).toBe(testMessage)

      vi.advanceTimersByTime(1)
      expect(announcer.text).toBe('')
    })

    it('should handle zero delay', () => {
      const { announcer } = appendHost()
      const testMessage = 'Test announcement message'

      announcer.announce(testMessage, 0)
      expect(announcer.text).toBe(testMessage)

      vi.advanceTimersByTime(0)
      expect(announcer.text).toBe('')
    })

    it('should handle very long messages', () => {
      const { announcer } = appendHost()
      const longMessage = 'A'.repeat(1000) // 1000 character message

      announcer.announce(longMessage)

      expect(announcer.text).toBe(longMessage)
      expect(announcer.text.length).toBe(1000)
    })
  })

  describe('Disconnect', () => {
    it('should empty the text and leave no timer once the host is removed', () => {
      const host = appendHost()
      host.announcer.announce('Test announcement message')

      host.remove()

      expect(host.announcer.text).toBe('')
      expect(vi.getTimerCount()).toBe(0)
    })

    it('should show no stale message when the host comes back', async () => {
      const host = appendHost()
      host.announcer.announce('Test announcement message')
      await host.updateComplete
      expect(host).toHaveTextContent('Test announcement message')

      host.remove()
      document.body.append(host)
      await host.updateComplete

      expect(host).toHaveTextContent('')
    })
  })
})
