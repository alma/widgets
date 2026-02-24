export type FocusTrapCleanup = () => void

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

/**
 * Minimal focus trap for modal dialogs.
 *
 * The handler must be attached to the modal container.
 */
export function createFocusTrap(modalEl: HTMLElement): (evt: Event) => void {
  return (evt: Event) => {
    const event = evt as KeyboardEvent
    if (event.key !== 'Tab') return

    const focusableElements = modalEl.querySelectorAll(FOCUSABLE_SELECTOR)
    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }
}

/**
 * Ensures the modal itself is focusable and moves focus to a preferred element.
 */
export function focusInitialElement(modalEl: HTMLElement, preferred?: HTMLElement | null) {
  if (!modalEl.hasAttribute('tabindex')) {
    modalEl.setAttribute('tabindex', '-1')
  }

  const target = preferred || modalEl

  // Defer until after framework rendering flushed.
  queueMicrotask(() => target.focus())
}
