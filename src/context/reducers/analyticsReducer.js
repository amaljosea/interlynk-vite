const analyticsReducer = (state, action) => {
  const { type, payload } = action
  switch (type) {
    case 'CLEAR_FILTERS':
      return {
        product: null,
        label: null,
        lifecycle: [],
        version: [],
        duration: null
      }
    case 'FILTER_LABEL':
      return {
        ...state,
        product: null,
        version: [],
        lifecycle: [],
        label: payload
      }
    case 'FILTER_PRODUCT':
      return {
        ...state,
        version: [],
        lifecycle: [],
        product: payload
      }
    case 'FILTER_LIFECYCLE':
      return {
        ...state,
        version: [],
        lifecycle: payload
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
