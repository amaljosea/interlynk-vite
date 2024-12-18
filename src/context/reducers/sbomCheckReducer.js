const sbomCheckReducer = (state, action) => {
  const { type, payload } = action
  switch (type) {
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
    case 'SET_SORT_ORDER':
      return {
        ...state,
        field: payload?.field,
        direction: payload?.direction
      }
    case 'SET_CHECKID':
      return {
        ...state,
        checkId: [...payload]?.includes('all') ? [] : payload
      }
    case 'SET_CATEGORY':
      return {
        ...state,
        category: [...payload]?.includes('all') ? [] : payload
      }
    case 'SET_SEVERITY':
      return {
        ...state,
        severity: [...payload]?.includes('all') ? [] : payload
      }
    case 'SET_STATUS':
      return {
        ...state,
        status: [...payload]?.includes('all') ? [] : payload
      }
    default:
      return state
  }
}

export default sbomCheckReducer
