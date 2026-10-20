import type { MockInstance } from 'vitest'

import { resetWarnOnce, warnOnce } from '@/shared/lib/errors'

describe('warnOnce', () => {
  let warn: MockInstance<typeof console.warn>

  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    resetWarnOnce()
    warn.mockRestore()
  })

  it('should log a message with the [Alma widgets] prefix', () => {
    warnOnce('Something is wrong.')

    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn).toHaveBeenCalledWith('[Alma widgets] Something is wrong.')
  })

  it('should pass the error to the console as is', () => {
    const error = new Error('broken')

    warnOnce('Something is wrong.', error)

    expect(warn).toHaveBeenCalledWith('[Alma widgets] Something is wrong.', error)
  })

  it('should log the same message only once', () => {
    warnOnce('Something is wrong.')
    warnOnce('Something is wrong.')

    expect(warn).toHaveBeenCalledTimes(1)
  })

  it('should log a different message separately', () => {
    warnOnce('Something is wrong.')
    warnOnce('Something else is wrong.')

    expect(warn).toHaveBeenCalledTimes(2)
    expect(warn).toHaveBeenLastCalledWith('[Alma widgets] Something else is wrong.')
  })

  it('should log the same message again after a reset', () => {
    warnOnce('Something is wrong.')
    resetWarnOnce()
    warnOnce('Something is wrong.')

    expect(warn).toHaveBeenCalledTimes(2)
  })

  it('should not throw when console.warn throws', () => {
    warn.mockImplementation(() => {
      throw new Error('broken console')
    })

    expect(() => warnOnce('Something is wrong.')).not.toThrow()
  })
})
