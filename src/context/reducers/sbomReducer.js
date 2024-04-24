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
      return {
        ...state,
        licenseType: 'license_exp',
        expLicense: payload?.licensesExp
      }
    case 'SET_LICENSE_FIELD':
      return {
        ...state,
        licenseString: payload,
        expLicense: [...payload]?.length > 0 ? payload[0].value : ''
      }
    default:
      return state
  }
}

export default sbomReducer
