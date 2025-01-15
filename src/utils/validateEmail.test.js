import { validateEmail } from './formValidationUtils'

describe('validateEmail', () => {
  test('should return true for valid email addresses', () => {
    expect(validateEmail('test@example.com')).toBe(true)
    expect(validateEmail('user.name+tag+sorting@example.com')).toBe(true)
    expect(validateEmail('user_name@example.co')).toBe(true)
    expect(validateEmail('user-name@example.io')).toBe(true)
    expect(validateEmail('user123@example.me')).toBe(true)
    expect(validateEmail('1berrabah@tribun.health')).toBe(true)
  })

  test('should return false for invalid email addresses', () => {
    expect(validateEmail('plainaddress')).toBe(false)
    expect(validateEmail('@@missingdomain.com')).toBe(false)
    expect(validateEmail('username@.com')).toBe(false)
    expect(validateEmail('username@com')).toBe(false)
    expect(validateEmail('username@.com.')).toBe(false)
    expect(validateEmail('username@com.')).toBe(false)
    expect(validateEmail('username@.')).toBe(false)
    expect(validateEmail('@example.com')).toBe(false)
    expect(validateEmail('username@com..com')).toBe(false)
    expect(validateEmail('username@com,com')).toBe(false)
  })

  test('should return false for emails with invalid characters', () => {
    expect(validateEmail('username@exam!ple.com')).toBe(false)
    expect(validateEmail('user@name@example.com')).toBe(false)
    expect(validateEmail('username@exam#ple.com')).toBe(false)
  })
})
