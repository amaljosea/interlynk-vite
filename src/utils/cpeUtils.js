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

export const validateCpe = (value) => {
  const cpeRegex =
    // eslint-disable-next-line no-useless-escape
    /^cpe:2\.3:[aho\*\-]?(:(((\?*|\*?)([a-zA-Z0-9\-\._]|(\\[\\\*\?!"#$$%&'\(\)\+,/:;<=>@\[\]\^`\{\|}~]))+(\?*|\*?))|[\*\-])?){5}(:(([a-zA-Z]{2,3}(-([a-zA-Z]{2}|[0-9]{3}))?)|[\*\-])?)(:(((\?*|\*?)([a-zA-Z0-9\-\._]|(\\[\\\*\?!"#$$%&'\(\)\+,/:;<=>@\[\]\^`\{\|}~]))+(\?*|\*?))|[\*\-])?){4}$/
  return cpeRegex.test(value)
}

export const validateLanguage = (value) => {
  // eslint-disable-next-line no-useless-escape
  const languageRegex = /^(([a-zA-Z]{2,3}(-([a-zA-Z]{2}|[0-9]{3}))?)|[\*\-])?$/
  return languageRegex.test(value)
}

export const validateFields = (value) => {
  if (value?.trim() === '') return true // Allow empty string
  const editionRegex = /^[a-zA-Z0-9_\-*]+$/
  return editionRegex.test(value)
}
