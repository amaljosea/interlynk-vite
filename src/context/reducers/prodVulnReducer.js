const prodVulnReducer = (state, action) => {
  const { type, payload } = action
  switch (type) {
    case 'CLEAR_PROD_VULN':
      return {
        ...state,
        field: 'COMPONENT_VULNS_UPDATED_AT',
        direction: 'DESC',
        after: '',
        before: '',
        searchInput: '',
        pageIndex: 1,
        severities: [],
        components: [],
        statues: [],
        source: false,
        kev: '',
        epss: '',
        min: 0,
        max: 0,
        direct: false
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
    case 'SET_TOTAL_VULNS':
      return {
        ...state,
        totalVuln: payload
      }
    case 'ADD_FILTER_HEADS':
      return {
        ...state,
        filters: payload
      }
    case 'FILTER_SOURCE':
      return {
        ...state,
        source: payload,
        pageIndex: 1,
        after: '',
        before: ''
      }
    case 'FILTER_COMPONENT':
      return {
        ...state,
        components: [...payload]?.includes('all') ? [] : payload,
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
    case 'FILTER_DIRECT':
      return {
        ...state,
        direct: payload,
        pageIndex: 1,
        after: '',
        before: ''
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
    case 'RESET_SELECTED_VULN':
      return {
        ...state,
        selectedVulns: []
      }
    case 'UPDATE_SELECTED_VULN':
      return {
        ...state,
        selectedVulns: payload
      }
    case 'RESET_IMPORT_SBOMS':
      return {
        ...state,
        importSbom: []
      }
    case 'UPDATE_IMPORT_SBOMS':
      return {
        ...state,
        importSbom: payload
      }
    case 'UPDATE_MERGE_DATA':
      return {
        ...state,
        mergeData: payload
      }
    case 'UPDATE_CURRENT_SBOM':
      return {
        ...state,
        currentSbom: payload
      }
    default:
      return state
  }
}

export default prodVulnReducer
