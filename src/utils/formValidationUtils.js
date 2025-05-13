/* eslint-disable no-useless-escape */
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
  const emailRegex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  // Ensure the email doesn't have consecutive dots in the domain part
  const hasConsecutiveDots = /\.\./.test(email)
  return emailRegex.test(email) && !hasConsecutiveDots
}

export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^[+\(\)\-\d\s]{10,15}$/
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

export function isValidSlackWebhookUrl(url) {
  const regex =
    /^https:\/\/hooks\.slack\.com\/services\/[A-Z0-9]{9,}\/[A-Z0-9]{9,}\/[a-zA-Z0-9]{24,}$/
  return regex.test(url)
}

export function isValidTeamsWebhookUrl(url) {
  const regex =
    /^https:\/\/[a-zA-Z0-9-]+\.webhook\.office\.com\/webhookb2\/[a-f0-9-]+@[a-f0-9-]+\/IncomingWebhook\/[a-zA-Z0-9]+\/[a-f0-9-]+$/
  return regex.test(url)
}
