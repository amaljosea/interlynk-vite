const sbomReducer = (state, action) => {
  const { type, payload } = action
  switch (type) {
    case 'SET_LICENSE_TYPE':
      return {
        ...state,
        licenseType: payload
      }
    case 'CLEAR_LICENSES':
      return {
        ...state,
        licenseType: 'license_spdx',
        spdxLicenses: [],
        spdxList: [],
        customLicenses: [],
        customList: [],
        expLicense: ''
      }
    case 'SET_SPDX_LICENSES':
      const selectedSpdx =
        [...payload].length > 0
          ? [...payload].map((option) => option.value)
          : []
      return {
        ...state,
        spdxLicenses: selectedSpdx,
        spdxList: payload
      }
    case 'SET_EPX_LICENSE':
      return {
        ...state,
        expLicense: payload
      }
    case 'SET_CUSTOM_LICENSES':
      const selectedCustom =
        [...payload]?.length > 0
          ? [...payload].map((option) => option.value)
          : []
      return {
        ...state,
        customLicenses: selectedCustom,
        customList: payload
      }
    case 'CREATE_CUSTOM_LICENSES':
      const createOption = (label) => ({
        label,
        value: label.toLowerCase().replace(/\W/g, '')
      })
      const newOption = createOption(payload)
      return {
        ...state,
        customLicenses: [...state.customLicenses, payload],
        customList: [...state.customList, newOption]
      }
    case 'SET_LICENSES':
      if (payload) {
        const { licenses, licensesExp, licensesCustom } = payload
        if (licenses?.length > 0) {
          const filterData = licenses?.map((license) => ({
            value: license,
            label: license
          }))
          return {
            ...state,
            licenseType: 'license_spdx',
            spdxLicenses: licenses,
            spdxList: filterData
          }
        } else if (licensesExp) {
          return {
            ...state,
            licenseType: 'license_exp',
            expLicense: licensesExp || ''
          }
        } else if (licensesCustom?.length > 0) {
          const filterData = licensesCustom?.map((license) => ({
            value: license,
            label: license
          }))
          return {
            ...state,
            licenseType: 'license_custom',
            customLicenses: licensesCustom,
            customList: filterData
          }
        } else {
          return {
            ...state,
            licenseType: 'license_spdx',
            spdxLicenses: [],
            spdxList: [],
            customLicenses: [],
            customList: [],
            expLicense: ''
          }
        }
      }
    default:
      return state
  }
}

export default sbomReducer
