const versionReducer = (state, action) => {
  const { type, payload } = action
  switch (type) {
    case 'CLEAR_VERSIONS':
      return {
        ...state,
        field: 'SBOMS_UPDATED_AT',
        direction: 'DESC',
        searchInput: '',
        lifestage: []
      }
    case 'CHANGE_SEARCH_INPUT':
      return {
        ...state,
        searchInput: payload
      }
    case 'FETCH_DATA_SUCCESS':
      return {
        ...state
      }
    case 'CLEAR_SEARCH_INPUT':
      return {
        ...state,
        searchInput: ''
      }
    case 'FILTER_LIFESTAGE':
      return {
        ...state,
        lifestage: [...payload]?.includes('all') ? [] : payload
      }
    case 'SET_SORT_ORDER':
      return {
        ...state,
        field: payload.field,
        direction: payload.direction
      }
    default:
      return state
  }
}

export default versionReducer
