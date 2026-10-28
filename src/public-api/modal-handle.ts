import type { ModalOptions } from '@/public-api/public-api.types'

export type ModalHandle = {
  open: () => void
  close: (event: MouseEvent | KeyboardEvent) => void
}

// Passed in by widgets.ts, which owns the hosts, to avoid an import cycle.
type ModalHostActions = {
  mountModal: (container: Element, close: ModalHandle['close']) => void
  removeHost: (container: Element) => void
}

// The container is the one that add() found, as on master. Without it, open() and close() do
// nothing.
export const createModalHandle = (
  container: Element | null,
  onClose: ModalOptions['onClose'],
  { mountModal, removeHost }: ModalHostActions,
): ModalHandle => {
  // As on master, removes any widget in the container, not only the modal.
  const close: ModalHandle['close'] = (event) => {
    if (!container) {
      return
    }
    removeHost(container)
    onClose?.(event)
  }

  const open = (): void => {
    if (container) {
      mountModal(container, close)
    }
  }

  return { open, close }
}
