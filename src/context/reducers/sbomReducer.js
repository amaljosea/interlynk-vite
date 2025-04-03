const sbomReducer = (state, action) => {
  const { type, payload } = action
  switch (type) {
    case 'CLEAR_LICENSE':
      return {
        ...state,
        license: []
      }
    case 'SET_LICENSE':
      return {
        ...state,
        license: payload
      }
    default:
      return state
  }
}

export default sbomReducer
