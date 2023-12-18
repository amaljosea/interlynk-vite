const prodCompReducer = (state, action) => {
  const { type } = action
  switch (type) {
    case 'CLEAR_PROD_COMP':
      return {
        ...state,
        field: 'COMPONENTS_UPDATED_AT',
        direction: 'DESC',
        pageIndex: 1,
        searchInput: '',
        ecosystems: [],
        suppliers: [],
        licenses: [],
        kinds: [],
        scope: ''
      }
    default:
      return state
  }
}

export default prodCompReducer
