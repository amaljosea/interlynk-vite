const prodReducer = (state, action) => {
  const { pageIndex } = state
  const { type, payload } = action
  switch (type) {
    case 'SET_CURRENT_PRODUCT':
      return {
        ...state,
        currentProduct: payload
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
        pageIndex: pageIndex < Math.ceil(total) && pageIndex + 1,
        after: after
      }
    case 'SET_SORT_ORDER':
      return {
        ...state,
        field: payload.field,
        direction: payload.direction
      }
    case 'ON_FILTER_ACTIVE':
      return {
        ...state,
        enabled: payload,
        pageIndex: 1
      }
    case 'SET_TOTAL_PRODUCT':
      return {
        ...state,
        totalProduct: payload
      }
    default:
      return state
  }
}

export default prodReducer
