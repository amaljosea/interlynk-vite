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
        exclude: ['retracted'],
        source: false,
        kev: '',
        epss: '',
        min: 0,
        max: 0,
        direct: false,
        statusTitle: '',
        statusName: '',
        justification: '',
        justifyName: '',
        selectedTag: '',
        actionStatement: '',
        response: '',
        responseTitle: '',
        details: '',
        notes: '',
        impactData: '',
        upstream: false,
        vexComplete: 'all',
        retracted: false
      }
    case 'CLEAR_VEX_STATE':
      return {
        ...state,
        statusTitle: '',
        statusName: '',
        justification: '',
        justifyName: '',
        selectedTag: '',
        actionStatement: '',
        response: '',
        responseTitle: '',
        details: '',
        notes: '',
        impactData: '',
        upstream: false
      }
    case 'ON_CHANGE_STATUS':
      return {
        ...state,
        statusTitle: payload?.value,
        statusName: payload?.name,
        justification: '',
        justifyName: '',
        selectedTag: '',
        actionStatement: '',
        response: '',
        responseTitle: '',
        details: '',
        notes: '',
        impactData: '',
        upstream: false
      }
    case 'ON_CHANGE_RESPONSE':
      return {
        ...state,
        response: payload?.value,
        responseTitle: payload?.name
      }
    case 'ON_CHANGE_JUSTIFICATION':
      return {
        ...state,
        justification: payload?.value,
        justifyName: payload?.name
      }
    case 'SET_SELECTED_TAG':
      return { ...state, selectedTag: payload }
    case 'SET_ACTION_STMT':
      return { ...state, actionStatement: payload }
    case 'SET_DETAILS':
      return { ...state, details: payload }
    case 'SET_NOTES':
      return { ...state, notes: payload }
    case 'SET_IMPACT_DATA':
      return { ...state, impactData: payload }
    case 'SET_UPSTREAM':
      return { ...state, upstream: payload }
    case 'CHANGE_SEARCH_INPUT':
      return { ...state, searchInput: payload, pageIndex: 1 }
    case 'FETCH_DATA_SUCCESS':
      return { ...state, pageIndex: 1 }
    case 'CLEAR_SEARCH_INPUT':
      return { ...state, searchInput: '', pageIndex: 1 }
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
          state.pageIndex < Math.ceil(payload.total) && state.pageIndex + 1,
        after: payload.after
      }
    case 'SET_SORT_ORDER':
      return {
        ...state,
        field: payload.field,
        direction: payload.direction,
        pageIndex: 1
      }
    case 'SET_TOTAL_VULNS':
      return { ...state, totalVuln: payload }
    case 'ADD_FILTER_HEADS':
      return { ...state, filters: payload }
    case 'FILTER_SOURCE':
      return { ...state, source: payload, pageIndex: 1, after: '', before: '' }
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
    case 'FILTER_EXCLUDE':
      return {
        ...state,
        exclude: payload,
        source: [...payload]?.includes('parts') ? true : false,
        retracted: [...payload]?.includes('retracted') ? true : false,
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
    case 'FILTER_KEV':
      return { ...state, kev: payload, pageIndex: 1, after: '', before: '' }
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
      return { ...state, direct: payload, pageIndex: 1, after: '', before: '' }
    case 'FILTER_RETRACTED':
      return { ...state, retracted: payload }
    case 'SET_EPSS':
      return { ...state, epss: payload }
    case 'SET_MIN_EPSS':
      return { ...state, minEpss: payload }
    case 'SET_MAX_EPSS':
      return { ...state, maxEpss: payload }
    case 'RESET_SELECTED_VULN':
      return { ...state, selectedVulns: [] }
    case 'UPDATE_SELECTED_VULN':
      return { ...state, selectedVulns: payload }
    case 'RESET_IMPORT_SBOMS':
      return { ...state, importSbom: [] }
    case 'UPDATE_IMPORT_SBOMS':
      return { ...state, importSbom: payload }
    case 'UPDATE_MERGE_DATA':
      return { ...state, mergeData: payload }
    case 'UPDATE_CURRENT_SBOM':
      return { ...state, currentSbom: payload }
    default:
      return state
  }
}

export default prodVulnReducer
