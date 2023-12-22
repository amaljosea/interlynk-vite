const prodCheckReducer = (state, action) => {
  const { type } = action
  switch (type) {
    case 'CLEAR_PROD_CHECK':
      return {
        ...state,
        field: 'CHECK_RESULTS_UPDATED_AT',
        direction: 'DESC',
        searchInput: '',
        pageIndex: 1,
        rules: [],
        categories: [],
        severities: [],
        statues: []
      }
    default:
      return state
  }
}

export default prodCheckReducer
