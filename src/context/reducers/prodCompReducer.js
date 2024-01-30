const prodCompReducer = (state, action) => {
  const { type, payload } = action
  switch (type) {
    case 'CLEAR_PROD_COMP':
      return {
        ...state,
        field: 'COMPONENTS_UPDATED_AT',
        direction: 'DESC',
        pageIndex: 1,
        searchInput: '',
        ecosystems: [],
        suppliers: [],
        licenses: [],
        kinds: [],
        scope: ''
      }
    case 'CHANGE_SEARCH_INPUT':
      return {
        ...state,
        searchInput: payload
      }
    case 'FETCH_DATA_SUCCESS':
      return {
        ...state,
        pageIndex: 1
      }
    case 'CLEAR_SEARCH_INPUT':
      return {
        ...state,
        searchInput: '',
        pageIndex: 1
      }
    case 'DECREMENT_PAGE':
      return {
        ...state,
        pageIndex: state.pageIndex !== 0 && state.pageIndex - 1,
        before: payload
      }
    case 'INCREMENT_PAGE':
      const { total, after } = payload
      return {
        ...state,
        pageIndex: state.pageIndex < Math.ceil(total) && state.pageIndex + 1,
        after: after
      }
    case 'SET_SORT_ORDER':
      return {
        ...state,
        field: payload.field,
        direction: payload.direction,
        pageIndex: 1
      }
    case 'SET_TOTAL_COMP':
      return {
        ...state,
        totalComp: payload
      }
    case 'ADD_FILTER_HEADS':
      return {
        ...state,
        filters: payload
      }
    case 'FILTER_ECOSYSTEM':
      return {
        ...state,
        ecosystems: [...payload].includes('all') ? [] : payload,
        pageIndex: 1,
        after: '',
        before: ''
      }
    case 'FILTER_KIND':
      return {
        ...state,
        kinds: [...payload].includes('all') ? [] : payload,
        pageIndex: 1,
        after: '',
        before: ''
      }
    case 'FILTER_LICENSE':
      return {
        ...state,
        licenses: [...payload].includes('all') ? [] : payload,
        pageIndex: 1,
        after: '',
        before: ''
      }
    case 'FILTER_SUPPLIER':
      return {
        ...state,
        suppliers: [...payload].includes('all') ? [] : payload,
        pageIndex: 1,
        after: '',
        before: ''
      }
    case 'FILTER_SCOPE':
      return {
        ...state,
        scope: payload,
        pageIndex: 1,
        after: '',
        before: ''
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
            spdxList: filterData,
            expLicense: '',
            customLicenses: [],
            customList: []
          }
        } else if (licensesExp) {
          return {
            ...state,
            licenseType: 'license_exp',
            expLicense: licensesExp || '',
            spdxLicenses: [],
            spdxList: [],
            customLicenses: [],
            customList: []
          }
        } else if (licensesCustom?.length > 0) {
          const filterData = licensesCustom?.map((license) => ({
            value: license,
            label: license
          }))
          return {
            ...state,
            licenseType: 'license_custom',
            spdxLicenses: [],
            spdxList: [],
            expLicense: '',
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
    case 'SET_PURL_STRING':
      return {
        ...state,
        purlString: payload
      }
    case 'SET_CPE_STRING':
      return {
        ...state,
        cpeString: payload
      }
    case 'SET_CPE_VALIDATION':
      return {
        ...state,
        isCpeValid: payload
      }
    case 'SET_LICENSE_TYPE':
      return {
        ...state,
        licenseType: payload
      }
    case 'SET_SPDX_LICENSES':
      const selectedSpdx =
        [...payload]?.length > 0 ? [...payload].map((option) => option.value) : []
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
        [...payload]?.length > 0 ? [...payload].map((option) => option.value) : []
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
    default:
      return state
  }
}

export default prodCompReducer
