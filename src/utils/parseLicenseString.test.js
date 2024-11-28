const { parseLicenseString } = require('utils')

describe('parseLicenseString', () => {
  it('should return the license name without "LicenseRef-interlynk-" prefix', () => {
    const result = parseLicenseString('LicenseRef-interlynk-Ritesh-License')
    expect(result).toBe('Ritesh License')
  })

  it('should return the license name for "LicenseRef-interlynk-" with hyphens replaced by spaces', () => {
    const result = parseLicenseString('LicenseRef-interlynk-Proprietary')
    expect(result).toBe('Proprietary')
  })

  it('should return the same license if it starts with "LicenseRef-" but not "LicenseRef-interlynk-"', () => {
    const result = parseLicenseString('LicenseRef-Demo-License')
    expect(result).toBe('LicenseRef-Demo-License')
  })

  it('should return the same license if it does not start with "LicenseRef-"', () => {
    const result = parseLicenseString('Other License')
    expect(result).toBe('Other License')
  })

  it('should return an empty string if no license is provided', () => {
    expect(parseLicenseString('')).toBe('')
    expect(parseLicenseString(null)).toBe('')
  })

  it('should return the same license if it is not prefixed with "LicenseRef-"', () => {
    const result = parseLicenseString('Other-License')
    expect(result).toBe('Other-License')
  })

  it('should remove the "LicenseRef-interlynk-" prefix and replace hyphens with spaces', () => {
    const result = parseLicenseString('LicenseRef-interlynk-test-new-license')
    expect(result).toBe('test new license')
  })

  it('should return the same license if it starts with "LicenseRef-" but not "LicenseRef-interlynk-"', () => {
    const result = parseLicenseString('LicenseRef-test-new-license')
    expect(result).toBe('LicenseRef-test-new-license')
  })
})
