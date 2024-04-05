const sbomLogReducer = (state, action) => {
  const { type, payload } = action
  switch (type) {
    case 'CLEAR_SBOM_LOG':
      return {
        ...state,
        field: 'ACTIVITY_LOGS_CREATED_AT',
        direction: 'DESC',
        searchInput: '',
        pageIndex: 1,
        users: [],
        objects: [],
        types: [],
        filters: null
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
    case 'ADD_FILTER_HEADS':
      return {
        ...state,
        filters: payload
      }
    case 'FILTER_USER':
      return {
        ...state,
        users: [...payload].includes('all') ? [] : payload,
        pageIndex: 1
      }
    case 'FILTER_OBJECT':
      return {
        ...state,
        objects: [...payload].includes('all') ? [] : payload,
        pageIndex: 1
      }
    case 'FILTER_TYPE':
      return {
        ...state,
        types: [...payload].includes('all') ? [] : payload,
        pageIndex: 1
      }
    default:
      return state
  }
}

export default sbomLogReducer
