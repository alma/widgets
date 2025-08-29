import { renderHook } from '@testing-library/react'
import { useIntl } from 'react-intl'

import { statusResponse } from '@/types'
import { useAnimationInstructions } from 'hooks/useAnimationInstructions'
import { useAnnounceText } from 'hooks/useAnnounceText'

// Mock dependencies
jest.mock('react-intl', () => ({
  useIntl: jest.fn(),
}))

jest.mock('hooks/useAnnounceText', () => ({
  useAnnounceText: jest.fn(),
}))

describe('useAnimationInstructions', () => {
  const mockFormatMessage = jest.fn()
  const mockAnnounce = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()

    // Setup mocks
    ;(useIntl as jest.Mock).mockReturnValue({
      formatMessage: mockFormatMessage,
    })
    ;(useAnnounceText as jest.Mock).mockReturnValue({
      announce: mockAnnounce,
    })

    mockFormatMessage.mockReturnValue('Animation instructions text')
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('when conditions are met for announcing instructions', () => {
    const defaultProps = {
      status: statusResponse.SUCCESS,
      hasUserInteracted: false,
      eligiblePlansCount: 2,
      transitionDelay: 5000,
    }

    it('should announce instructions after delay when all conditions are met', () => {
      renderHook(() => useAnimationInstructions(defaultProps))

      // Verify formatMessage is called with correct parameters
      expect(mockFormatMessage).toHaveBeenCalledWith({
        id: 'accessibility.animation-control-instructions',
        defaultMessage:
          "Animation automatique des plans de paiement active. Survolez ou naviguez avec les flèches pour arrêter l'animation.",
      })

      // Initially, announce should not be called
      expect(mockAnnounce).not.toHaveBeenCalled()

      // Fast forward to the announcement delay
      jest.advanceTimersByTime(1500)

      // Now announce should be called with the formatted message
      expect(mockAnnounce).toHaveBeenCalledWith('Animation instructions text', 2000)
    })

    it('should clear timeout on unmount', () => {
      const { unmount } = renderHook(() => useAnimationInstructions(defaultProps))

      // Start the timer
      jest.advanceTimersByTime(1000)

      // Unmount before timer completes
      unmount()

      // Continue to when timer would have completed
      jest.advanceTimersByTime(1000)

      // Announce should not be called since component was unmounted
      expect(mockAnnounce).not.toHaveBeenCalled()
    })

    it('should clear previous timeout when dependencies change', () => {
      const { rerender } = renderHook((props) => useAnimationInstructions(props), {
        initialProps: defaultProps,
      })

      // Start first timer
      jest.advanceTimersByTime(1000)

      // Change props to retrigger effect
      rerender({ ...defaultProps, eligiblePlansCount: 3 })

      // Advance to where first timer would have completed
      jest.advanceTimersByTime(500)

      // Should not announce yet (first timer was cleared)
      expect(mockAnnounce).not.toHaveBeenCalled()

      // Advance to where second timer completes
      jest.advanceTimersByTime(1000)

      // Should announce once with the new message
      expect(mockAnnounce).toHaveBeenCalledTimes(1)
      expect(mockAnnounce).toHaveBeenCalledWith('Animation instructions text', 2000)
    })
  })

  describe('when conditions are not met', () => {
    it('should not announce when status is not SUCCESS', () => {
      renderHook(() =>
        useAnimationInstructions({
          status: statusResponse.PENDING,
          hasUserInteracted: false,
          eligiblePlansCount: 2,
          transitionDelay: 5000,
        }),
      )

      jest.advanceTimersByTime(2000)

      expect(mockFormatMessage).not.toHaveBeenCalled()
      expect(mockAnnounce).not.toHaveBeenCalled()
    })

    it('should not announce when user has already interacted', () => {
      renderHook(() =>
        useAnimationInstructions({
          status: statusResponse.SUCCESS,
          hasUserInteracted: true,
          eligiblePlansCount: 2,
          transitionDelay: 5000,
        }),
      )

      jest.advanceTimersByTime(2000)

      expect(mockFormatMessage).not.toHaveBeenCalled()
      expect(mockAnnounce).not.toHaveBeenCalled()
    })

    it('should not announce when there is only one eligible plan', () => {
      renderHook(() =>
        useAnimationInstructions({
          status: statusResponse.SUCCESS,
          hasUserInteracted: false,
          eligiblePlansCount: 1,
          transitionDelay: 5000,
        }),
      )

      jest.advanceTimersByTime(2000)

      expect(mockFormatMessage).not.toHaveBeenCalled()
      expect(mockAnnounce).not.toHaveBeenCalled()
    })

    it('should not announce when animation is disabled (transitionDelay is -1)', () => {
      renderHook(() =>
        useAnimationInstructions({
          status: statusResponse.SUCCESS,
          hasUserInteracted: false,
          eligiblePlansCount: 2,
          transitionDelay: -1,
        }),
      )

      jest.advanceTimersByTime(2000)

      expect(mockFormatMessage).not.toHaveBeenCalled()
      expect(mockAnnounce).not.toHaveBeenCalled()
    })

    it('should announce when transitionDelay is undefined (animation enabled)', () => {
      renderHook(() =>
        useAnimationInstructions({
          status: statusResponse.SUCCESS,
          hasUserInteracted: false,
          eligiblePlansCount: 2,
          transitionDelay: undefined,
        }),
      )

      jest.advanceTimersByTime(1500)

      // With undefined transitionDelay, animation should be enabled, so announcement should happen
      expect(mockFormatMessage).toHaveBeenCalled()
      expect(mockAnnounce).toHaveBeenCalledWith('Animation instructions text', 2000)
    })
  })

  describe('timing behavior', () => {
    const defaultProps = {
      status: statusResponse.SUCCESS,
      hasUserInteracted: false,
      eligiblePlansCount: 2,
      transitionDelay: 5000,
    }

    it('should use correct announcement delay (1500ms)', () => {
      renderHook(() => useAnimationInstructions(defaultProps))

      // Should not announce before delay
      jest.advanceTimersByTime(1400)
      expect(mockAnnounce).not.toHaveBeenCalled()

      // Should announce after delay
      jest.advanceTimersByTime(100)
      expect(mockAnnounce).toHaveBeenCalled()
    })

    it('should use correct announcement duration (2000ms)', () => {
      renderHook(() => useAnimationInstructions(defaultProps))

      jest.advanceTimersByTime(1500)

      expect(mockAnnounce).toHaveBeenCalledWith('Animation instructions text', 2000)
    })
  })

  describe('integration with dependencies', () => {
    it('should call useIntl and useAnnounceText hooks', () => {
      renderHook(() =>
        useAnimationInstructions({
          status: statusResponse.SUCCESS,
          hasUserInteracted: false,
          eligiblePlansCount: 2,
          transitionDelay: 5000,
        }),
      )

      expect(useIntl).toHaveBeenCalled()
      expect(useAnnounceText).toHaveBeenCalled()
    })

    it('should handle formatMessage errors gracefully', () => {
      // Mock console.error to avoid displaying the error in test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      mockFormatMessage.mockImplementation(() => {
        throw new Error('Translation error')
      })

      expect(() => {
        renderHook(() =>
          useAnimationInstructions({
            status: statusResponse.SUCCESS,
            hasUserInteracted: false,
            eligiblePlansCount: 2,
            transitionDelay: 5000,
          }),
        )
      }).toThrow('Translation error')

      // Restore console.error
      consoleSpy.mockRestore()
    })
  })
})
