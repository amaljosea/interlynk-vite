const prodReducer = (state, action) => {
  const { type, payload } = action
  switch (type) {
    case 'GET_DATA':
      return {
        ...state,
        data: payload
      }
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
        ...state
      }
    case 'CLEAR_SEARCH_INPUT':
      return {
        ...state,
        searchInput: ''
      }
    case 'SET_SORT_ORDER':
      return {
        ...state,
        field: payload.field,
        direction: payload.direction
      }
    case 'FILTER_ACTIVE':
      return {
        ...state,
        enabled: payload === 'all' ? '' : payload
      }
    case 'FILTER_LABEL':
      return {
        ...state,
        labelIds: [...payload]?.includes('all') ? [] : payload
      }
    case 'FILTER_LIFESTAGE':
      return {
        ...state,
        lifestage: [...payload]?.includes('all') ? [] : payload
      }
    case 'PRODUCT_BY_LABEL':
      return {
        ...state,
        lifestage: [],
        enabled: 'yes',
        searchInput: '',
        labelIds: [...payload]?.includes('all') ? [] : payload
      }
    case 'PRODUCT_BY_LIFESTAGE':
      return {
        ...state,
        labelIds: [],
        enabled: 'yes',
        searchInput: '',
        lifestage: [...payload]?.includes('all') ? [] : payload
      }
    case 'SET_TOTAL_PRODUCT':
      return {
        ...state,
        totalProduct: payload
      }
    case 'CLEAR_FILTER':
      return {
        ...state,
        labelIds: [],
        lifestage: [],
        enabled: 'yes'
      }
    default:
      return state
  }
}

export default prodReducer
