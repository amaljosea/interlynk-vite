const { transformLicenseString } = require('utils')

describe('transformLicenseString', () => {
  it('should return a transformed license for custom licenses', () => {
    const result = transformLicenseString('  Custom License Example ')
    expect(result).toBe('LicenseRef-interlynk-Custom-License-Example')
  })

  it('should handle an empty or null license', () => {
    expect(transformLicenseString(null)).toBe('')
    expect(transformLicenseString('')).toBe('')
  })

  it('should trim and sanitize license text', () => {
    const result = transformLicenseString(' Custom License   ')
    expect(result).toBe('LicenseRef-interlynk-Custom-License')
  })

  it('should handle a license with multiple spaces', () => {
    const result = transformLicenseString('License  With  Multiple Spaces')
    expect(result).toBe('LicenseRef-interlynk-License-With-Multiple-Spaces')
  })

  it('should return the same license if it starts with "LicenseRef-"', () => {
    const result = transformLicenseString('LicenseRef-Demo-License')
    expect(result).toBe('LicenseRef-Demo-License')
  })

  it('should return the same license if it starts with "LicenseRef-interlynk-"', () => {
    const result = transformLicenseString('LicenseRef-interlynk-Proprietary')
    expect(result).toBe('LicenseRef-interlynk-Proprietary')
  })

  it('should prepend "LicenseRef-interlynk-" to licenses without it', () => {
    const result = transformLicenseString('Ritesh License')
    expect(result).toBe('LicenseRef-interlynk-Ritesh-License')
  })

  it('should sanitize and prepend "LicenseRef-interlynk-" to licenses with spaces', () => {
    const result = transformLicenseString('   Example License  ')
    expect(result).toBe('LicenseRef-interlynk-Example-License')
  })

  it('should prepend "LicenseRef-interlynk-" to a license without it', () => {
    const result = transformLicenseString('Proprietary')
    expect(result).toBe('LicenseRef-interlynk-Proprietary')
  })

  it('should prepend "LicenseRef-interlynk-" to a license with spaces', () => {
    const result = transformLicenseString('test new license')
    expect(result).toBe('LicenseRef-interlynk-test-new-license')
  })
})
