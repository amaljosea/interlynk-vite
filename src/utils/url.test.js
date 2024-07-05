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

  test('Appending', () => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        search: '?myQueryParam=value' // Replace with your desired query string
      }
    })

    expect(appendParams({ url: 'inputurl', paramsObj: { test: 'abc' } })).toBe(
      'inputurl?myQueryParam=value&test=abc'
    )
  })

  test('Replacing', () => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        search: '?myQueryParam=value' // Replace with your desired query string
      }
    })

    expect(
      appendParams({
        url: 'inputurl',
        paramsObj: { test: 'abc' },
        replaceParams: true
      })
    ).toBe('inputurl?test=abc')
  })
})
