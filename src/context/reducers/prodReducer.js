const prodReducer = (state, action) => {
  const { pageIndex } = state
  const { type, payload } = action
  switch (type) {
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
        pageIndex: pageIndex !== 0 && pageIndex - 1
      }
    case 'INCREMENT_PAGE':
      return {
        ...state,
        pageIndex: pageIndex < Math.ceil(payload) && pageIndex + 1
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
