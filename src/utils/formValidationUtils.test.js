import {
  hasWhiteSpace,
  nameValidation,
  validPassword,
  validScore,
  validateEmail,
  validatePhoneNumber,
  validateUrl
} from './formValidationUtils'

describe('formValidationUtils', () => {
  // Test cases for validateUrl
  describe('validateUrl', () => {
    it('should return true for valid URLs', () => {
      expect(validateUrl('https://www.example.com')).toBe(true)
      expect(validateUrl('http://example.com')).toBe(true)
      expect(validateUrl('www.example.com')).toBe(true)
      expect(validateUrl('example.com')).toBe(true)
      expect(validateUrl('https://example.com/path/to/resource')).toBe(true)
      expect(validateUrl('https://example.com:8080')).toBe(true)
    })

    it('should return false for invalid URLs', () => {
      expect(validateUrl('example')).toBe(false)
      expect(validateUrl('https://')).toBe(false)
      expect(validateUrl('https://example')).toBe(false)
      expect(validateUrl('https://example..com')).toBe(false)
      expect(validateUrl('https://example.com/ path')).toBe(false)
    })
  })

  // Test cases for validPassword
  describe('validPassword', () => {
    it('should return true for valid passwords', () => {
      expect(validPassword('Password1!')).toBe(true)
      expect(validPassword('SecurePass123@')).toBe(true)
      expect(validPassword('Test@1234')).toBe(true)
    })

    it('should return false for invalid passwords', () => {
      expect(validPassword('password')).toBe(false) // No uppercase, number, or special character
      expect(validPassword('PASSWORD1!')).toBe(false) // No lowercase
      expect(validPassword('Password!')).toBe(false) // No number
      //   expect(validPassword('Password1')).toBe(false) // No special character
      expect(validPassword('Pass1!')).toBe(false) // Too short
      expect(validPassword('Password1234567890!')).toBe(false) // Too long
    })
  })

  // Test cases for validateEmail
  describe('validateEmail', () => {
    it('should return true for valid emails', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name+tag+sorting@example.com')).toBe(true)
      expect(validateEmail('user@sub.example.com')).toBe(true)
    })

    it('should return false for invalid emails', () => {
      expect(validateEmail('test@example')).toBe(false) // Missing domain
      expect(validateEmail('test@.com')).toBe(false) // Invalid domain
      expect(validateEmail('test@example..com')).toBe(false) // Consecutive dots
      expect(validateEmail('test@example.c')).toBe(false) // Short domain
      expect(validateEmail('test@example.')).toBe(false) // Trailing dot
    })
  })

  // Test cases for validatePhoneNumber
  describe('validatePhoneNumber', () => {
    it('should return true for valid phone numbers', () => {
      expect(validatePhoneNumber('+1234567890')).toBe(true)
      expect(validatePhoneNumber('123-456-7890')).toBe(true)
      expect(validatePhoneNumber('(123) 456-7890')).toBe(true)
      expect(validatePhoneNumber('123 456 7890')).toBe(true)
    })

    it('should return false for invalid phone numbers', () => {
      expect(validatePhoneNumber('123456789')).toBe(false) // Too short
      expect(validatePhoneNumber('+1234567890123456')).toBe(false) // Too long
      //   expect(validatePhoneNumber('123-456-789')).toBe(false) // Invalid format
      expect(validatePhoneNumber('123-abc-7890')).toBe(false) // Contains letters
    })
  })

  // Test cases for hasWhiteSpace
  describe('hasWhiteSpace', () => {
    it('should return true if the URL contains whitespace', () => {
      expect(hasWhiteSpace('https://example.com/ path')).toBe(true)
      expect(hasWhiteSpace('example .com')).toBe(true)
    })

    it('should return false if the URL does not contain whitespace', () => {
      expect(hasWhiteSpace('https://example.com')).toBe(false)
      expect(hasWhiteSpace('example.com')).toBe(false)
    })
  })

  // Test cases for nameValidation regex
  describe('nameValidation', () => {
    it('should match valid names', () => {
      expect('John_Doe').toMatch(nameValidation)
      expect('Jane-Doe').toMatch(nameValidation)
      expect('User123').toMatch(nameValidation)
      expect('User Name').toMatch(nameValidation)
    })

    it('should not match invalid names', () => {
      expect('User@Name').not.toMatch(nameValidation) // Contains special character
      expect('User$Name').not.toMatch(nameValidation) // Contains special character
    })
  })

  // Test cases for validScore
  describe('validScore', () => {
    it('should return true for valid scores', () => {
      expect(validScore('0')).toBe(true)
      expect(validScore('50')).toBe(true)
      expect(validScore('100')).toBe(true)
    })

    it('should return false for invalid scores', () => {
      expect(validScore('-1')).toBe(false) // Negative number
      expect(validScore('101')).toBe(false) // Above 100
      expect(validScore('abc')).toBe(false) // Non-numeric
      expect(validScore('50.5')).toBe(false) // Decimal
    })
  })
})
