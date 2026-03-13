import { useState, useEffect } from 'react'

export function useAnimatedNumber(target, duration = 1000) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const start = 0
    const startTime = performance.now()

    function animate(currentTime) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.floor(start + (target - start) * eased))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [target, duration])

  return value
}
