export const getUserType = () => {
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
export const appendParams = ({ url, paramsObj = {}, replaceParams }) => {
  const paramsLength = Object.keys(paramsObj).length
  const old = replaceParams ? {} : getOldSearchParams()

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

export const getShareLinklUrl = ({
  productgroupid,
  signedUrlParams,
  productid
}) => {
  const domain = window.location.origin
  const url = `${domain}/customer/products/${productgroupid}/env/${productid}?signed_url_params=${signedUrlParams}`
  return url
}
