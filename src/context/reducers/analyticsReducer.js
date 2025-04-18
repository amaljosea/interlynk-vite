const analyticsReducer = (state, action) => {
  const { type, payload } = action
  switch (type) {
    case 'CLEAR_FILTERS':
      return {
        product: [],
        label: null,
        version: [],
        duration: null
      }
    case 'FILTER_LABEL':
      return {
        ...state,
        product: [],
        version: [],
        label: payload
      }

    case 'FILTER_PRODUCT':
      return {
        ...state,
        version: [],
        product: payload
      }
    case 'FILTER_VERSION':
      return {
        ...state,
        version: payload
      }
    case 'FILTER_DURATION':
      return {
        ...state,
        duration: payload
      }
    default:
      return state
  }
}

export default analyticsReducer
