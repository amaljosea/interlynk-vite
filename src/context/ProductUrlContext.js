import { noop } from 'lodash'
import { useParams } from 'react-router-dom'
import { appendParams, getUserType } from 'utils/url'

const { createContext } = require('react')

export const useProductUrls = () => {
  const params = useParams()
  const userType = getUserType()

  const generateProductDetailPageUrlFromCurrentUrl = ({
    productgroupid = params.productgroupid,
    productid = params.productid,
    paramsObj
  } = {}) => {
    const url = `/${userType}/products/${productgroupid}/env/${productid}`
    return appendParams({ url, paramsObj })
  }

  const generateProductVersionDetailPageUrlFromCurrentUrl = ({
    productgroupid = params.productgroupid,
    productid = params.productid,
    sbomid = params.sbomid,
    paramsObj
  } = {}) => {
    const url = `/${userType}/products/${productgroupid}/env/${productid}/version/${sbomid}`
    return appendParams({ url, paramsObj })
  }

  const generateProductVulnerabilityDetailPageUrlFromCurrentUrl = ({
    productgroupid = params.productgroupid,
    productid = params.productid,
    vulnerabilityid = params.vulnerabilityid,
    paramsObj
  } = {}) => {
    const url = `/${userType}/products/${productgroupid}/env/${productid}/vulnerability/${vulnerabilityid}`
    return appendParams({ url, paramsObj })
  }

  return {
    generateProductDetailPageUrlFromCurrentUrl,
    generateProductVersionDetailPageUrlFromCurrentUrl,
    generateProductVulnerabilityDetailPageUrlFromCurrentUrl
  }
}

export const ProductUrlContext = createContext({
  generateProductDetailPageUrlFromCurrentUrl: noop,
  generateProductVersionDetailPageUrlFromCurrentUrl: noop,
  generateProductVulnerabilityDetailPageUrlFromCurrentUrl: noop
})

export const ProductUrlContextWrapper = ({ children }) => {
  const value = useProductUrls()

  return (
    <ProductUrlContext.Provider value={value}>
      {children}
    </ProductUrlContext.Provider>
  )
}
