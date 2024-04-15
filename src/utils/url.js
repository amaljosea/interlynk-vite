const getUserType = () => {
  return window.location.pathname.split('/')[1]
}

export const appendParams = ({ url, paramsObj = {} }) => {
  const paramsLength = Object.keys(paramsObj).length

  if (paramsLength) {
    const searchParams = new URLSearchParams(paramsObj)
    return `${url}?${searchParams.toString()}`
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
