const prodLogReducer = (state, action) => {
  const { type, payload } = action
  switch (type) {
    case 'CLEAR_STATE':
      return {
        field: 'ACTIVITY_LOGS_CREATED_AT',
        direction: 'DESC',
        searchInput: '',
        type: [],
        user: [],
        object: [],
        pageIndex: 1
      }
    case 'FETCH_DATA_SUCCESS':
      return {
        ...state,
        pageIndex: 1
      }
    case 'CHANGE_SEARCH_INPUT':
      return {
        ...state,
        searchInput: payload,
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
      return {
        ...state,
        pageIndex:
          state.pageIndex < Math.ceil(payload?.total) && state.pageIndex + 1,
        after: payload?.after
      }
    case 'SET_SORT_ORDER':
      return {
        ...state,
        field: payload.field,
        direction: payload.direction,
        pageIndex: 1
      }
    case 'FILTER_TYPE':
      return {
        ...state,
        type: [...payload].includes('all') ? [] : payload,
        pageIndex: 1
      }
    case 'FILTER_USER':
      return {
        ...state,
        user: [...payload].includes('all') ? [] : payload,
        pageIndex: 1
      }
    case 'FILTER_OBJECT':
      return {
        ...state,
        object: [...payload].includes('all') ? [] : payload,
        pageIndex: 1
      }
    default:
      return state
  }
}

export default prodLogReducer
