import { isPast, isValid } from 'date-fns'
import { round } from 'lodash'

const logError = (type) => {
  console.warn(`Missing data - ${type}`)
}

const weightAge = 0.25
const weightCommunity = 0.25
const weightSecurity = 0.5

export const getComponentHealthScore = (componentData) => {
  // basic check --------------
  if (!componentData) {
    logError('componentData')
    return { healthScore: 0 }
  }

  // Identifiable check --------------
  if (componentData.Identifiable !== 'Yes') {
    return { healthScore: 0 }
  }

  // EOL check --------------
  const dateEOL = new Date(componentData.EOL)

  if (!isValid(dateEOL)) {
    if (isPast(dateEOL)) {
      return { healthScore: 0 }
    }
  }

  // EOS check --------------
  const dateEOS = new Date(componentData.EOS)

  if (!isValid(dateEOS)) {
    if (isPast(dateEOS)) {
      return { healthScore: 0 }
    }
  }

  // Release Age check --------------

  if (typeof componentData['Release Age'] !== 'number') {
    logError('Release Age')
    return { healthScore: 0 }
  }

  const scoreAge =
    componentData['Release Age'] > 3 * 365
      ? 0
      : ((3 * 365 - componentData['Release Age']) * 100) / (3 * 365)

  // Contributors Count check --------------

  if (typeof componentData['Contributors Count'] !== 'number') {
    logError('Contributors Count')
    return { healthScore: 0 }
  }

  let scoreCommunity

  if (componentData['Contributors Count'] < 5) {
    scoreCommunity = 0
  } else if (componentData['Contributors Count'] > 20) {
    scoreCommunity = 100
  } else {
    scoreCommunity = (componentData['Contributors Count'] * 100) / 20
  }

  // OpenSSF Scorecard check --------------

  let scoreSecurity = 5

  if (typeof componentData['OpenSSF Scorecard'] === 'number') {
    scoreSecurity = componentData['OpenSSF Scorecard'] * 10
  }

  return {
    healthScore: round(
      scoreAge * weightAge +
        scoreCommunity * weightCommunity +
        scoreSecurity * weightSecurity,
      2
    )
  }
}
