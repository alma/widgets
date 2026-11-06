import type { ReactiveController, ReactiveControllerHost } from 'lit'
import noScroll from 'no-scroll'

import styles from '@/widgets/eligibility-modal/templates/modal-shell.module.css'

export type ModalPortalHost = ReactiveControllerHost & HTMLElement

// react-modal's class names, which merchant CSS targets.
const PORTAL_CLASS = 'ReactModalPortal'
const OVERLAY_CLASS = 'ReactModal__Overlay'
const CONTENT_CLASS = 'ReactModal__Content'
const BODY_OPEN_CLASS = 'ReactModal__Body--open'

// Shared by every modal of this bundle, like react-modal's module state.
const openPortals: ModalPortalController[] = []
let sentinels: [HTMLDivElement, HTMLDivElement] | null = null

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

  private opened = false

  private returnFocusTo: HTMLElement | null = null

  private afterOpenFrame: number | null = null

  constructor(host: ModalPortalHost) {
    this.host = host
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
  }

  focusContent(): void {
    if (!this.content.contains(document.activeElement)) {
      this.content.focus({ preventScroll: true })
    }
  }

  private setClasses(afterOpen: boolean): void {
    this.overlay.className = buildClassName(OVERLAY_CLASS, afterOpen, styles.overlay)
    this.content.className = buildClassName(CONTENT_CLASS, afterOpen, styles.modal)
  }
}
