import { LightDomElement } from '@/shared/custom-elements/light-dom-element'
import { ModalPortalController } from '@/widgets/eligibility-modal/controllers/modal-portal.controller'

class ModalPortalHost extends LightDomElement {
  readonly modal = new ModalPortalController(this)
}
customElements.define('test-modal-portal-host', ModalPortalHost)

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

  describe('open', () => {
    it('should focus the content before the frame', () => {
      const host = openModal()

      expect(document.activeElement).toBe(host.modal.content)
    })

    it('should focus the content without scrolling the page', () => {
      const focus = vi.spyOn(HTMLElement.prototype, 'focus')
      const host = openModal()

      expect(focus).toHaveBeenCalledTimes(1)
      expect(focus.mock.contexts[0]).toBe(host.modal.content)
      expect(focus).toHaveBeenCalledWith({ preventScroll: true })
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
    it('should give the focus back to the element that had it', () => {
      const button = appendButton()
      const host = appendHost()
      button.focus()

      host.modal.open()
      runFrames()
      host.modal.close()

      expect(document.activeElement).toBe(button)
    })
  })

  describe('with two open modals', () => {
    it('should send the focus from a sentinel to the last opened content', () => {
      openModal()
      const second = openModal()
      const button = appendButton()
      button.focus()

      ;(sentinels()[0] as HTMLElement).focus()

      expect(document.activeElement).toBe(second.modal.content)
    })
  })
})
