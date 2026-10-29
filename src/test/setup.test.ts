import { screen } from '@testing-library/dom'
import noScroll from 'no-scroll'
import type { MockInstance } from 'vitest'
import { axe } from 'vitest-axe'

import { warnOnce } from '@/shared/lib/errors'
import styles from '@/widgets/payment-plans/templates/payment-plans.module.css'

// The tests of a describe block run in order, so the second test of a pair sees what the first one
// left behind.
describe('the test setup', () => {
  it("should fix Date.now() to master's today", () => {
    expect(Date.now()).toBe(1638350762000)
  })

  describe('between two tests', () => {
    let warn: MockInstance<typeof console.warn>

    beforeEach(() => {
      warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    })

    it('should let a test change the page, sessionStorage, the warnings and the mocks', () => {
      document.body.innerHTML = '<p>left behind</p>'
      document.body.classList.add('ReactModal__Body--open')
      sessionStorage.setItem('left-behind', 'true')
      warnOnce('Left behind.')
      vi.spyOn(Math, 'random').mockReturnValue(0)
      noScroll.on()

      expect(warn).toHaveBeenCalledOnce()
    })

    it('should start the next test from a clean state', () => {
      expect(document.body.childNodes).toHaveLength(0)
      expect(document.body.classList.contains('ReactModal__Body--open')).toBe(false)
      expect(sessionStorage).toHaveLength(0)
      expect(vi.isMockFunction(Math.random)).toBe(false)
      expect(noScroll.on).not.toHaveBeenCalled()

      warnOnce('Left behind.')

      expect(warn).toHaveBeenCalledOnce()
    })
  })

  describe('in jsdom', () => {
    it('should match no media query', () => {
      expect(window.matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(false)
    })

    it('should mock no-scroll', () => {
      expect(vi.isMockFunction(noScroll.on)).toBe(true)
    })

    it('should name CSS module classes after their keys', () => {
      expect(styles.planButton).toBe('planButton')
    })
  })

  describe('time zone', () => {
    it('should let a test switch to another zone', () => {
      process.env.TZ = 'Pacific/Kiritimati'

      expect(new Date().getTimezoneOffset()).toBe(-840)
    })

    it('should put the next test back in UTC', () => {
      expect(new Date().getTimezoneOffset()).toBe(0)
    })
  })

  it('should check accessibility with axe', async () => {
    document.body.innerHTML = '<main><button type="button">Pay in 3 installments</button></main>'

    expect(await axe(document.body)).toHaveNoViolations()
  })

  it("should find elements with testing-library's queries and jest-dom's matchers", () => {
    document.body.innerHTML = '<button type="button" aria-label="Open">?</button>'

    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument()
  })
})
