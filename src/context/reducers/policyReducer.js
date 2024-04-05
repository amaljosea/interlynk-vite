const policyReducer = (state, action) => {
  const { type, payload } = action
  switch (type) {
    case 'CLEAR_SBOM_LOG':
      return {
        ...state,
        field: 'POLICIES_UPDATED_AT',
        direction: 'DESC',
        searchInput: '',
        pageIndex: 1
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
    default:
      return state
  }
}

export default policyReducer
