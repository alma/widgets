import { useEffect, useState } from 'react'

const useButtonAnimation = (iterateValues: number[]): [number, (current: number) => void] => {
  const [current, setCurrent] = useState(0)
  const [update, setUpdate] = useState(true)

  useEffect(() => {
    let isMounted = true
    if (iterateValues.length !== 0) {
      if (!iterateValues.includes(current) && update) setCurrent(iterateValues[0])
      setTimeout(() => {
        if (update && isMounted) setCurrent(iterateValues[(current + 1) % iterateValues.length])
      }, 3000)
    }
    return () => {
      isMounted = false
    }
  }, [iterateValues, current])
  return [
    current,
    (current: number) => {
      setCurrent(current)
      setUpdate(false)
    },
  ]
}
export default useButtonAnimation
