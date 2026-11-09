// preact/compat's event members, which merchant callbacks may call.
export type ReactLikeEvent<E extends Event> = E & {
  persist: () => void
  isPropagationStopped: () => boolean
  isDefaultPrevented: () => boolean
  nativeEvent: E
}

// Adds them to the event itself, as preact/compat does, so the callback gets the same object.
export const withReactEventMembers = <E extends Event>(event: E): ReactLikeEvent<E> =>
  Object.assign(event, {
    persist: () => {},
    isPropagationStopped: () => event.cancelBubble,
    isDefaultPrevented: () => event.defaultPrevented,
    nativeEvent: event,
  })
