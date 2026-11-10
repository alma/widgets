import type { ReactiveController, ReactiveControllerHost } from 'lit'
import noScroll from 'no-scroll'

import { scopeTab } from '@/widgets/eligibility-modal/controllers/focus-trap'
import styles from '@/widgets/eligibility-modal/templates/modal-shell.module.css'

export type ModalPortalHost = ReactiveControllerHost & HTMLElement

export type RequestClose = (event: KeyboardEvent | MouseEvent) => void

// react-modal's class names, which merchant CSS targets.
const PORTAL_CLASS = 'ReactModalPortal'
const OVERLAY_CLASS = 'ReactModal__Overlay'
const CONTENT_CLASS = 'ReactModal__Content'
const BODY_OPEN_CLASS = 'ReactModal__Body--open'

// Shared by every modal of this bundle, like react-modal's module state.
const openPortals: ModalPortalController[] = []
const portalsByHost = new WeakMap<Element, ModalPortalController>()
let sentinels: [HTMLDivElement, HTMLDivElement] | null = null

// react-modal also reads the deprecated keyCode.
const isTabKey = (event: KeyboardEvent): boolean => event.code === 'Tab' || event.keyCode === 9
const isEscKey = (event: KeyboardEvent): boolean => event.code === 'Escape' || event.keyCode === 27

const focusLastContent = (): void => {
  openPortals[openPortals.length - 1]?.focusContent()
}

const createSentinel = (): HTMLDivElement => {
  const sentinel = document.createElement('div')
  sentinel.setAttribute('data-react-modal-body-trap', '')
  // Through the CSSOM: a strict style-src CSP blocks the style attribute.
  sentinel.style.position = 'absolute'
  sentinel.style.opacity = '0'
  sentinel.setAttribute('tabindex', '0')
  sentinel.addEventListener('focus', focusLastContent)
  return sentinel
}

// react-modal's bodyTrap: one sentinel first in <body> and one last, while any modal is open.
const syncSentinels = (): void => {
  sentinels ??= [createSentinel(), createSentinel()]
  const [before, after] = sentinels
  const { body } = document
  if (openPortals.length === 0) {
    before.remove()
    after.remove()
    return
  }
  if (body.firstChild !== before) {
    body.insertBefore(before, body.firstChild)
  }
  if (body.lastChild !== after) {
    body.append(after)
  }
}

const buildClassName = (base: string, afterOpen: boolean, extra: string): string =>
  afterOpen ? `${base} ${base}--after-open ${extra}` : `${base} ${extra}`

// Renders the markup of react-modal 3.16.3 at the end of <body>, as master's modal does.
export class ModalPortalController implements ReactiveController {
  readonly portal: HTMLDivElement

  readonly overlay: HTMLDivElement

  readonly content: HTMLDivElement

  private readonly host: ModalPortalHost

  private readonly onRequestClose?: RequestClose

  private readonly onClose?: () => void

  private opened = false

  private returnFocusTo: HTMLElement | null = null

  private afterOpenFrame: number | null = null

  // react-modal's shouldClose: a press, a release or a click in the content sets it to false,
  // and each overlay click resets it.
  private shouldClose: boolean | null = null

  // Kept for the controller's life: pass a function that reads the host's current state,
  // because a host built in a field initializer gets its properties only after construction.
  constructor(host: ModalPortalHost, onRequestClose?: RequestClose, onClose?: () => void) {
    this.host = host
    this.onRequestClose = onRequestClose
    this.onClose = onClose
    this.portal = document.createElement('div')
    this.portal.className = PORTAL_CLASS
    this.overlay = document.createElement('div')
    this.content = document.createElement('div')
    // Master's attribute order.
    this.content.id = 'alma-widget-modal-main-container'
    this.setClasses(false)
    this.content.setAttribute('tabindex', '-1')
    this.content.setAttribute('role', 'dialog')
    this.content.setAttribute('aria-modal', 'true')
    this.content.setAttribute('aria-labelledby', 'modal-title')
    // No element has this ID on master either.
    this.content.setAttribute('aria-describedby', 'modal-info-element')
    this.overlay.append(this.content)
    this.portal.append(this.overlay)
    portalsByHost.set(host, this)
    host.addController(this)
  }

  get isOpen(): boolean {
    return this.opened
  }

  hostDisconnected(): void {
    // A host moved in the same task is connected again by then, and keeps its modal open.
    queueMicrotask(() => {
      if (!this.host.isConnected) {
        this.close()
      }
    })
  }

  // A host out of the page won't disconnect again, so nothing would close its modal.
  open(): void {
    if (this.opened || !this.host.isConnected) return
    this.opened = true
    document.body.classList.add(BODY_OPEN_CLASS)
    openPortals.push(this)
    syncSentinels()
    this.returnFocusTo = document.activeElement as HTMLElement | null
    this.shouldClose = null
    this.toggleListeners(true)
    document.body.append(this.portal)
    this.focusContent()
    this.afterOpenFrame = requestAnimationFrame(() => {
      this.afterOpenFrame = null
      this.setClasses(true)
      noScroll.on()
    })
  }

  // Master's order: Preact unmounts react-modal's Modal, which removes the portal, before its
  // ModalPortal, which runs the rest.
  close(): void {
    if (!this.opened) return
    this.opened = false
    if (this.afterOpenFrame !== null) {
      cancelAnimationFrame(this.afterOpenFrame)
      this.afterOpenFrame = null
    }
    this.portal.remove()
    this.toggleListeners(false)
    this.setClasses(false)
    // Only the last open modal removes it.
    if (openPortals.length === 1) {
      document.body.classList.remove(BODY_OPEN_CLASS)
    }
    this.returnFocusTo?.focus()
    this.returnFocusTo = null
    noScroll.off()
    openPortals.splice(openPortals.indexOf(this), 1)
    syncSentinels()
    this.onClose?.()
  }

  focusContent(): void {
    if (!this.content.contains(document.activeElement)) {
      this.content.focus({ preventScroll: true })
    }
  }

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (isTabKey(event)) {
      scopeTab(this.content, event)
    }
    if (isEscKey(event)) {
      event.stopPropagation()
      this.onRequestClose?.(event)
    }
  }

  private readonly keepOpen = (): void => {
    this.shouldClose = false
  }

  // A click whose press or release was in the content bubbles here as the overlay's, since the
  // overlay is the closest common ancestor.
  private readonly handleOverlayClick = (event: MouseEvent): void => {
    const shouldClose = this.shouldClose ?? true
    this.shouldClose = null
    if (!shouldClose) return
    if (this.onRequestClose) {
      this.onRequestClose(event)
      return
    }
    this.focusContent()
  }

  // One list for both directions, so a listener can't be added without being removed.
  private toggleListeners(listen: boolean): void {
    const listeners: [HTMLElement, string, EventListener][] = [
      [this.content, 'keydown', this.handleKeyDown as EventListener],
      [this.content, 'mousedown', this.keepOpen],
      [this.content, 'mouseup', this.keepOpen],
      [this.content, 'click', this.keepOpen],
      [this.overlay, 'click', this.handleOverlayClick as EventListener],
    ]
    listeners.forEach(([target, type, listener]) => {
      if (listen) {
        target.addEventListener(type, listener)
        return
      }
      target.removeEventListener(type, listener)
    })
  }

  private setClasses(afterOpen: boolean): void {
    this.overlay.className = buildClassName(OVERLAY_CLASS, afterOpen, styles.overlay)
    this.content.className = buildClassName(CONTENT_CLASS, afterOpen, styles.modal)
  }
}

// Master unmounts the modal at once when the facade replaces or closes it. A host removed any other
// way closes its modal a microtask later, so a host put back in the same task keeps it, as on master.
export const closeModalOf = (host: Element): void => {
  portalsByHost.get(host)?.close()
}
