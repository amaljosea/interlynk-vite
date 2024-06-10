import { getComponentHealthScore } from './getComponentHealthScore'

describe('getComponentHealthScore', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterAll(() => {
    console.error.mockRestore()
  })

  afterEach(() => {
    console.error.mockClear()
  })

  test('basic check', () => {
    expect(getComponentHealthScore()).toStrictEqual({
      healthScore: 0
    })
    expect(console.error.mock.calls[0][0]).toContain('componentData')
  })

  test('Identifiable check', () => {
    expect(
      getComponentHealthScore({
        Identifiable: 'No'
      })
    ).toStrictEqual({
      healthScore: 0
    })
  })

  test('EOL check past', () => {
    expect(
      getComponentHealthScore({
        Identifiable: 'Yes',
        EOL: '2022-01-01'
      })
    ).toStrictEqual({
      healthScore: 0
    })
  })

  test('EOS check past', () => {
    expect(
      getComponentHealthScore({
        Identifiable: 'Yes',
        EOL: '2022-01-01'
      })
    ).toStrictEqual({
      healthScore: 0
    })
  })

  test('Release Age not number', () => {
    expect(
      getComponentHealthScore({
        Identifiable: 'Yes',
        EOS: '2030-01-01',
        EOL: '2030-01-01',
        'Release Age': 'xx'
      })
    ).toStrictEqual({
      healthScore: 0
    })
    expect(console.error.mock.calls[0][0]).toContain('Release Age')
  })

  test('Contributors Count not number', () => {
    expect(
      getComponentHealthScore({
        Identifiable: 'Yes',
        EOS: '2030-01-01',
        EOL: '2030-01-01',
        'Release Age': 123
      })
    ).toStrictEqual({
      healthScore: 0
    })
    expect(console.error.mock.calls[0][0]).toContain('Contributors Count')
  })
})
