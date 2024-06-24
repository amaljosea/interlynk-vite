import { getDays } from './utils'

test('getDays returns correct dates for the same start and end date', () => {
  const startDate = '2024-06-10'
  const endDate = '2024-06-10'
  const result = getDays({ startDate, endDate })
  expect(result).toEqual({ dates: ['2024-06-10'] })
})

test('getDays returns correct dates for a range of dates', () => {
  const startDate = '2024-06-10'
  const endDate = '2024-06-15'
  const result = getDays({ startDate, endDate })
  expect(result).toEqual({
    dates: [
      '2024-06-10',
      '2024-06-11',
      '2024-06-12',
      '2024-06-13',
      '2024-06-14',
      '2024-06-15'
    ]
  })
})

test('getDays handles end date before start date', () => {
  const startDate = '2024-06-15'
  const endDate = '2024-06-10'
  const result = getDays({ startDate, endDate })
  expect(result).toEqual({ dates: [] })
})

test('getDays handles an invalid date input', () => {
  const startDate = 'invalid-date'
  const endDate = '2024-06-10'
  const result = getDays({ startDate, endDate })
  expect(result).toEqual({ dates: [] })
})

test('getDays handles leap years correctly', () => {
  const startDate = '2024-02-28'
  const endDate = '2024-03-01'
  const result = getDays({ startDate, endDate })
  expect(result).toEqual({ dates: ['2024-02-28', '2024-02-29', '2024-03-01'] })
})
