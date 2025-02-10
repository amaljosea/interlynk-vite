const prodReducer = (state, action) => {
  const { pageIndex } = state
  const { type, payload } = action
  switch (type) {
    case 'GET_DATA':
      return {
        ...state,
        data: payload,
        pageIndex: 1
      }
    case 'SET_CURRENT_PRODUCT':
      return {
        ...state,
        currentProduct: payload,
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
      return {
        ...state,
        pageIndex: pageIndex < Math.ceil(payload.total) && pageIndex + 1,
        after: payload.after
      }
    case 'SET_SORT_ORDER':
      return {
        ...state,
        field: payload.field,
        direction: payload.direction,
        pageIndex: 1
      }
    case 'FILTER_ACTIVE':
      return {
        ...state,
        enabled: payload,
        pageIndex: 1
      }
    case 'FILTER_LABEL':
      return {
        ...state,
        labelIds: [...payload]?.includes('all') ? [] : payload,
        pageIndex: 1
      }
    case 'FILTER_LIFESTAGE':
      return {
        ...state,
        lifestage: [...payload]?.includes('all') ? [] : payload,
        pageIndex: 1
      }
    case 'PRODUCT_BY_LABEL':
      return {
        ...state,
        lifestage: [],
        enabled: 'yes',
        searchInput: '',
        labelIds: [...payload]?.includes('all') ? [] : payload,
        pageIndex: 1
      }
    case 'PRODUCT_BY_LIFESTAGE':
      return {
        ...state,
        labelIds: [],
        enabled: 'yes',
        searchInput: '',
        lifestage: [...payload]?.includes('all') ? [] : payload,
        pageIndex: 1
      }
    case 'SET_TOTAL_PRODUCT':
      return {
        ...state,
        totalProduct: payload,
        pageIndex: 1
      }
    case 'CLEAR_FILTER':
      return {
        ...state,
        labelIds: [],
        lifestage: [],
        enabled: 'yes',
        pageIndex: 1
      }
    default:
      return state
  }
}

export default prodReducer
