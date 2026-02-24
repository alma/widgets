export type InteractionType = 'keyboard' | 'pointer'

/**
 * Tiny helper to detect whether the last user interaction was via keyboard or pointer.
 *
 * This is used to gate UX that should only appear for keyboard navigation
 * (e.g. skip links). It's more reliable than relying on :focus-visible.
 */
export function createInteractionTracker(doc: Document) {
  let lastInteraction: InteractionType = 'pointer'

  const onKeyDown = (e: KeyboardEvent) => {
    // Ignore modifier-only keys.
    if (e.key === 'Shift' || e.key === 'Alt' || e.key === 'Meta' || e.key === 'Control') return
    lastInteraction = 'keyboard'
  }

  const onPointerDown = () => {
    lastInteraction = 'pointer'
  }

  return {
    start() {
      doc.addEventListener('keydown', onKeyDown, true)
      doc.addEventListener('pointerdown', onPointerDown, true)
    },
    stop() {
      doc.removeEventListener('keydown', onKeyDown, true)
      doc.removeEventListener('pointerdown', onPointerDown, true)
    },
    getLastInteraction(): InteractionType {
      return lastInteraction
    },
    /** @internal test helper */
    _setLastInteraction(next: InteractionType) {
      lastInteraction = next
    },
  }
}
