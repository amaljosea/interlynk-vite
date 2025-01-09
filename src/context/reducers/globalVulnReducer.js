const globalVulnReducer = (state, action) => {
  const { type, payload } = action
  switch (type) {
    case 'CLEAR_GLOBAL_VULN':
      return {
        ...state,
        field: 'VULNS_PUBLISHED_AT',
        direction: 'DESC',
        search: '',
        projectGroupIds: [],
        projectNames: [],
        severity: [],
        kev: '',
        epss: '',
        minEpss: 0,
        maxEpss: 0
      }
    case 'SET_SORT_ORDER':
      return {
        ...state,
        field: payload.field,
        direction: payload.direction
      }
    case 'CHANGE_SEARCH_INPUT':
      return {
        ...state,
        search: payload
      }
    case 'CLEAR_SEARCH_INPUT':
      return {
        ...state,
        search: ''
      }
    case 'FILTER_PRODUCT':
      return {
        ...state,
        projectGroupIds: [...payload]?.includes('all') ? [] : payload
      }
    case 'FILTER_ENV':
      return {
        ...state,
        projectNames: [...payload]?.includes('all') ? [] : payload
      }
    case 'FILTER_SEVERITY':
      return {
        ...state,
        severity: [...payload]?.includes('all') ? [] : payload
      }
    case 'FILTER_KEV':
      return {
        ...state,
        kev: payload
      }
    case 'FILTER_EPSS':
      return {
        ...state,
        epss: payload,
        minEpss: 0,
        maxEpss: 0
      }
    case 'SET_EPSS':
      return {
        ...state,
        epss: payload
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
