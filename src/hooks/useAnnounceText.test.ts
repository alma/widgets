import { act, renderHook } from '@testing-library/react'

import { useAnnounceText } from 'hooks/useAnnounceText'

// Mock timers for testing timeout functionality
jest.useFakeTimers()

describe('useAnnounceText', () => {
  afterEach(() => {
    // Clear all timers after each test
    jest.clearAllTimers()
  })

  afterAll(() => {
    // Restore real timers after all tests
    jest.useRealTimers()
  })

  describe('Initial state', () => {
    it('should initialize with empty announcement text', () => {
      const { result } = renderHook(() => useAnnounceText())

      expect(result.current.announceText).toBe('')
    })

    it('should provide announce and clearAnnouncement functions', () => {
      const { result } = renderHook(() => useAnnounceText())

      expect(typeof result.current.announce).toBe('function')
      expect(typeof result.current.clearAnnouncement).toBe('function')
    })
  })

  describe('announce function', () => {
    it('should set announcement text immediately', () => {
      const { result } = renderHook(() => useAnnounceText())
      const testMessage = 'Test announcement message'

      act(() => {
        result.current.announce(testMessage)
      })

      expect(result.current.announceText).toBe(testMessage)
    })

    it('should clear announcement text after default delay (1000ms)', () => {
      const { result } = renderHook(() => useAnnounceText())
      const testMessage = 'Test announcement message'

      act(() => {
        result.current.announce(testMessage)
      })

      expect(result.current.announceText).toBe(testMessage)

      // Fast-forward time by 1000ms
      act(() => {
        jest.advanceTimersByTime(1000)
      })

      expect(result.current.announceText).toBe('')
    })

    it('should clear announcement text after custom delay', () => {
      const { result } = renderHook(() => useAnnounceText())
      const testMessage = 'Test announcement message'
      const customDelay = 2500

      act(() => {
        result.current.announce(testMessage, customDelay)
      })

      expect(result.current.announceText).toBe(testMessage)

      // Should still be present before the custom delay
      act(() => {
        jest.advanceTimersByTime(2000)
      })
      expect(result.current.announceText).toBe(testMessage)

      // Should be cleared after the custom delay
      act(() => {
        jest.advanceTimersByTime(500)
      })
      expect(result.current.announceText).toBe('')
    })

    it('should handle multiple consecutive announcements', () => {
      const { result } = renderHook(() => useAnnounceText())
      const firstMessage = 'First announcement'
      const secondMessage = 'Second announcement'

      act(() => {
        result.current.announce(firstMessage, 1000)
      })
      expect(result.current.announceText).toBe(firstMessage)

      // Make a second announcement before the first one clears
      act(() => {
        jest.advanceTimersByTime(500)
        result.current.announce(secondMessage, 1000)
      })
      expect(result.current.announceText).toBe(secondMessage)

      // The second announcement should clear after its delay
      act(() => {
        jest.advanceTimersByTime(1000)
      })
      expect(result.current.announceText).toBe('')
    })

    it('should handle empty string announcements', () => {
      const { result } = renderHook(() => useAnnounceText())

      act(() => {
        result.current.announce('')
      })

      expect(result.current.announceText).toBe('')
    })
  })

  describe('clearAnnouncement function', () => {
    it('should clear announcement text immediately', () => {
      const { result } = renderHook(() => useAnnounceText())
      const testMessage = 'Test announcement message'

      act(() => {
        result.current.announce(testMessage)
      })
      expect(result.current.announceText).toBe(testMessage)

      act(() => {
        result.current.clearAnnouncement()
      })
      expect(result.current.announceText).toBe('')
    })

    it('should clear announcement even when called before auto-clear timer', () => {
      const { result } = renderHook(() => useAnnounceText())
      const testMessage = 'Test announcement message'

      act(() => {
        result.current.announce(testMessage, 2000)
      })
      expect(result.current.announceText).toBe(testMessage)

      // Clear manually before the 2000ms timer
      act(() => {
        jest.advanceTimersByTime(500)
        result.current.clearAnnouncement()
      })
      expect(result.current.announceText).toBe('')

      // Should still be empty after the original timer would have fired
      act(() => {
        jest.advanceTimersByTime(1500)
      })
      expect(result.current.announceText).toBe('')
    })

    it('should work when called on empty announcement text', () => {
      const { result } = renderHook(() => useAnnounceText())

      act(() => {
        result.current.clearAnnouncement()
      })

      expect(result.current.announceText).toBe('')
    })
  })

  describe('Edge cases', () => {
    it('should handle very short delay times', () => {
      const { result } = renderHook(() => useAnnounceText())
      const testMessage = 'Test announcement message'

      act(() => {
        result.current.announce(testMessage, 1)
      })
      expect(result.current.announceText).toBe(testMessage)

      act(() => {
        jest.advanceTimersByTime(1)
      })
      expect(result.current.announceText).toBe('')
    })

    it('should handle zero delay', () => {
      const { result } = renderHook(() => useAnnounceText())
      const testMessage = 'Test announcement message'

      act(() => {
        result.current.announce(testMessage, 0)
      })
      expect(result.current.announceText).toBe(testMessage)

      act(() => {
        jest.advanceTimersByTime(0)
      })
      expect(result.current.announceText).toBe('')
    })

    it('should handle very long messages', () => {
      const { result } = renderHook(() => useAnnounceText())
      const longMessage = 'A'.repeat(1000) // 1000 character message

      act(() => {
        result.current.announce(longMessage)
      })

      expect(result.current.announceText).toBe(longMessage)
      expect(result.current.announceText.length).toBe(1000)
    })
  })

  describe('Hook stability', () => {
    it('should maintain function references across re-renders', () => {
      const { result, rerender } = renderHook(() => useAnnounceText())

      const firstAnnounce = result.current.announce
      const firstClear = result.current.clearAnnouncement

      rerender()

      // Functions should be the same reference (stable)
      expect(result.current.announce).toBe(firstAnnounce)
      expect(result.current.clearAnnouncement).toBe(firstClear)
    })
  })
})
