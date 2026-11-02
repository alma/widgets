import { html } from 'lit'

import { LightDomElement } from '@/shared/ui/lit/light-dom-element'
import { useFakeMatchMedia } from '@/test/match-media'
import { PlanCyclingController } from '@/widgets/payment-plans/controllers/plan-cycling.controller'

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

class PlanCyclingHost extends LightDomElement {
  iterateValues: number[] = []

  transitionDelay = 1000

  readonly cycling = new PlanCyclingController(this, () => ({
    iterateValues: this.iterateValues,
    transitionDelay: this.transitionDelay,
  }))

  protected override render() {
    return html`${this.cycling.current}`
  }
}
customElements.define('test-plan-cycling-host', PlanCyclingHost)

const appendHost = (iterateValues: number[], transitionDelay: number): PlanCyclingHost => {
  const host = document.createElement('test-plan-cycling-host') as PlanCyclingHost
  host.iterateValues = iterateValues
  host.transitionDelay = transitionDelay
  document.body.append(host)
  return host
}

describe('PlanCyclingController', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Initial state', () => {
    it('should initialize with first value when iterateValues is provided', () => {
      const host = appendHost([100, 200, 300], 1000)

      expect(host.cycling.current).toBe(100)
      expect(typeof host.cycling.onHover).toBe('function')
      expect(typeof host.cycling.onLeave).toBe('function')
    })

    it('should initialize with 0 when iterateValues is empty', () => {
      const host = appendHost([], 1000)

      expect(host.cycling.current).toBe(0)
    })
  })

  describe('Animation behavior', () => {
    it('should cycle through iterateValues automatically', async () => {
      const host = appendHost([100, 200, 300], 1000)

      expect(host.cycling.current).toBe(100)

      await vi.advanceTimersByTimeAsync(1000)
      expect(host.cycling.current).toBe(200)

      await vi.advanceTimersByTimeAsync(1000)
      expect(host.cycling.current).toBe(300)

      await vi.advanceTimersByTimeAsync(1000)
      expect(host.cycling.current).toBe(100)
    })

    it('should stop animation after one complete cycle', async () => {
      const host = appendHost([100, 200], 1000)

      expect(host.cycling.current).toBe(100)

      await vi.advanceTimersByTimeAsync(1000)
      expect(host.cycling.current).toBe(200)

      await vi.advanceTimersByTimeAsync(1000)
      expect(host.cycling.current).toBe(100)

      const currentValue = host.cycling.current
      await vi.advanceTimersByTimeAsync(2000)
      expect(host.cycling.current).toBe(currentValue)
    })
  })

  describe('Transition delay handling', () => {
    it('should enforce minimum delay of 1000ms', async () => {
      const host = appendHost([100, 200], 500)

      expect(host.cycling.current).toBe(100)

      await vi.advanceTimersByTimeAsync(500)
      expect(host.cycling.current).toBe(100)

      await vi.advanceTimersByTimeAsync(500)
      expect(host.cycling.current).toBe(200)
    })

    it('should disable animation when delay is -1', async () => {
      const host = appendHost([100, 200, 300], -1)

      const initialValue = host.cycling.current

      await vi.advanceTimersByTimeAsync(5000)

      expect(host.cycling.current).toBe(initialValue)
    })

    it('should use custom delay when it is >= 1000ms', async () => {
      const host = appendHost([100, 200], 2000)

      expect(host.cycling.current).toBe(100)

      await vi.advanceTimersByTimeAsync(1500)
      expect(host.cycling.current).toBe(100)

      await vi.advanceTimersByTimeAsync(500)
      expect(host.cycling.current).toBe(200)
    })
  })

  describe('Hover functionality', () => {
    it('should set current value and stop animation on hover', async () => {
      const host = appendHost([100, 200, 300], 1000)

      expect(host.cycling.current).toBe(100)

      host.cycling.onHover(200)
      expect(host.cycling.current).toBe(200)

      await vi.advanceTimersByTimeAsync(2000)
      expect(host.cycling.current).toBe(200)
    })

    it('should restart animation on leave', async () => {
      const host = appendHost([100, 200, 300], 1000)

      host.cycling.onHover(200)

      host.cycling.onLeave()

      await vi.advanceTimersByTimeAsync(1000)
      expect(host.cycling.current).toBe(300)
    })
  })

  describe('Prefers reduced motion', () => {
    useFakeMatchMedia([REDUCED_MOTION])

    it('should disable animation when user prefers reduced motion', async () => {
      const host = appendHost([100, 200, 300], 1000)

      const initialValue = host.cycling.current

      await vi.advanceTimersByTimeAsync(5000)

      expect(host.cycling.current).toBe(initialValue)
    })

    it('should still allow manual hover/leave when reduced motion is enabled', async () => {
      const host = appendHost([100, 200, 300], 1000)

      host.cycling.onHover(200)
      expect(host.cycling.current).toBe(200)

      host.cycling.onLeave()

      await vi.advanceTimersByTimeAsync(2000)
      expect(host.cycling.current).toBe(200)
    })
  })

  describe('Edge cases', () => {
    it('should handle empty iterateValues array', async () => {
      const host = appendHost([], 1000)

      await vi.advanceTimersByTimeAsync(2000)

      expect(host.cycling.current).toBe(0)
    })

    it('should handle single value in iterateValues', async () => {
      const host = appendHost([100], 1000)

      expect(host.cycling.current).toBe(100)

      await vi.advanceTimersByTimeAsync(1000)
      expect(host.cycling.current).toBe(100)
    })

    it('should handle component unmounting during animation', () => {
      const host = appendHost([100, 200, 300], 1000)

      host.remove()

      expect(() => vi.advanceTimersByTime(2000)).not.toThrow()
    })
  })

  describe('Hook stability', () => {
    it('should update when iterateValues change', async () => {
      const host = appendHost([100, 200], 1000)

      expect(host.cycling.current).toBe(100)

      host.iterateValues = [300, 400, 500]
      host.requestUpdate()
      await host.updateComplete

      expect(host.cycling.current).toBe(300)

      await vi.advanceTimersByTimeAsync(1000)
      expect(host.cycling.current).toBe(400)
    })
  })

  describe('SSR compatibility', () => {
    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('should handle absence of matchMedia gracefully', () => {
      vi.stubGlobal('matchMedia', undefined)

      expect(() => appendHost([100, 200, 300], 1000)).not.toThrow()
    })

    it('should cycle when matchMedia is missing', async () => {
      vi.stubGlobal('matchMedia', undefined)
      const host = appendHost([100, 200, 300], 1000)

      await vi.advanceTimersByTimeAsync(1000)

      expect(host.cycling.current).toBe(200)
    })
  })

  describe('Host lifecycle', () => {
    it('should change nothing and leave no timer after a disconnect', async () => {
      const host = appendHost([100, 200, 300], 1000)

      host.remove()
      host.requestUpdate()
      await host.updateComplete
      await vi.advanceTimersByTimeAsync(5000)

      expect(host.cycling.current).toBe(100)
      expect(vi.getTimerCount()).toBe(0)
    })

    it('should take the next step one full delay after a reconnect mid-cycle', async () => {
      const host = appendHost([100, 200, 300], 1000)
      await vi.advanceTimersByTimeAsync(600)
      host.remove()
      await vi.advanceTimersByTimeAsync(5000)

      document.body.append(host)
      await vi.advanceTimersByTimeAsync(999)
      expect(host.cycling.current).toBe(100)

      await vi.advanceTimersByTimeAsync(1)
      expect(host.cycling.current).toBe(200)
    })

    it('should stay paused after a reconnect until the next leave', async () => {
      const host = appendHost([100, 200, 300], 1000)
      host.cycling.onHover(200)
      host.remove()

      document.body.append(host)
      await vi.advanceTimersByTimeAsync(5000)
      expect(host.cycling.current).toBe(200)
      expect(vi.getTimerCount()).toBe(0)

      host.cycling.onLeave()
      await vi.advanceTimersByTimeAsync(1000)
      expect(host.cycling.current).toBe(300)
    })

    it('should not start again after a reconnect once the cycle has ended', async () => {
      const host = appendHost([100, 200], 1000)
      await vi.advanceTimersByTimeAsync(2000)
      host.remove()

      document.body.append(host)

      expect(vi.getTimerCount()).toBe(0)
      await vi.advanceTimersByTimeAsync(5000)
      expect(host.cycling.current).toBe(100)
    })
  })

  describe('Host updates', () => {
    it('should render each step', async () => {
      const host = appendHost([100, 200, 300], 1000)
      expect(host).toHaveTextContent('100')

      await vi.advanceTimersByTimeAsync(1000)
      await host.updateComplete

      expect(host).toHaveTextContent('200')
    })

    it('should restart the countdown on a host update that changes no input', async () => {
      const host = appendHost([100, 200, 300], 1000)
      await vi.advanceTimersByTimeAsync(600)

      host.requestUpdate()
      await host.updateComplete

      await vi.advanceTimersByTimeAsync(600)
      expect(host.cycling.current).toBe(100)

      await vi.advanceTimersByTimeAsync(400)
      expect(host.cycling.current).toBe(200)
    })

    // On master, a leave that changes no state renders nothing.
    it('should keep the countdown on a leave without a hover', async () => {
      const host = appendHost([100, 200, 300], 1000)
      await vi.advanceTimersByTimeAsync(600)

      host.cycling.onLeave()

      await vi.advanceTimersByTimeAsync(400)
      expect(host.cycling.current).toBe(200)
    })
  })

  // Master's quirks, kept for the contract tests.
  describe('Quirks', () => {
    it('should end after one cycle of steps in total, even after a hover', async () => {
      const host = appendHost([100, 200, 300], 1000)
      await vi.advanceTimersByTimeAsync(1000)

      host.cycling.onHover(300)
      host.cycling.onLeave()

      await vi.advanceTimersByTimeAsync(1000)
      expect(host.cycling.current).toBe(100)

      await vi.advanceTimersByTimeAsync(1000)
      expect(host.cycling.current).toBe(200)

      await vi.advanceTimersByTimeAsync(3000)
      expect(host.cycling.current).toBe(200)
    })

    it('should stay on 0 when cycling is off, even if 0 is not a value', async () => {
      const host = appendHost([100, 200, 300], -1)

      await vi.advanceTimersByTimeAsync(5000)

      expect(host.cycling.current).toBe(0)
    })
  })

  describe('Reduced motion changes', () => {
    const media = useFakeMatchMedia()

    it('should stop at once when reduced motion turns on', async () => {
      const host = appendHost([100, 200, 300], 1000)
      await vi.advanceTimersByTimeAsync(1000)

      media.setMatches(REDUCED_MOTION, true)
      await host.updateComplete

      expect(vi.getTimerCount()).toBe(0)
      await vi.advanceTimersByTimeAsync(5000)
      expect(host.cycling.current).toBe(200)
    })

    it('should resume with the same step count when reduced motion turns off', async () => {
      const host = appendHost([100, 200, 300], 1000)
      await vi.advanceTimersByTimeAsync(1000)
      media.setMatches(REDUCED_MOTION, true)
      await host.updateComplete

      media.setMatches(REDUCED_MOTION, false)
      await host.updateComplete

      await vi.advanceTimersByTimeAsync(1000)
      expect(host.cycling.current).toBe(300)

      await vi.advanceTimersByTimeAsync(1000)
      expect(host.cycling.current).toBe(100)

      await vi.advanceTimersByTimeAsync(3000)
      expect(host.cycling.current).toBe(100)
    })
  })
})
