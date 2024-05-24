import { validateUrl } from './index'

describe('validateUrl', () => {
  it('should return true for valid URLs without encoding', () => {
    expect(validateUrl('https://example.com')).toBe(true)
    expect(validateUrl('example.com')).toBe(true)
    expect(validateUrl('http://example.com/path/to/resource')).toBe(true)
    expect(validateUrl('ftp://example.com/resource?query=param')).toBe(true)
    expect(validateUrl('https://example.com/resource#section')).toBe(true)
    expect(validateUrl('http://www.example.com')).toBe(true)
    expect(
      validateUrl(
        'http://example.com:8080/path/to/resource?query=param&another=param#section'
      )
    ).toBe(true)
  })

  it('should return true for valid URLs with encoding', () => {
    expect(validateUrl('https://example.com/path%20with%20spaces')).toBe(true)
    expect(
      validateUrl('https://example.com/resource?query=param%20with%20spaces')
    ).toBe(true)
    expect(
      validateUrl('https://example.com/resource%20with%20encoding#section')
    ).toBe(true)
  })

  it('should return false for invalid URLs', () => {
    expect(validateUrl('http//example.com')).toBe(false)
    expect(validateUrl('https://')).toBe(false)
    expect(validateUrl('ftp:/example.com')).toBe(false)
    expect(validateUrl('http://example')).toBe(false) // No TLD
    expect(validateUrl('http://.com')).toBe(false) // Missing domain
    expect(validateUrl('http://example..com')).toBe(false) // Double dot in domain
    // expect(validateUrl('http://-example.com')).toBe(false) // Leading dash in domain
    // expect(validateUrl('http://example-.com')).toBe(false) // Trailing dash in domain
    expect(validateUrl('http://example,com')).toBe(false) // Comma in domain
  })

  it('should return false for URLs with spaces not encoded', () => {
    expect(validateUrl('https://example.com/path with spaces')).toBe(false)
    expect(
      validateUrl('https://example.com/resource?query=param with spaces')
    ).toBe(false)
  })

  it('should return false for URLs with invalid characters', () => {
    expect(validateUrl('https://example.com/<>')).toBe(false)
    expect(validateUrl('https://example.com/resource?query=<invalid>')).toBe(
      false
    )
    expect(validateUrl('https://example.com/resource#<>')).toBe(false)
  })
})
