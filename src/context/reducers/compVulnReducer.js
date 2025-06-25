const compVulnReducer = (state, action) => {
  const { type, payload } = action
  switch (type) {
    case 'CLEAR_GLOBAL_VULN':
      return {
        ...state,
        searchInput: '',
        envs: [],
        versions: [],
        products: [],
        statues: [],
        vexComplete: undefined
      }
    case 'FETCH_DATA_SUCCESS':
      return {
        ...state
      }
    case 'CHANGE_SEARCH_INPUT':
      return {
        ...state,
        searchInput: payload
      }
    case 'CLEAR_SEARCH_INPUT':
      return {
        ...state,
        searchInput: ''
      }
    case 'FILTER_PRODUCT':
      return {
        ...state,
        products: [...payload]?.includes('all') ? [] : payload
      }
    case 'FILTER_SEVERITY':
      return {
        ...state,
        severities: [...payload]?.includes('all') ? [] : payload
      }
    case 'FILTER_STATUS':
      return {
        ...state,
        statuses: [...payload]?.includes('all') ? [] : payload
      }
    case 'FILTER_COMPLETE':
      return {
        ...state,
        vexComplete: payload
      }
    case 'FILTER_VERSION':
      return {
        ...state,
        versions: [...payload]?.includes('all') ? [] : payload
      }
    case 'FILTER_ENV':
      return {
        ...state,
        envs: [...payload]?.includes('all') ? [] : payload
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
