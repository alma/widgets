import { useEffect, useState } from 'react'

const useButtonAnimation = (
  iterateValues: number[],
  transitionDelay: number,
): { current: number; onHover: (current: number) => void; onLeave: (current: number) => void } => {
  const [current, setCurrent] = useState(0)
  const [update, setUpdate] = useState(true)

  useEffect(() => {
    let isMounted = true
    if (iterateValues.length !== 0) {
      if (!iterateValues.includes(current) && update) setCurrent(iterateValues[0])
      setTimeout(() => {
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
    return () => {
      isMounted = false
    }
  }, [iterateValues, current])
  return {
    current,
    onHover: (current: number) => {
      setCurrent(current)
      setUpdate(false)
    },
    onLeave: (current: number) => {
      setTimeout(() => {
        setCurrent(current)
        setUpdate(true)
      }, 1500)
    },
  }
}
export default useButtonAnimation
