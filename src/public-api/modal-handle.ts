import { warnOnce } from '@/lib/errors'
import type { ModalHandle, ModalOptions } from '@/public-api/public-api.types'

// Passed in by widgets.ts, which owns the hosts, to avoid an import cycle.
type ModalHostActions = {
  render: (close: ModalHandle['close']) => void
  remove: () => void
}

export const createModalHandle = (
  onClose: ModalOptions['onClose'],
  { render, remove }: ModalHostActions,
): ModalHandle => {
  // Removes any widget in the container, not only the modal, and calls onClose
  // even when no modal is open. remove() closes the portal first.
  const close: ModalHandle['close'] = (event) => {
    remove()
    // Only a merchant's bare close() passes no event: the modal's own closes always send one.
    onClose?.(event as MouseEvent | KeyboardEvent)
  }

  const open = (): void => render(close)

  return { open, close }
}

// The first match only, never removed, default action kept.
export const openOnClick = (clickableSelector: string, open: () => void): void => {
  let clickable: Element | null
  try {
    clickable = document.querySelector(clickableSelector)
  } catch (error) {
    warnOnce(`add() got an invalid clickableSelector "${clickableSelector}".`, error)
    return
  }
  clickable?.addEventListener('click', open, false)
}
