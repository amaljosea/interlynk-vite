import { ProductUrlContext } from 'context/ProductUrlContext'
import { useContext } from 'react'

export const useProductUrlContext = () => {
  const value = useContext(ProductUrlContext)
  return value
}
