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
        pageIndex: 1,
        searchInput: '',
        ecosystems: [],
        suppliers: [],
        licenses: [],
        kinds: [],
        scope: '',
        direct: false,
        licenseType: 'license_exp',
        licenseString: [],
        expLicense: '',
        cpeString: '',
        isCpeValid: true,
        purlString: '',
        include: ''
      }
    case 'CHANGE_SEARCH_INPUT':
      return {
        ...state,
        searchInput: payload,
        pageIndex: 1
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
      return {
        ...state,
        pageIndex:
          state.pageIndex < Math.ceil(payload?.total) && state.pageIndex + 1,
        after: payload?.after
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
        ecosystems: toggleSelection(state.ecosystems, payload),
        pageIndex: 1,
        after: '',
        before: ''
      }
    case 'FILTER_KIND':
      return {
        ...state,
        kinds: toggleSelection(state.kinds, payload),
        pageIndex: 1,
        after: '',
        before: ''
      }
    case 'FILTER_LICENSE':
      return {
        ...state,
        licenses: toggleSelection(state.licenses, payload),
        pageIndex: 1,
        after: '',
        before: ''
      }
    case 'FILTER_SUPPLIER':
      return {
        ...state,
        suppliers: toggleSelection(state.suppliers, payload),
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
    case 'FILTER_INCLUDE':
      return {
        ...state,
        include: [...payload]?.includes('all') ? [] : payload,
        pageIndex: 1,
        after: '',
        before: ''
      }
    case 'FILTER_DIRECT':
      return {
        ...state,
        direct: payload,
        pageIndex: 1,
        after: '',
        before: ''
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
    default:
      return state
  }
}

export default prodCompReducer
