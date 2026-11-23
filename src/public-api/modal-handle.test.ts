import { createModalHandle, openOnClick } from '@/public-api/modal-handle'

describe('createModalHandle', () => {
  it('should call remove(), then onClose with the same event, even with nothing mounted', () => {
    const render = vi.fn()
    const remove = vi.fn()
    const onClose = vi.fn()
    const event = new KeyboardEvent('keydown', { key: 'Escape' })

    createModalHandle(onClose, { render, remove }).close(event)

    expect(remove).toHaveBeenCalledOnce()
    expect(remove).toHaveBeenCalledBefore(onClose)
    expect(onClose).toHaveBeenCalledOnce()
    expect(onClose.mock.calls[0][0]).toBe(event)
    expect(render).not.toHaveBeenCalled()
  })
})

describe('openOnClick', () => {
  const button = (id: string) => document.getElementById(id) as HTMLButtonElement

  beforeEach(() => {
    document.body.innerHTML = `
      <button id="first" class="trigger" type="button">First</button>
      <button id="second" class="trigger" type="button">Second</button>
    `
  })

  it('should listen on the first match only', () => {
    const open = vi.fn()

    openOnClick('.trigger', open)
    button('second').click()
    expect(open).not.toHaveBeenCalled()

    button('first').click()
    expect(open).toHaveBeenCalledOnce()
  })

  it('should not prevent the default action', () => {
    openOnClick('.trigger', vi.fn())
    const click = new MouseEvent('click', { bubbles: true, cancelable: true })

    button('first').dispatchEvent(click)

    expect(click.defaultPrevented).toBe(false)
  })

  it('should never remove a listener', () => {
    const first = vi.fn()
    const second = vi.fn()

    openOnClick('.trigger', first)
    button('first').click()
    openOnClick('.trigger', second)
    button('first').click()

    expect(first).toHaveBeenCalledTimes(2)
    expect(second).toHaveBeenCalledOnce()
  })

  it('should warn once and throw nothing for an invalid selector', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    expect(() => openOnClick('#', vi.fn())).not.toThrow()

    expect(warn).toHaveBeenCalledOnce()
    expect(warn).toHaveBeenCalledWith(
      '[Alma widgets] add() got an invalid clickableSelector "#".',
      expect.objectContaining({ name: 'SyntaxError' }),
    )
  })
})
