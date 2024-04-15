import { appendParams } from './url'

// Replace with the correct path to your util file

describe('appendParams', () => {
  test('empty value ', () => {
    expect(appendParams({ url: 'inputurl' })).toBe('inputurl')
  })

  test('non empty value ', () => {
    expect(appendParams({ url: 'inputurl', paramsObj: { test: 'abc' } })).toBe(
      'inputurl?test=abc'
    )
  })
})
