import { useEffect, useState } from 'react'

type Props = {
  current: number
  onHover: (current: number) => void
  onLeave: () => void
}

const useButtonAnimation = (iterateValues: number[], transitionDelay: number): Props => {
  const [current, setCurrent] = useState(0)
  const [update, setUpdate] = useState(true)

  // Respect user's motion preferences with fallback for tests
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Set minimum transition delay to 1 second, or -1 to disable animation
  const cappedTransitionDelay = transitionDelay < 0 ? -1 : Math.max(transitionDelay, 1000)

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>
    let isMounted = true

    // Disable animation if user prefers reduced motion or delay is -1
    if (cappedTransitionDelay === -1 || prefersReducedMotion) {
      return
    }

    if (iterateValues.length !== 0) {
      if (!iterateValues.includes(current) && update) setCurrent(iterateValues[0])
      timeout = setTimeout(() => {
        if (update && isMounted) {
          setCurrent(
            iterateValues[
              iterateValues.includes(current)
                ? (iterateValues.indexOf(current) + 1) % iterateValues.length
                : 0
            ],
          )
        }
      }, cappedTransitionDelay)
    }
    // eslint-disable-next-line consistent-return
    return () => {
      isMounted = false
      clearTimeout(timeout)
    }
  }, [iterateValues, current, cappedTransitionDelay, update, prefersReducedMotion])

  return {
    current,
    onHover: (currentIndex: number) => {
      setCurrent(currentIndex)
      setUpdate(false)
    },
    onLeave: () => {
      setUpdate(true)
    },
  }
}
export default useButtonAnimation
