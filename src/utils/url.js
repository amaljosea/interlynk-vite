const getUserType = () => {
  return window.location.pathname.split('/')[1]
}

const getOldSearchParams = () => {
  const oldSearchParams = new URLSearchParams(window.location.search)
  const oldSearchParamsObj = {}
  for (const [key, value] of oldSearchParams.entries()) {
    oldSearchParamsObj[key] = value
  }

  return oldSearchParamsObj
}
export const appendParams = ({ url, paramsObj = {} }) => {
  const paramsLength = Object.keys(paramsObj).length
  const old = getOldSearchParams()

  if (paramsLength) {
    const newSearchParams = new URLSearchParams({
      ...old,
      ...paramsObj
    })
    return `${url}?${newSearchParams.toString()}`
  }

  return url
}

export const checkIfCustomer = () => getUserType() === 'customer'

export const getProductDetailPageUrl = ({
  productgroupid,
  productid,
  paramsObj
}) => {
  const url = `/${getUserType()}/products/${productgroupid}/env/${productid}`
  return appendParams({ url, paramsObj })
}

export const getProductVersionDetailPageUrl = ({
  productgroupid,
  productid,
  sbomid,
  paramsObj
}) => {
  const url = `/${getUserType()}/products/${productgroupid}/env/${productid}/version/${sbomid}`
  return appendParams({ url, paramsObj })
}

export const getProductVulnerabilityDetailPageUrl = ({
  productgroupid,
  productid,
  vulnerabilityid,
  paramsObj
}) => {
  const url = `/${getUserType()}/products/${productgroupid}/env/${productid}/vulnerability/${vulnerabilityid}`
  return appendParams({ url, paramsObj })
}

export const getShareLinklUrl = ({
  productgroupid,
  signedUrlParams,
  productid
}) => {
  const domain = window.location.origin
  const url = `${domain}/customer/products/${productgroupid}/env/${productid}?signed_url_params=${signedUrlParams}`
  return url
}
