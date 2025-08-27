import { useCallback, useState } from 'react'

/**
 * Custom hook for managing announcement text for screen readers
 * Provides functionality to set announcement text and automatically clear it after a delay
 */
export const useAnnounceText = () => {
  const [announceText, setAnnounceText] = useState('')

  /**
   * Announces text to screen readers and clears it after a specified delay
   * @param text - The text to announce
   * @param clearDelay - Time in milliseconds before clearing the text (default: 1000ms)
   */
  const announce = useCallback((text: string, clearDelay: number = 1000) => {
    setAnnounceText(text)

    // Clear announcement after the specified delay
    const timer = setTimeout(() => setAnnounceText(''), clearDelay)
    return () => clearTimeout(timer)
  }, [])

  /**
   * Clears the current announcement text immediately
   */
  const clearAnnouncement = useCallback(() => {
    setAnnounceText('')
  }, [])

  return {
    announceText,
    announce,
    clearAnnouncement,
  }
}

export default useAnnounceText
