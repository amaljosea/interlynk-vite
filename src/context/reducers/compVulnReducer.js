const compVulnReducer = (state, action) => {
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
        envs: [],
        versions: [],
        products: [],
        statues: [],
        vexComplete: undefined
      }
    case 'FETCH_DATA_SUCCESS':
      return {
        ...state,
        pageIndex: 1
      }
    case 'CHANGE_SEARCH_INPUT':
      return {
        ...state,
        searchInput: payload,
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
        pageIndex: pageIndex < Math.ceil(payload?.total) && pageIndex + 1,
        after: payload?.after
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
        statuses: [...payload]?.includes('all') ? [] : payload,
        pageIndex: 1,
        after: '',
        before: ''
      }
    case 'FILTER_COMPLETE':
      return {
        ...state,
        vexComplete: payload,
        pageIndex: 1,
        after: '',
        before: ''
      }
    case 'FILTER_VERSION':
      return {
        ...state,
        versions: [...payload]?.includes('all') ? [] : payload,
        pageIndex: 1,
        after: '',
        before: ''
      }
    case 'FILTER_ENV':
      return {
        ...state,
        envs: [...payload]?.includes('all') ? [] : payload,
        pageIndex: 1,
        after: '',
        before: ''
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

export default compVulnReducer
