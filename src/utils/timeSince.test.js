import { timeSince } from 'utils'

jest.useFakeTimers() // Ensure consistent time behavior
jest.setSystemTime(new Date('2025-03-21T08:00:00Z')) // Mock system time

describe('timeSince', () => {
  beforeEach(() => {
    jest.restoreAllMocks() // Reset mocks before each test
  })

  test('should return "0 seconds ago" when the time difference is 0 seconds', () => {
    const inputDate = new Date('2025-03-21T08:00:00Z').toISOString()
    expect(timeSince(inputDate)).toBe('0 seconds ago')
  })

  test('should return "10 seconds ago" when the time difference is 10 seconds', () => {
    const inputDate = new Date('2025-03-21T07:59:50Z').toISOString()
    expect(timeSince(inputDate)).toBe('10 seconds ago')
  })

  test('should return "1 minute ago" when the time difference is 1 minute', () => {
    const inputDate = new Date('2025-03-21T07:59:00Z').toISOString()
    expect(timeSince(inputDate)).toBe('1 minute ago')
  })

  test('should return "10 minutes ago" when the time difference is 10 minutes', () => {
    const inputDate = new Date('2025-03-21T07:50:00Z').toISOString()
    expect(timeSince(inputDate)).toBe('10 minutes ago')
  })

  test('should return "1 hour ago" when the time difference is 1 hour', () => {
    const inputDate = new Date('2025-03-21T07:00:00Z').toISOString()
    expect(timeSince(inputDate)).toBe('1 hour ago')
  })

  test('should return "4 hours ago" when the time difference is 4 hours', () => {
    const inputDate = new Date('2025-03-21T04:00:00Z').toISOString()
    expect(timeSince(inputDate)).toBe('4 hours ago')
  })

  test('should return "1 day ago" when the time difference is 1 day', () => {
    const inputDate = new Date('2025-03-20T08:00:00Z').toISOString()
    expect(timeSince(inputDate)).toBe('1 day ago')
  })

  test('should return "5 days ago" when the time difference is 5 days', () => {
    const inputDate = new Date('2025-03-16T08:00:00Z').toISOString()
    expect(timeSince(inputDate)).toBe('5 days ago')
  })

  test('should return "28 days ago" when the time difference 28 days', () => {
    const inputDate = new Date('2025-02-21T08:00:00Z').toISOString()
    expect(timeSince(inputDate)).toBe('28 days ago')
  })

  test('should return "1 month ago" when the time difference is 1 month', () => {
    const inputDate = new Date('2025-02-19T08:00:00Z').toISOString()
    expect(timeSince(inputDate)).toBe('1 month ago')
  })

  test('should return "3 months ago" when the time difference is 3 months', () => {
    const inputDate = new Date('2024-12-21T08:00:00Z').toISOString()
    expect(timeSince(inputDate)).toBe('3 months ago')
  })

  test('should return "1 year ago" when the time difference is 1 year', () => {
    const inputDate = new Date('2024-03-21T08:00:00Z').toISOString()
    expect(timeSince(inputDate)).toBe('1 year ago')
  })

  test('should return "5 years ago" when the time difference is 5 years', () => {
    const inputDate = new Date('2020-03-21T08:00:00Z').toISOString()
    expect(timeSince(inputDate)).toBe('5 years ago')
  })
})
