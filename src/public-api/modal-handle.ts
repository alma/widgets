import type { ModalOptions } from '@/public-api/public-api.types'
import { warnOnce } from '@/shared/lib/errors'

export type ModalHandle = {
  open: () => void
  close: (event: MouseEvent | KeyboardEvent) => void
}

// Passed in by widgets.ts, which owns the hosts, to avoid an import cycle.
type ModalHostActions = {
  render: (close: ModalHandle['close']) => void
  remove: () => void
}

export const createModalHandle = (
  onClose: ModalOptions['onClose'],
  { render, remove }: ModalHostActions,
): ModalHandle => {
  // As on master, removes any widget in the container, not only the modal, and calls onClose
  // even when no modal is open. remove() closes the portal first.
  const close: ModalHandle['close'] = (event) => {
    remove()
    onClose?.(event)
  }

  const open = (): void => render(close)

  return { open, close }
}

// As on master: the first match only, never removed, default action kept.
export const openOnClick = (clickableSelector: string, open: () => void): void => {
  let clickable: Element | null
  try {
    clickable = document.querySelector(clickableSelector)
  } catch (error) {
    // Master throws out of add().
    warnOnce(`add() got an invalid clickableSelector "${clickableSelector}".`, error)
    return
  }
  clickable?.addEventListener('click', open, false)
}
