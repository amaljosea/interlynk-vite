const toggleSelection = (currentSelection, payload) => {
  return payload === 'All'
    ? []
    : currentSelection?.includes(payload)
      ? currentSelection?.filter((item) => item !== payload)
      : [...currentSelection, payload]
}

const toggleExpandRow = (state, payload) => {
  if (payload?.length === 0) {
    return []
  }
  return state.expandedRows.includes(payload)
    ? state.expandedRows.filter((item) => item !== payload)
    : [...state.expandedRows, payload]
}

const prodCompReducer = (state, action) => {
  const { type, payload } = action
  switch (type) {
    case 'CLEAR_PROD_COMP':
      return {
        ...state,
        field: 'COMPONENTS_UPDATED_AT',
        direction: 'DESC',
        searchInput: '',
        ecosystems: [],
        suppliers: [],
        licenses: [],
        kinds: [],
        scope: '',
        direct: false,
        licenseType: 'all',
        licenseString: [],
        expLicense: '',
        cpeString: '',
        isCpeValid: true,
        purlString: '',
        exclude: [],
        selectedComp: null,
        filterMode: 'OR',
        status: []
      }
    case 'CHANGE_SEARCH_INPUT':
      return {
        ...state,
        searchInput: payload
      }
    case 'FETCH_DATA_SUCCESS':
      return {
        ...state
      }
    case 'CLEAR_SEARCH_INPUT':
      return {
        ...state,
        searchInput: ''
      }
    case 'SET_SORT_ORDER':
      return {
        ...state,
        field: payload.field,
        direction: payload.direction
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
        ecosystems: payload
      }
    case 'FILTER_KIND':
      return {
        ...state,
        kinds: payload
      }
    case 'FILTER_LICENSE': {
      return {
        ...state,
        licenses: payload
      }
    }
    case 'FILTER_SUPPLIER':
      return {
        ...state,
        suppliers: toggleSelection(state.suppliers, payload)
      }
    case 'FILTER_STATUS':
      return {
        ...state,
        status: [...payload]?.includes('ALL') ? [] : payload
      }
    case 'FILTER_SCOPE':
      return {
        ...state,
        scope: payload === 'all' ? '' : payload
      }
    case 'FILTER_EXCLUDE':
      return {
        ...state,
        exclude: payload
      }
    case 'FILTER_DIRECT':
      return {
        ...state,
        direct: payload
      }
    case 'CLEAR_LICENSES':
      return {
        ...state,
        licenseType: 'license_exp',
        expLicense: ''
      }
    case 'SET_LICENSES':
      return {
        ...state,
        licenseType: 'license_exp',
        expLicense: payload?.licensesExp
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
    case 'SET_LICENSE_FIELD':
      return {
        ...state,
        licenseString: payload,
        expLicense: payload[0]?.value
      }
    case 'SET_EXPAND':
      return {
        ...state,
        expandedRows: toggleExpandRow(state, payload)
      }
    case 'SET_COMPONENT':
      return {
        ...state,
        selectedComp: payload
      }
    case 'SET_FILTER_MODE':
      return {
        ...state,
        filterMode: payload
      }
    case 'FILTER_LICENSE_TYPE':
      return {
        ...state,
        licenseType: payload
      }
    default:
      return state
  }
}

export default prodCompReducer
