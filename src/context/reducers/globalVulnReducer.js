const globalVulnReducer = (state, action) => {
  const { pageIndex } = state
  const { type, payload } = action
  switch (type) {
    case 'CLEAR_GLOBAL_VULN':
      return {
        ...state,
        after: '',
        before: '',
        searchInput: '',
        pageIndex: 1,
        severities: [],
        products: [],
        statues: [],
        kev: '',
        epss: '',
        min: 0,
        max: 0
      }
    case 'FETCH_DATA_SUCCESS':
      return {
        ...state,
        pageIndex: 1
      }
    case 'CHANGE_SEARCH_INPUT':
      return {
        ...state,
        searchInput: payload
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
        pageIndex: pageIndex < Math.ceil(total) && pageIndex + 1,
        after: after
      }
    case 'FILTER_PRODUCT':
      return {
        ...state,
        products: [...payload]?.includes('all') ? [] : payload,
        pageIndex: 1,
        after: '',
        before: ''
      }
    case 'FILTER_SEVERITY':
      return {
        ...state,
        severities: [...payload]?.includes('all') ? [] : payload,
        pageIndex: 1,
        after: '',
        before: ''
      }
    case 'FILTER_STATUS':
      return {
        ...state,
        statues: [...payload]?.includes('all') ? [] : payload,
        pageIndex: 1,
        after: '',
        before: ''
      }
    case 'FILTER_KEV':
      return {
        ...state,
        kev: payload,
        pageIndex: 1,
        after: '',
        before: ''
      }
    case 'FILTER_EPSS':
      return {
        ...state,
        epss: payload,
        pageIndex: 1,
        after: '',
        before: '',
        minEpss: 0,
        maxEpss: 0
      }
    case 'SET_EPSS':
      return {
        ...state,
        epss: payload,
        pageIndex: 1
      }
    case 'SET_MIN_EPSS':
      return {
        ...state,
        minEpss: payload
      }
    case 'SET_MAX_EPSS':
      return {
        ...state,
        maxEpss: payload
      }
    default:
      return state
  }
}

export default globalVulnReducer
