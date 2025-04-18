import { useEffect, useState } from 'react'

type Props = {
  current: number
  onHover: (current: number) => void
  onLeave: () => void
}
const useButtonAnimation = (iterateValues: number[], transitionDelay: number): Props => {
  const [current, setCurrent] = useState(0)
  const [update, setUpdate] = useState(true)

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>
    let isMounted = true

    if (transitionDelay === -1) {
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
      }, transitionDelay)
    }
    // eslint-disable-next-line consistent-return
    return () => {
      isMounted = false
      clearTimeout(timeout)
    }
  }, [iterateValues, current, transitionDelay, update])

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
