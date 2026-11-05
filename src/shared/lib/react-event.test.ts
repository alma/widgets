import { withReactEventMembers } from '@/shared/lib/react-event'

describe('withReactEventMembers', () => {
  it('should return the same event, as its own native event', () => {
    const event = new MouseEvent('click')

    const reactEvent = withReactEventMembers(event)

    expect(reactEvent).toBe(event)
    expect(reactEvent.nativeEvent).toBe(event)
    expect(reactEvent.persist()).toBeUndefined()
  })

  it('should read the propagation and default states of the event', () => {
    const event = withReactEventMembers(new KeyboardEvent('keydown', { cancelable: true }))
    expect(event.isPropagationStopped()).toBe(false)
    expect(event.isDefaultPrevented()).toBe(false)

    event.stopPropagation()
    event.preventDefault()

    expect(event.isPropagationStopped()).toBe(true)
    expect(event.isDefaultPrevented()).toBe(true)
  })
})
