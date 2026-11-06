import noScroll from 'no-scroll'

import { LightDomElement } from '@/shared/ui/lit/light-dom-element'
import { ModalPortalController } from '@/widgets/eligibility-modal/controllers/modal-portal.controller'

class ModalPortalHost extends LightDomElement {
  readonly modal = new ModalPortalController(this)
}
customElements.define('test-modal-portal-host', ModalPortalHost)

// What react-modal 3.16.3 renders on master, once the first frame has run.
const MASTER_PORTAL =
  '<div class="ReactModalPortal">' +
  '<div class="ReactModal__Overlay ReactModal__Overlay--after-open overlay">' +
  '<div id="alma-widget-modal-main-container" class="ReactModal__Content ReactModal__Content--after-open modal" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-info-element"></div>' +
  '</div>' +
  '</div>'
const MASTER_SENTINEL =
  '<div data-react-modal-body-trap="" style="position: absolute; opacity: 0;" tabindex="0"></div>'

const frames = new Map<number, FrameRequestCallback>()
let lastFrameId = 0

const runFrames = (): void => {
  const callbacks = [...frames.values()]
  frames.clear()
  callbacks.forEach((callback) => callback(0))
}

const appendHost = (): ModalPortalHost => {
  const host = document.createElement('test-modal-portal-host') as ModalPortalHost
  document.body.append(host)
  return host
}

const appendButton = (): HTMLButtonElement => {
  const button = document.createElement('button')
  button.type = 'button'
  document.body.append(button)
  return button
}

const sentinels = (): Element[] => [
  ...document.body.querySelectorAll(':scope > [data-react-modal-body-trap]'),
]

describe('ModalPortalController', () => {
  const hosts: ModalPortalHost[] = []

  const openModal = (): ModalPortalHost => {
    const host = appendHost()
    hosts.push(host)
    host.modal.open()
    return host
  }

  beforeEach(() => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      lastFrameId += 1
      frames.set(lastFrameId, callback)
      return lastFrameId
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      frames.delete(id)
    })
  })

  // The sentinels and the body class are shared by every modal, so no modal stays open.
  afterEach(() => {
    hosts.splice(0).forEach((host) => host.modal.close())
    frames.clear()
  })

  // First in the file: the sentinels are created once, on the first open.
  it('should set the sentinel styles through the CSSOM', () => {
    const setAttribute = vi.spyOn(Element.prototype, 'setAttribute')
    openModal()

    expect(setAttribute).toHaveBeenCalledWith('data-react-modal-body-trap', '')
    expect(setAttribute).not.toHaveBeenCalledWith('style', expect.anything())
  })

  describe('open', () => {
    it('should render master’s DOM after one animation frame', () => {
      const button = appendButton()
      const host = openModal()
      runFrames()

      const children = [...document.body.children]
      expect(children).toEqual([sentinels()[0], button, host, sentinels()[1], host.modal.portal])
      expect(host.modal.portal.outerHTML).toBe(MASTER_PORTAL)
      sentinels().forEach((sentinel) => expect(sentinel.outerHTML).toBe(MASTER_SENTINEL))
      expect(document.body.classList.contains('ReactModal__Body--open')).toBe(true)
      expect(noScroll.on).toHaveBeenCalledTimes(1)
    })

    it('should focus the content before the frame, without the after-open classes or the scroll lock', () => {
      const host = openModal()

      expect(host.modal.isOpen).toBe(true)
      expect(document.activeElement).toBe(host.modal.content)
      expect(host.modal.overlay.className).toBe('ReactModal__Overlay overlay')
      expect(host.modal.content.className).toBe('ReactModal__Content modal')
      expect(noScroll.on).not.toHaveBeenCalled()
    })

    it('should focus the content without scrolling the page', () => {
      const focus = vi.spyOn(HTMLElement.prototype, 'focus')
      const host = openModal()

      expect(focus).toHaveBeenCalledTimes(1)
      expect(focus.mock.contexts[0]).toBe(host.modal.content)
      expect(focus).toHaveBeenCalledWith({ preventScroll: true })
    })

    it('should do nothing when the modal is already open', () => {
      const host = openModal()
      const before = [...document.body.children]

      host.modal.open()

      expect([...document.body.children]).toEqual(before)
      expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1)
    })

    it('should do nothing when the host is out of the page', () => {
      const host = document.createElement('test-modal-portal-host') as ModalPortalHost

      host.modal.open()

      expect(host.modal.isOpen).toBe(false)
      expect(document.body.children).toHaveLength(0)
      expect(document.body.classList.contains('ReactModal__Body--open')).toBe(false)
      expect(window.requestAnimationFrame).not.toHaveBeenCalled()
    })

    it('should hide nothing outside the portal', () => {
      appendButton()
      const host = openModal()
      runFrames()

      const hidden = [...document.querySelectorAll('[inert], [aria-hidden]')].filter(
        (element) => !host.modal.portal.contains(element),
      )
      expect(hidden).toEqual([])
    })
  })

  describe('close', () => {
    it('should restore the body and the focus', () => {
      document.body.classList.add('merchant-class')
      const button = appendButton()
      const host = appendHost()
      button.focus()
      const classesBefore = [...document.body.classList]
      const childrenBefore = [...document.body.children]

      host.modal.open()
      runFrames()
      host.modal.close()

      expect(host.modal.isOpen).toBe(false)
      expect([...document.body.classList]).toEqual(classesBefore)
      expect([...document.body.children]).toEqual(childrenBefore)
      expect(document.activeElement).toBe(button)
      expect(noScroll.off).toHaveBeenCalledTimes(1)
    })

    it('should never add the after-open classes nor lock the scroll when it runs before the frame', () => {
      const host = openModal()

      host.modal.close()
      runFrames()

      expect(window.cancelAnimationFrame).toHaveBeenCalledTimes(1)
      expect(host.modal.content.className).toBe('ReactModal__Content modal')
      expect(noScroll.on).not.toHaveBeenCalled()
    })

    it('should drop the after-open classes, so the next open waits for a frame again', () => {
      const host = openModal()
      runFrames()
      host.modal.close()

      host.modal.open()

      expect(host.modal.overlay.className).toBe('ReactModal__Overlay overlay')
      expect(host.modal.content.className).toBe('ReactModal__Content modal')
    })

    it('should do nothing when the modal is closed', () => {
      const host = appendHost()

      host.modal.close()

      expect(noScroll.off).not.toHaveBeenCalled()
      expect([...document.body.children]).toEqual([host])
    })
  })

  describe('with two open modals', () => {
    it('should keep the sentinels and the body class until the last one closes', () => {
      const first = openModal()
      const second = openModal()
      const [before, after] = sentinels()
      expect([...document.body.children]).toEqual([
        before,
        first,
        first.modal.portal,
        second,
        after,
        second.modal.portal,
      ])

      first.modal.close()

      expect(sentinels()).toEqual([before, after])
      expect(document.body.firstChild).toBe(before)
      expect(document.body.classList.contains('ReactModal__Body--open')).toBe(true)

      second.modal.close()

      expect(sentinels()).toEqual([])
      expect(document.body.classList.contains('ReactModal__Body--open')).toBe(false)
    })

    it('should send the focus from a sentinel to the last opened content', () => {
      openModal()
      const second = openModal()
      const button = appendButton()
      button.focus()

      ;(sentinels()[0] as HTMLElement).focus()

      expect(document.activeElement).toBe(second.modal.content)
    })
  })

  describe('when the host leaves the page', () => {
    it('should close the modal after a microtask', async () => {
      const host = openModal()

      host.remove()
      expect(host.modal.isOpen).toBe(true)

      await Promise.resolve()
      expect(host.modal.isOpen).toBe(false)
      expect(host.modal.portal.isConnected).toBe(false)
      expect(sentinels()).toEqual([])
    })

    it('should keep the modal open when the host comes back in the same task', async () => {
      const host = openModal()

      host.remove()
      document.body.prepend(host)
      await Promise.resolve()

      expect(host.modal.isOpen).toBe(true)
      expect(document.body.lastElementChild).toBe(host.modal.portal)
    })

    it('should open again once the host is back', async () => {
      const host = openModal()
      host.remove()
      await Promise.resolve()
      host.modal.open()
      expect(host.modal.isOpen).toBe(false)

      document.body.append(host)
      host.modal.open()

      expect(host.modal.isOpen).toBe(true)
      expect(document.body.lastElementChild).toBe(host.modal.portal)
    })
  })
})
