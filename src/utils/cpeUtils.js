export const CPE_REGEX =
  /^cpe:2\.3:[aoh]:([^:]*):([^:]*):([^:]*):([^:]*):([^:]*):([^:]*):([^:]*):([^:]*):([^:]*):([^:]*)$/

export const validateCPEString = (cpeString) => {
  if (!cpeString) {
    return { isValid: false, error: 'CPE string cannot be empty' }
  }

  const match = cpeString.match(CPE_REGEX)
  if (!match) {
    return { isValid: false, error: 'Invalid CPE string format' }
  }

  return { isValid: true }
}
