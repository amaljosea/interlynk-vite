const supportReducer = (state, action) => {
  const { type, payload } = action
  switch (type) {
    case 'CLEAR_COMP_SUPPORT':
      return {
        ...state,
        level: [],
        field: 'COMPONENTS_UPDATED_AT',
        direction: 'DESC',
        searchInput: ''
      }
    case 'SET_SORT_ORDER':
      return {
        ...state,
        field: payload.field,
        direction: payload.direction
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
    case 'FILTER_LEVEL':
      return {
        ...state,
        level: [...payload]?.includes('all') ? [] : payload
      }
    case 'FILTER_INCLUDE':
      return {
        ...state,
        include: payload
      }
    default:
      return state
  }
}

export default supportReducer
