const prodVulnReducer = (state, action) => {
  const { type } = action
  switch (type) {
    case 'CLEAR_PROD_VULN':
      return {
        ...state,
        field: 'COMPONENT_VULNS_UPDATED_AT',
        direction: 'DESC',
        searchInput: '',
        pageIndex: 1,
        severities: [],
        components: [],
        statues: [],
        kev: '',
        epss: {
          min: 0,
          max: 10000
        }
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
    default:
      return state
  }
}

export default prodVulnReducer
