import { getComponentHealthScore } from './getComponentHealthScore'
import { healthScoreData } from './healthScoreData'

export const getComponentHealthScoreFromLocalData = ({
  componentName,
  componentVersion
}) => {
  const componentData = healthScoreData.find(
    (item) =>
      item.ComponentName === componentName &&
      item.ComponentVersion === componentVersion
  )

  const { healthScore } = getComponentHealthScore(componentData)

  return {
    healthScore
  }
}
