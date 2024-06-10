import { getComponentHealthScore } from './getComponentHealthScore'

describe('getComponentHealthScore', () => {
  test('basic check 1', () => {
    expect(
      getComponentHealthScore({
        Identifiable: 'No',
        'Release Age': 0,
        'Current Release': '1.0',
        'Contributors Count': 0,
        'Commits Count': 0,
        'Forks Count': 0,
        'OpenSSF Scorecard': 0,
        Deprecated: 'N/A',
        Outdated: 'N/A',
        EOL: 'N/A',
        EOS: 'N/A'
      })
    ).toStrictEqual({
      healthScore: 0
    })
  })

  test('basic check 2', () => {
    expect(
      getComponentHealthScore({
        Identifiable: 'Yes',
        'Release Age': 300,
        'Current Release': '1.0',
        'Contributors Count': 17,
        'Commits Count': 35,
        'Forks Count': 40,
        'OpenSSF Scorecard': 6.2,
        Deprecated: 'No',
        Outdated: 'No',
        EOL: 'N/A',
        EOS: 'N/A'
      })
    ).toStrictEqual({
      healthScore: 70.4
    })
  })
})
