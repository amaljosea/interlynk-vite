const globalVulnReducer = (state, action) => {
  const { pageIndex } = state
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
    default:
      return state
  }
}

export default globalVulnReducer
