import { html, render } from 'lit'
import { userEvent } from 'vitest/browser'

import { LightDomElement } from '@/shared/ui/lit/light-dom-element'
import { mockButtonPlans } from '@/test/fixtures'
import { mountWidget } from '@/test/mount-widget'
import {
  ModalPortalController,
  type RequestClose,
} from '@/widgets/eligibility-modal/controllers/modal-portal.controller'
import styles from '@/widgets/eligibility-modal/templates/modal-shell.module.css'

class ModalPortalHost extends LightDomElement {
  readonly modal = new ModalPortalController(this)
}
customElements.define('test-modal-portal-host', ModalPortalHost)

class ModalCloseHost extends LightDomElement {
  readonly onRequestClose = vi.fn<RequestClose>()

  readonly modal = new ModalPortalController(this, this.onRequestClose)
}
customElements.define('test-modal-close-host', ModalCloseHost)

// Resolves after the frames that are already requested.
const nextFrame = (): Promise<number> =>
  new Promise((resolve) => {
    requestAnimationFrame(resolve)
  })

describe('the modal portal', () => {
  const SCROLL_Y = 500
  let host: ModalPortalHost
  let button: HTMLButtonElement

  beforeEach(() => {
    button = document.createElement('button')
    button.type = 'button'
    button.textContent = 'Open'
    const page = document.createElement('div')
    page.style.height = '3000px'
    host = document.createElement('test-modal-portal-host') as ModalPortalHost
    document.body.append(button, page, host)
    window.scrollTo(0, SCROLL_Y)
    button.focus({ preventScroll: true })
  })

  afterEach(() => {
    host.modal.close()
    window.scrollTo(0, 0)
  })

  it('should focus the content without scrolling, then lock the scroll one frame later', async () => {
    const root = document.documentElement

    host.modal.open()

    expect(document.activeElement).toBe(host.modal.content)
    expect(window.scrollY).toBe(SCROLL_Y)
    expect(root.style.position).toBe('')

    await nextFrame()

    expect(root.style.position).toBe('fixed')
    expect(root.style.overflow).toBe('hidden')
    expect(root.style.top).toBe(`-${SCROLL_Y}px`)
  })

  it('should style the portal with the real CSS module', () => {
    host.modal.open()

    expect(styles.overlay).not.toBe('overlay')
    expect(window.getComputedStyle(host.modal.overlay).position).toBe('fixed')
  })

  it('should restore the scroll position and the focus on close', async () => {
    const root = document.documentElement
    host.modal.open()
    await nextFrame()

    host.modal.close()

    expect(window.scrollY).toBe(SCROLL_Y)
    expect(document.activeElement).toBe(button)
    expect(root.style.position).toBe('')
    expect(root.style.top).toBe('')
    expect(root.style.width).toBe('')
    expect(root.style.overflow).toBe('')
  })

  it('should never lock the scroll when the modal closes before the frame', async () => {
    host.modal.open()
    host.modal.close()
    await nextFrame()

    expect(document.documentElement.style.position).toBe('')
    expect(document.activeElement).toBe(button)
  })
})

// Headless Chromium says HeadlessChrome, which react-modal's check takes for desktop Safari.
const CHROME_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
const SAFARI_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'

describe('the focus trap', () => {
  let host: ModalPortalHost

  const appendButton = (label: string, attributes: Record<string, string> = {}) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = label
    Object.entries(attributes).forEach(([name, value]) => button.setAttribute(name, value))
    host.modal.content.append(button)
    return button
  }

  beforeEach(() => {
    host = document.createElement('test-modal-portal-host') as ModalPortalHost
    document.body.append(host)
    host.modal.open()
  })

  afterEach(() => {
    host.modal.close()
  })

  describe('with buttons that are not tabbable after the last real control', () => {
    let first: HTMLButtonElement
    let last: HTMLButtonElement

    beforeEach(() => {
      first = appendButton('First')
      appendButton('Middle')
      last = appendButton('Last')
      appendButton('Disabled', { disabled: '' })
      appendButton('Hidden', { style: 'display: none' })
      appendButton('Not tabbable', { tabindex: '-1' })
    })

    it('should wrap from the last real control to the first one on Tab', async () => {
      last.focus()

      await userEvent.tab()

      expect(document.activeElement).toBe(first)
    })

    it('should wrap from the first control to the last real one on Shift+Tab', async () => {
      first.focus()

      await userEvent.tab({ shift: true })

      expect(document.activeElement).toBe(last)
    })
  })

  it('should count the controls inside an open shadow root', async () => {
    const first = appendButton('First')
    const shadowHost = document.createElement('div')
    const shadowButton = document.createElement('button')
    // eslint-disable-next-line no-restricted-syntax -- react-modal's tabbable.js looks inside open shadow roots.
    shadowHost.attachShadow({ mode: 'open' }).append(shadowButton)
    host.modal.content.append(shadowHost)
    first.focus()

    await userEvent.tab()

    expect(shadowHost.shadowRoot?.activeElement).toBe(shadowButton)

    await userEvent.tab()

    expect(document.activeElement).toBe(first)
  })

  // Each counted element is alone before the elements that react-modal skips,
  // so Tab wraps to it only when none of them counts.
  describe('with an element followed by the elements that react-modal skips', () => {
    /* eslint-disable lit-a11y/anchor-is-valid -- react-modal skips a link with no href. */
    const SKIPPED = html` <a>No href</a>
      <div hidden><button type="button">In a hidden element</button></div>
      <input style="width: 0; height: 0; padding: 0; border: 0" />
      <div style="width: 0; height: 0; overflow: hidden">
        <button type="button">Clipped</button>
      </div>
      <span tabindex="0" style="display: contents"></span>
      <svg style="display: none"><g tabindex="0"></g></svg>`
    /* eslint-enable lit-a11y/anchor-is-valid */

    // In desktop Safari, a wrong walk would call focus() on a hidden element, which does nothing.
    beforeEach(() => {
      vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(CHROME_USER_AGENT)
    })

    it.each([
      ['a link', html`<a href="#top">Link</a>`],
      [
        'a button in display contents',
        html`<div style="display: contents"><button type="button">Button</button></div>`,
      ],
      [
        'a button that overflows a zero-size box',
        html`<div style="width: 0; height: 0"><button type="button">Button</button></div>`,
      ],
      ['an element with a tabindex', html`<span tabindex="0">Span</span>`],
    ])('should keep the focus on %s on Tab', async (_, counted) => {
      render(html`${counted}${SKIPPED}`, host.modal.content)
      const element = host.modal.content.querySelector<HTMLElement>('a[href], button, [tabindex]')
      element?.focus()

      await userEvent.tab()

      expect(document.activeElement).toBe(element)
    })
  })

  it('should let the browser move the focus from a container that a skip link focused', async () => {
    appendButton('First')
    const container = document.createElement('div')
    container.tabIndex = -1
    container.textContent = 'Schedule'
    host.modal.content.append(container)
    const next = appendButton('Next')
    appendButton('Last')
    container.focus()
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(CHROME_USER_AGENT)

    await userEvent.tab()

    expect(document.activeElement).toBe(next)
  })

  describe('with a control that the browser focuses but react-modal skips', () => {
    let middle: HTMLButtonElement
    let clipped: HTMLButtonElement
    let last: HTMLButtonElement

    beforeEach(() => {
      appendButton('First')
      middle = appendButton('Middle')
      const clip = document.createElement('div')
      clip.style.cssText = 'width: 0; height: 0; overflow: hidden'
      clipped = document.createElement('button')
      clip.append(clipped)
      host.modal.content.append(clip)
      last = appendButton('Last')
      middle.focus()
    })

    it.each([
      ['in Chrome', CHROME_USER_AGENT, () => clipped],
      ['in desktop Safari', SAFARI_USER_AGENT, () => last],
      ['in Safari on an iPad', SAFARI_USER_AGENT.replace('Macintosh', 'iPad'), () => clipped],
    ])('should move the focus as react-modal does %s', async (_, userAgent, expected) => {
      vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(userAgent)

      await userEvent.tab()

      expect(document.activeElement).toBe(expected())
    })

    it('should walk back past it on Shift+Tab in desktop Safari', async () => {
      vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(SAFARI_USER_AGENT)
      last.focus()

      await userEvent.tab({ shift: true })

      expect(document.activeElement).toBe(middle)
    })
  })

  it.each([
    ['Tab', false, 'First'],
    ['Shift+Tab', true, 'Last'],
  ])(
    'should send the focus from a container that a skip link focused on %s in desktop Safari',
    async (_, shift, expected) => {
      appendButton('First')
      const container = document.createElement('div')
      container.tabIndex = -1
      host.modal.content.append(container)
      appendButton('Last')
      container.focus()
      vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(SAFARI_USER_AGENT)

      await userEvent.tab({ shift })

      expect(document.activeElement?.textContent).toBe(expected)
    },
  )

  it('should read the keyCode when the event has no code', () => {
    const first = appendButton('First')
    const last = appendButton('Last')
    last.focus()

    last.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 9, bubbles: true }))

    expect(document.activeElement).toBe(first)
  })

  it('should focus the content on an overlay click when no callback closes the modal', async () => {
    appendButton('First').focus()

    await userEvent.click(host.modal.overlay, { position: { x: 5, y: 5 } })

    expect(document.activeElement).toBe(host.modal.content)
  })

  describe('with the focus on the content', () => {
    it('should focus the first tabbable element on Tab', async () => {
      const first = appendButton('First')
      appendButton('Last')

      await userEvent.tab()

      expect(document.activeElement).toBe(first)
    })

    it('should focus the last tabbable element on Shift+Tab', async () => {
      appendButton('First')
      const last = appendButton('Last')

      await userEvent.tab({ shift: true })

      expect(document.activeElement).toBe(last)
    })

    it('should keep the focus on the content when nothing is tabbable', async () => {
      appendButton('Disabled', { disabled: '' })

      await userEvent.tab()

      expect(document.activeElement).toBe(host.modal.content)
    })
  })
})

describe('closing the modal', () => {
  const OVERLAY_POSITION = { x: 5, y: 5 }
  let host: ModalCloseHost

  beforeEach(() => {
    host = document.createElement('test-modal-close-host') as ModalCloseHost
    document.body.append(host)
    host.modal.open()
  })

  afterEach(() => {
    host.modal.close()
  })

  it('should request the close on Escape and stop the event', async () => {
    const documentListener = vi.fn()
    document.addEventListener('keydown', documentListener)
    onTestFinished(() => document.removeEventListener('keydown', documentListener))

    await userEvent.keyboard('{Escape}')

    expect(host.onRequestClose).toHaveBeenCalledTimes(1)
    const [event] = host.onRequestClose.mock.calls[0]
    expect(event).toBeInstanceOf(KeyboardEvent)
    expect((event as KeyboardEvent).key).toBe('Escape')
    expect(documentListener).not.toHaveBeenCalled()
  })

  it('should read the keyCode when the event has no code', () => {
    host.modal.content.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 27, bubbles: true }))

    expect(host.onRequestClose).toHaveBeenCalledTimes(1)
  })

  it('should request the close on a click on the overlay', async () => {
    await userEvent.click(host.modal.overlay, { position: OVERLAY_POSITION })

    expect(host.onRequestClose).toHaveBeenCalledTimes(1)
    expect(host.onRequestClose.mock.calls[0][0]).toBeInstanceOf(MouseEvent)
  })

  it('should not request the close on a click in the content', async () => {
    await userEvent.click(host.modal.content)

    expect(host.onRequestClose).not.toHaveBeenCalled()
  })

  it('should forget a press in the content when the modal opens again', async () => {
    host.modal.content.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    host.modal.close()
    host.modal.open()

    await userEvent.click(host.modal.overlay, { position: OVERLAY_POSITION })

    expect(host.onRequestClose).toHaveBeenCalledTimes(1)
  })

  describe('when the press and the release are not both on the overlay', () => {
    // Proves that the browser fired the click on the overlay.
    let overlayClicks: number

    beforeEach(() => {
      overlayClicks = 0
      host.modal.overlay.addEventListener('click', (event) => {
        if (event.target === host.modal.overlay) overlayClicks += 1
      })
    })

    it('should not request the close for a press in the content', async () => {
      await userEvent.dragAndDrop(host.modal.content, host.modal.overlay, {
        targetPosition: OVERLAY_POSITION,
      })

      expect(overlayClicks).toBe(1)
      expect(host.onRequestClose).not.toHaveBeenCalled()
    })

    it('should not request the close for a release in the content', async () => {
      await userEvent.dragAndDrop(host.modal.overlay, host.modal.content, {
        sourcePosition: OVERLAY_POSITION,
      })

      expect(overlayClicks).toBe(1)
      expect(host.onRequestClose).not.toHaveBeenCalled()
    })
  })

  it('should send the focus from either sentinel to the content', () => {
    const outside = document.createElement('button')
    document.body.insertBefore(outside, host)
    const sentinels = document.querySelectorAll<HTMLElement>('[data-react-modal-body-trap]')

    expect(sentinels).toHaveLength(2)
    sentinels.forEach((sentinel) => {
      outside.focus()

      sentinel.focus()

      expect(document.activeElement).toBe(host.modal.content)
    })
  })
})

describe('the modal opened from the PaymentPlans widget', () => {
  const knowMore = () =>
    document.querySelector<HTMLButtonElement>(
      '[aria-label="Ouvrir les options de paiement Alma pour en savoir plus"]',
    )!

  beforeEach(async () => {
    // The browser project has no msw server, so nothing must reach the network.
    vi.spyOn(window, 'fetch').mockResolvedValue(Response.json(mockButtonPlans))
    await mountWidget('PaymentPlans', { purchaseAmount: 40000 })
    await vi.waitFor(() => expect(knowMore()).not.toBeNull())
    await userEvent.click(knowMore())
    await vi.waitFor(() => expect(document.querySelector('.ReactModalPortal')).not.toBeNull())
  })

  it.each([
    ['Escape', () => userEvent.keyboard('{Escape}')],
    [
      'the close button',
      () => userEvent.click(document.querySelector('[data-testid="modal-close-button"]')!),
    ],
  ])('should give the focus back to the know-more button after %s', async (_name, close) => {
    await close()

    await vi.waitFor(() => expect(document.querySelector('.ReactModalPortal')).toBeNull())
    expect(document.activeElement).toBe(knowMore())
  })
})
