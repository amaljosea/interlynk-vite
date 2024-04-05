const sbomReducer = (state, action) => {
  const { type, payload } = action
  switch (type) {
    case 'SET_LICENSE_TYPE':
      return {
        ...state,
        licenseType: 'license_exp'
      }
    case 'CLEAR_LICENSES':
      return {
        ...state,
        licenseType: 'license_exp',
        spdxList: [],
        licenseString: [],
        expLicense: ''
      }
    case 'SET_LICENSES':
      if (payload) {
        const { licensesExp } = payload
        return {
          ...state,
          licenseType: 'license_exp',
          expLicense: licensesExp
        }
      }
    case 'SET_LICENSE_FIELD':
      return {
        ...state,
        licenseString: payload,
        expLicense: payload[0]?.value
      }
    default:
      return state
  }
}

export default sbomReducer
