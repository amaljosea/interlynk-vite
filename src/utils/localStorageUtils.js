export const setItem = (key, value) => {
  try {
    window.localStorage.setItem(key, value)
  } catch (error) {
    console.log('Error', error)
  }
}

export const getItem = (key) => {
  try {
    const item = window.localStorage.getItem(key)
    return item ? item : undefined
  } catch (error) {
    console.log('Error', error)
  }
}

export const removeItem = (key) => {
  try {
    window.localStorage.removeItem(key)
  } catch (error) {
    console.log('Error', error)
  }
}
