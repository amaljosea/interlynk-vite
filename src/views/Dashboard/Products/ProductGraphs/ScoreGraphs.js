import { useShouldShowDemoFeatures } from 'hooks/useShouldShowDemoFeatures'

import { HealthScoreGraph } from './HealthScoreGraph'
import { QualityScoreGraph } from './QualityScoreGraph'

export const ScoreGraphs = ({ sbomIds }) => {
  const { shouldShowDemoFeatures } = useShouldShowDemoFeatures()
  return (
    <>
      <QualityScoreGraph sbomIds={sbomIds} />
      {shouldShowDemoFeatures && <HealthScoreGraph sbomIds={sbomIds} />}
    </>
  )
}
