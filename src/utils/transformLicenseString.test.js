const { transformLicenseString } = require('utils')

describe('transformLicenseStringtring', () => {
  it('should return a transformed license for custom licenses', () => {
    const result = transformLicenseString('  Custom License Example ')
    expect(result).toBe('LicenseRef-Custom-License-Example')
  })

  it('should handle an empty or null license', () => {
    expect(transformLicenseString(null)).toBe('')
    expect(transformLicenseString('')).toBe('')
  })

  it('should trim and sanitize license text', () => {
    const result = transformLicenseString(' Custom License   ')
    expect(result).toBe('LicenseRef-Custom-License')
  })

  it('should handle a license with multiple spaces', () => {
    const result = transformLicenseString('License  With  Multiple Spaces')
    expect(result).toBe('LicenseRef-License-With-Multiple-Spaces')
  })
})
