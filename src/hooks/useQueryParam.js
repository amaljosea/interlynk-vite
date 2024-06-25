import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

const useQueryParam = (paramName) => {
  const location = useLocation()

  const paramValue = useMemo(() => {
    const queryParams = new URLSearchParams(location.search)
    return queryParams.get(paramName)
  }, [location, paramName])

  return paramValue
}

export default useQueryParam
