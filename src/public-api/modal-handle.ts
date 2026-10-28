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

export const createModalHandle = (
  container: Element,
  onClose: ModalOptions['onClose'],
  { mountModal, removeHost }: ModalHostActions,
): ModalHandle => {
  // As on master, removes any widget in the container, not only the modal.
  const close: ModalHandle['close'] = (event) => {
    removeHost(container)
    onClose?.(event)
  }

  const open = (): void => {
    mountModal(container, close)
  }

  return { open, close }
}
