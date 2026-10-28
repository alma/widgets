import type { ModalOptions } from '@/public-api/public-api.types'

export type ModalHandle = {
  open: () => void
  close: (event: MouseEvent | KeyboardEvent) => void
}

// Passed in by widgets.ts, which owns the hosts, to avoid an import cycle.
type ModalHostActions = {
  mount: (close: ModalHandle['close']) => void
  remove: () => void
}

export const createModalHandle = (
  onClose: ModalOptions['onClose'],
  { mount, remove }: ModalHostActions,
): ModalHandle => {
  // As on master, removes any widget in the container, not only the modal.
  const close: ModalHandle['close'] = (event) => {
    remove()
    onClose?.(event)
  }

  const open = (): void => {
    mount(close)
  }

  return { open, close }
}
