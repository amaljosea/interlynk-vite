export const customFilter = (option, searchText) => {
  if (option.label.toLowerCase().includes(searchText.toLowerCase())) {
    return true
  } else {
    return false
  }
}
