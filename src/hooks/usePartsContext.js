import { PartsContext } from 'context/PartsContext'
import { useContext } from 'react'

export const usePartsContext = () => {
  const value = useContext(PartsContext)
  return value
}
