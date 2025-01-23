export const validateUrl = (url) => {
  const urlRegex =
    // eslint-disable-next-line no-useless-escape
    /^(?:(?:https?|ftp):\/\/)?(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?::\d{2,5})?(?:\/[\w\-._~:\/?#\[\]@!\$&'()*+,;=%]*)?$/
  return urlRegex.test(url)
}

export const validPassword = (value) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[<>^~!@#$%^&*()-_=+{}|\\;:'",.?/`])(.{8,16})$/
  return passwordRegex.test(value)
}

export const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  // Ensure the email doesn't have consecutive dots in the domain part
  const hasConsecutiveDots = /\.\./.test(email)
  return emailRegex.test(email) && !hasConsecutiveDots
}

export const validatePhoneNumber = (phone) => {
  const phoneRegex =
    /^\+?[1-9]\d{0,2}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/
  return phoneRegex.test(phone)
}

// Checks if the given URL contains any whitespace.
export const hasWhiteSpace = (url) => {
  return /\s/.test(url)
}

//Validate name for registration and profile edit
export const nameValidation = /^[a-zA-Z0-9 _-]+$/

export const validScore = (value) => {
  const scoreRegex = /^(?:0|[1-9][0-9]?|100)$/
  return scoreRegex.test(value)
}
