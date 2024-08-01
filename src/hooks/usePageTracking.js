import { useEffect } from 'react'
import ReactGA from 'react-ga'
import { useLocation } from 'react-router-dom'

const usePageTracking = () => {
  const location = useLocation()
  useEffect(() => {
    ReactGA.pageview(location.pathname + location.search)
  }, [location.pathname, location.search])
}

export default usePageTracking
