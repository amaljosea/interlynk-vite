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
        projectGroupLabelIds: [],
        status: [],
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
    case 'FILTER_LABEL':
      return {
        ...state,
        projectGroupLabelIds: [...payload]?.includes('all') ? [] : payload
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
    case 'ALL_VULN_BY_SEVERITY':
      return {
        ...state,
        kev: '',
        epss: '',
        minEpss: 0,
        maxEpss: 0,
        status: [],
        projectNames: [],
        projectGroupIds: [],
        severity: [...payload]?.includes('all') ? [] : payload
      }
    case 'ALL_VULN_BY_STATUS':
      return {
        ...state,
        kev: '',
        epss: '',
        minEpss: 0,
        maxEpss: 0,
        severity: [],
        projectNames: [],
        projectGroupIds: [],
        status: [...payload]?.includes('all') ? [] : payload
      }
    case 'CRITICAL_VULN_BY_STATUS':
      return {
        ...state,
        kev: '',
        epss: '',
        minEpss: 0,
        maxEpss: 0,
        severity: ['critical'],
        projectNames: [],
        projectGroupIds: [],
        status: [...payload]?.includes('all') ? [] : payload
      }
    case 'HIGH_VULN_BY_STATUS':
      return {
        ...state,
        kev: '',
        epss: '',
        minEpss: 0,
        maxEpss: 0,
        severity: ['high'],
        projectNames: [],
        projectGroupIds: [],
        status: [...payload]?.includes('all') ? [] : payload
      }
    case 'KEV_VULN_BY_STATUS':
      return {
        ...state,
        kev: 'yes',
        epss: '',
        minEpss: 0,
        maxEpss: 0,
        severity: [],
        projectNames: [],
        projectGroupIds: [],
        status: [...payload]?.includes('all') ? [] : payload
      }
    case 'FILTER_STATUS':
      return {
        ...state,
        status: [...payload]?.includes('all') ? [] : payload
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
