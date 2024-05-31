import { GlobalQueryContext } from 'context/GlobalQueryContext'
import { useContext } from 'react'

export const useGlobalQueryContext = () => {
  const value = useContext(GlobalQueryContext)
  return value
}
