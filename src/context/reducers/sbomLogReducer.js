const sbomLogReducer = (state, action) => {
  const { type } = action
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
        types: []
      }
    default:
      return state
  }
}

export default sbomLogReducer
