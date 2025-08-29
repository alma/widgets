import { act, renderHook } from '@testing-library/react'

import useButtonAnimation from 'hooks/useButtonAnimation'

// Mock matchMedia for prefers-reduced-motion testing
const mockMatchMedia = (matches: boolean = false) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}

// Mock timers
jest.useFakeTimers()

describe('useButtonAnimation', () => {
  beforeEach(() => {
    jest.clearAllTimers()
    mockMatchMedia(false) // Default: motion is not reduced
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    jest.useFakeTimers()
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  describe('Initial state', () => {
    it('should initialize with first value when iterateValues is provided', () => {
      const iterateValues = [100, 200, 300]
      const { result } = renderHook(() => useButtonAnimation(iterateValues, 1000))

      // The hook immediately sets to first value due to the useEffect
      expect(result.current.current).toBe(100)
      expect(typeof result.current.onHover).toBe('function')
      expect(typeof result.current.onLeave).toBe('function')
    })

    it('should initialize with 0 when iterateValues is empty', () => {
      const { result } = renderHook(() => useButtonAnimation([], 1000))

      expect(result.current.current).toBe(0)
    })
  })

  describe('Animation behavior', () => {
    it('should cycle through iterateValues automatically', () => {
      const iterateValues = [100, 200, 300]
      const { result } = renderHook(() => useButtonAnimation(iterateValues, 1000))

      // Initially should set to first value
      expect(result.current.current).toBe(100)

      // After 1 second, should move to next value
      act(() => {
        jest.advanceTimersByTime(1000)
      })
      expect(result.current.current).toBe(200)

      // After another second, should move to third value
      act(() => {
        jest.advanceTimersByTime(1000)
      })
      expect(result.current.current).toBe(300)

      // After another second, should loop back to first value
      act(() => {
        jest.advanceTimersByTime(1000)
      })
      expect(result.current.current).toBe(100)
    })

    it('should stop animation after one complete cycle', () => {
      const iterateValues = [100, 200]
      const { result } = renderHook(() => useButtonAnimation(iterateValues, 1000))

      // Complete one full cycle (start + 2 values = 3 iterations)
      expect(result.current.current).toBe(100)

      act(() => {
        jest.advanceTimersByTime(1000) // First transition
      })
      expect(result.current.current).toBe(200)

      act(() => {
        jest.advanceTimersByTime(1000) // Second transition (back to start)
      })
      expect(result.current.current).toBe(100)

      // Animation should stop here (after length + 1 iterations)
      const currentValue = result.current.current
      act(() => {
        jest.advanceTimersByTime(2000) // Should not change anymore
      })
      expect(result.current.current).toBe(currentValue)
    })
  })

  describe('Transition delay handling', () => {
    it('should enforce minimum delay of 1000ms', () => {
      const iterateValues = [100, 200]
      const { result } = renderHook(() => useButtonAnimation(iterateValues, 500)) // Less than 1000

      expect(result.current.current).toBe(100)

      // Should not change before 1000ms (minimum delay)
      act(() => {
        jest.advanceTimersByTime(500)
      })
      expect(result.current.current).toBe(100)

      // Should change after 1000ms
      act(() => {
        jest.advanceTimersByTime(500)
      })
      expect(result.current.current).toBe(200)
    })

    it('should disable animation when delay is -1', () => {
      const iterateValues = [100, 200, 300]
      const { result } = renderHook(() => useButtonAnimation(iterateValues, -1))

      const initialValue = result.current.current

      act(() => {
        jest.advanceTimersByTime(5000)
      })

      // Should not change from initial value
      expect(result.current.current).toBe(initialValue)
    })

    it('should use custom delay when it is >= 1000ms', () => {
      const iterateValues = [100, 200]
      const customDelay = 2000
      const { result } = renderHook(() => useButtonAnimation(iterateValues, customDelay))

      expect(result.current.current).toBe(100)

      // Should not change before custom delay
      act(() => {
        jest.advanceTimersByTime(1500)
      })
      expect(result.current.current).toBe(100)

      // Should change after custom delay
      act(() => {
        jest.advanceTimersByTime(500)
      })
      expect(result.current.current).toBe(200)
    })
  })

  describe('Hover functionality', () => {
    it('should set current value and stop animation on hover', () => {
      const iterateValues = [100, 200, 300]
      const { result } = renderHook(() => useButtonAnimation(iterateValues, 1000))

      expect(result.current.current).toBe(100)

      // Trigger hover
      act(() => {
        result.current.onHover(200)
      })
      expect(result.current.current).toBe(200)

      // Animation should be stopped
      act(() => {
        jest.advanceTimersByTime(2000)
      })
      expect(result.current.current).toBe(200) // Should not change
    })

    it('should restart animation on leave', () => {
      const iterateValues = [100, 200, 300]
      const { result } = renderHook(() => useButtonAnimation(iterateValues, 1000))

      // Hover and stop animation
      act(() => {
        result.current.onHover(200)
      })

      // Leave should restart animation
      act(() => {
        result.current.onLeave()
      })

      // Animation should resume
      act(() => {
        jest.advanceTimersByTime(1000)
      })
      expect(result.current.current).toBe(300)
    })
  })

  describe('Prefers reduced motion', () => {
    it('should disable animation when user prefers reduced motion', () => {
      mockMatchMedia(true) // User prefers reduced motion

      const iterateValues = [100, 200, 300]
      const { result } = renderHook(() => useButtonAnimation(iterateValues, 1000))

      const initialValue = result.current.current

      act(() => {
        jest.advanceTimersByTime(5000)
      })

      // Should not animate when reduced motion is preferred
      expect(result.current.current).toBe(initialValue)
    })

    it('should still allow manual hover/leave when reduced motion is enabled', () => {
      mockMatchMedia(true) // User prefers reduced motion

      const iterateValues = [100, 200, 300]
      const { result } = renderHook(() => useButtonAnimation(iterateValues, 1000))

      // Hover should still work
      act(() => {
        result.current.onHover(200)
      })
      expect(result.current.current).toBe(200)

      // Leave should work but not restart animation
      act(() => {
        result.current.onLeave()
      })

      act(() => {
        jest.advanceTimersByTime(2000)
      })
      expect(result.current.current).toBe(200) // Should not auto-animate
    })
  })

  describe('Edge cases', () => {
    it('should handle empty iterateValues array', () => {
      const { result } = renderHook(() => useButtonAnimation([], 1000))

      act(() => {
        jest.advanceTimersByTime(2000)
      })

      expect(result.current.current).toBe(0)
    })

    it('should handle single value in iterateValues', () => {
      const iterateValues = [100]
      const { result } = renderHook(() => useButtonAnimation(iterateValues, 1000))

      expect(result.current.current).toBe(100)

      act(() => {
        jest.advanceTimersByTime(1000)
      })
      expect(result.current.current).toBe(100) // Should stay the same
    })

    it('should handle component unmounting during animation', () => {
      const iterateValues = [100, 200, 300]
      const { unmount } = renderHook(() => useButtonAnimation(iterateValues, 1000))

      // Unmount component
      unmount()

      // Should not throw errors when timers fire after unmount
      expect(() => {
        act(() => {
          jest.advanceTimersByTime(2000)
        })
      }).not.toThrow()
    })
  })

  describe('Hook stability', () => {
    it('should create new function references on each render', () => {
      const iterateValues = [100, 200, 300]
      const { result, rerender } = renderHook(() => useButtonAnimation(iterateValues, 1000))

      const firstOnHover = result.current.onHover
      const firstOnLeave = result.current.onLeave

      rerender()

      // Functions are recreated on each render (this is expected behavior)
      expect(result.current.onHover).not.toBe(firstOnHover)
      expect(result.current.onLeave).not.toBe(firstOnLeave)
    })

    it('should update when iterateValues change', () => {
      const initialValues = [100, 200]
      const { result, rerender } = renderHook(
        ({ values, delay }) => useButtonAnimation(values, delay),
        {
          initialProps: { values: initialValues, delay: 1000 },
        },
      )

      expect(result.current.current).toBe(100)

      // Change iterateValues
      const newValues = [300, 400, 500]
      rerender({ values: newValues, delay: 1000 })

      // After rerender, it should update to the new first value
      expect(result.current.current).toBe(300)

      act(() => {
        jest.advanceTimersByTime(1000)
      })
      expect(result.current.current).toBe(400)
    })
  })

  describe('SSR compatibility', () => {
    it('should handle absence of matchMedia gracefully', () => {
      const originalMatchMedia = window.matchMedia

      // Temporarily remove matchMedia
      // @ts-ignore
      delete window.matchMedia

      const iterateValues = [100, 200, 300]

      expect(() => {
        renderHook(() => useButtonAnimation(iterateValues, 1000))
      }).not.toThrow()

      // Restore original matchMedia
      if (originalMatchMedia) {
        window.matchMedia = originalMatchMedia
      }
    })
  })
})
