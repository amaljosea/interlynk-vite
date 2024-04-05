const toolsReducer = (state, action) => {
  const { type, payload } = action
  switch (type) {
    case 'CLEAR_SBOM_LOG':
      return {
        drifts: [],
        difference: '',
        component: '',
        searchInput: '',
        filters: null
      }
    case 'SET_DATA':
      return {
        ...state,
        drifts: payload
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
    case 'ADD_FILTER_HEADS':
      return {
        ...state,
        filters: payload
      }
    case 'FILTER_DIFF':
      return {
        ...state,
        difference: payload
      }
    case 'FILTER_COMP':
      return {
        ...state,
        component: payload
      }
    default:
      return state
  }
}

export default toolsReducer
