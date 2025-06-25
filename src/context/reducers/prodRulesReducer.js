const prodRulesReducer = (state, action) => {
  const { type, payload } = action
  switch (type) {
    case 'FETCH_DATA_SUCCESS':
      return {
        ...state
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

export default prodRulesReducer
