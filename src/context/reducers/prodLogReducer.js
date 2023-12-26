const prodLogReducer = (state, action) => {
  const { type, payload } = action
  switch (type) {
    case 'FETCH_DATA_SUCCESS':
      return {
        ...state,
        pageIndex: 1
      }
    case 'DECREMENT_PAGE':
      return {
        ...state,
        pageIndex: state.pageIndex !== 0 && state.pageIndex - 1
      }
    case 'INCREMENT_PAGE':
      return {
        ...state,
        pageIndex: state.pageIndex < Math.ceil(payload) && state.pageIndex + 1
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

export default prodLogReducer
