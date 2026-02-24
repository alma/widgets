type InertRecord = {
  el: HTMLElement
  previousAriaHidden: string | null
}

type FocusableRecord = {
  el: HTMLElement
  previousTabIndex: string | null
  wasDisabled: boolean
}

const inertRecords = new WeakMap<HTMLElement, InertRecord>()
const focusableRecords = new WeakMap<HTMLElement, FocusableRecord[]>()

function supportsInert(): boolean {
  try {
    return typeof (HTMLElement.prototype as any).inert !== 'undefined'
  } catch {
    // Some test DOM implementations throw on HTMLElement.prototype access.
    return false
  }
}

const FOCUSABLE_DESCENDANTS_SELECTOR =
  'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'

function disableFocusableDescendants(container: HTMLElement) {
  const list: FocusableRecord[] = []

  const focusables = Array.from(
    container.querySelectorAll(FOCUSABLE_DESCENDANTS_SELECTOR),
  ) as HTMLElement[]

  focusables.forEach((node) => {
    const previousTabIndex = node.getAttribute('tabindex')
    const isFormControl =
      node instanceof HTMLButtonElement ||
      node instanceof HTMLInputElement ||
      node instanceof HTMLSelectElement ||
      node instanceof HTMLTextAreaElement

    const wasDisabled = isFormControl ? (node as any).disabled === true : false

    // Make it non-focusable.
    node.setAttribute('tabindex', '-1')

    // Disable interactive controls to avoid mouse/keyboard activations.
    if (isFormControl) {
      ;(node as any).disabled = true
    }

    list.push({ el: node, previousTabIndex, wasDisabled })
  })

  focusableRecords.set(container, list)
}

function restoreFocusableDescendants(container: HTMLElement) {
  const list = focusableRecords.get(container)
  if (!list) return

  list.forEach((record) => {
    if (record.previousTabIndex === null) {
      record.el.removeAttribute('tabindex')
    } else {
      record.el.setAttribute('tabindex', record.previousTabIndex)
    }

    const isFormControl =
      record.el instanceof HTMLButtonElement ||
      record.el instanceof HTMLInputElement ||
      record.el instanceof HTMLSelectElement ||
      record.el instanceof HTMLTextAreaElement

    if (isFormControl) {
      ;(record.el as any).disabled = record.wasDisabled
    }
  })

  focusableRecords.delete(container)
}

export function setElementsInert(elements: HTMLElement[], isInert: boolean) {
  const useInert = supportsInert()

  elements.forEach((el) => {
    if (isInert) {
      if (useInert) {
        ;(el as any).inert = true
        ;(el.style as any).pointerEvents = 'none'
      } else {
        inertRecords.set(el, { el, previousAriaHidden: el.getAttribute('aria-hidden') })
        el.setAttribute('aria-hidden', 'true')
        ;(el.style as any).pointerEvents = 'none'
        disableFocusableDescendants(el)
      }
    } else {
      if (useInert) {
        ;(el as any).inert = false
        ;(el.style as any).pointerEvents = ''
      } else {
        const record = inertRecords.get(el)
        if (record) {
          if (record.previousAriaHidden === null) {
            el.removeAttribute('aria-hidden')
          } else {
            el.setAttribute('aria-hidden', record.previousAriaHidden)
          }
          inertRecords.delete(el)
        } else {
          el.removeAttribute('aria-hidden')
        }

        ;(el.style as any).pointerEvents = ''
        restoreFocusableDescendants(el)
      }
    }
  })
}

export function collectBackgroundElements(modalHost: HTMLElement): HTMLElement[] {
  const candidates = Array.from(document.body.children) as HTMLElement[]
  return candidates.filter((el) => el !== modalHost && !el.contains(modalHost))
}
