import { getComponentHealthScore } from './getComponentHealthScore'
import { healthScoreData } from './healthScoreData'

const fetchHealthScoreData = async () => {
  // Simulate async data loading so that componentData is available for getComponentHealthScore, reducing chances of UI freeze
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(healthScoreData)
    }, 1000)
  })
}

export const getComponentHealthScoreFromLocalData = async ({
  componentName,
  componentVersion
}) => {
  const data = await fetchHealthScoreData()
  const componentData = data.find(
    (item) =>
      item.ComponentName === componentName &&
      item.ComponentVersion === componentVersion
  )
  if (!componentData) {
    console.warn(
      `Missing data for component ${componentName} v${componentVersion}`
    )
    return { healthScore: 0 }
  }

  const { healthScore } = getComponentHealthScore(componentData)

  return {
    healthScore
  }
}
