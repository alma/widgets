import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Custom hook for managing announcement text for screen readers
 * Provides functionality to set announcement text and automatically clear it after a delay
 */
export const useAnnounceText = () => {
  const [announceText, setAnnounceText] = useState('')
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * Announces text to screen readers and clears it after a specified delay
   * @param text - The text to announce
   * @param clearDelay - Time in milliseconds before clearing the text (default: 1000ms)
   */
  const announce = useCallback((text: string, clearDelay: number = 1000) => {
    // Clear any existing timeout to prevent overlapping announcements
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    setAnnounceText(text)

    // Set new timeout and store reference for cleanup
    timeoutRef.current = setTimeout(() => {
      setAnnounceText('')
      timeoutRef.current = null
    }, clearDelay)
  }, [])

  /**
   * Clears the current announcement text immediately and cancels any pending timeout
   */
  const clearAnnouncement = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setAnnounceText('')
  }, [])

  // Cleanup timeout on unmount
  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    },
    [],
  )

  return {
    announceText,
    announce,
    clearAnnouncement,
  }
}
