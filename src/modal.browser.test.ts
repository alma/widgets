import { userEvent } from 'vitest/browser'

import { LightDomElement } from '@/shared/ui/lit/light-dom-element'
import { ModalPortalController } from '@/widgets/eligibility-modal/controllers/modal-portal.controller'
import styles from '@/widgets/payment-plans/templates/payment-plans.module.css'

class ModalPortalHost extends LightDomElement {
  readonly modal = new ModalPortalController(this)
}
customElements.define('test-modal-portal-host', ModalPortalHost)

// Resolves after the frames that are already requested.
const nextFrame = (): Promise<number> =>
  new Promise((resolve) => {
    requestAnimationFrame(resolve)
  })

// A placeholder until the modal's focus tests arrive. It checks what jsdom can't do.
describe('the browser project', () => {
  it('should apply the real CSS of a CSS module', () => {
    const button = document.createElement('button')
    button.className = styles.planButton
    document.body.append(button)

    expect(styles.planButton).not.toBe('planButton')
    expect(window.getComputedStyle(button).cursor).toBe('pointer')
    expect(button.getBoundingClientRect().height).toBeGreaterThan(0)
  })

  it('should move the focus with the Tab key', async () => {
    document.body.innerHTML =
      '<button type="button">First</button><button type="button">Second</button>'
    const [first, second] = document.querySelectorAll('button')
    first.focus()

    await userEvent.tab()

    expect(document.activeElement).toBe(second)

    await userEvent.tab({ shift: true })

    expect(document.activeElement).toBe(first)
  })
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
    const html = document.documentElement

    host.modal.open()

    expect(document.activeElement).toBe(host.modal.content)
    expect(window.scrollY).toBe(SCROLL_Y)
    expect(html.style.position).toBe('')

    await nextFrame()

    expect(html.style.position).toBe('fixed')
    expect(html.style.overflow).toBe('hidden')
    expect(html.style.top).toBe(`-${SCROLL_Y}px`)
  })

  it('should restore the scroll position and the focus on close', async () => {
    const html = document.documentElement
    host.modal.open()
    await nextFrame()

    host.modal.close()

    expect(window.scrollY).toBe(SCROLL_Y)
    expect(document.activeElement).toBe(button)
    expect(html.style.position).toBe('')
    expect(html.style.top).toBe('')
    expect(html.style.width).toBe('')
    expect(html.style.overflow).toBe('')
  })

  it('should never lock the scroll when the modal closes before the frame', async () => {
    host.modal.open()
    host.modal.close()
    await nextFrame()

    expect(document.documentElement.style.position).toBe('')
    expect(document.activeElement).toBe(button)
  })
})
