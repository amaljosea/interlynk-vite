import { useEffect, useState } from 'react'

export function useScrollHide(thresholdPercent = 15) {
  const [hide, setHide] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight
      const scrolledPercentage = (scrollTop / docHeight) * 100

      setHide(scrolledPercentage > thresholdPercent)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [thresholdPercent])

  return hide
}
