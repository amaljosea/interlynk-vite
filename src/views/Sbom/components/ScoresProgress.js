import { useParams } from 'react-router-dom'

import { Stack } from '@chakra-ui/react'

import { ProgressBar } from 'components/ProgressBar'

import { useSbomScores } from 'hooks/useSbomScores'
import { useShouldShowDemoFeatures } from 'hooks/useShouldShowDemoFeatures'

export const ScoresProgress = () => {
  const params = useParams()

  const { shouldShowDemoFeatures } = useShouldShowDemoFeatures()

  const productId = params.productid
  const sbomId = params.sbomid

  const { qualityScore, healthScore, loading } = useSbomScores({
    projectId: productId,
    sbomId,
    skip: !shouldShowDemoFeatures
  })

  return (
    <Stack spacing={3}>
      <ProgressBar
        value={qualityScore}
        loading={loading}
        text='SBOM Quality Score'
      />
      {shouldShowDemoFeatures && (
        <ProgressBar
          value={healthScore}
          loading={loading}
          text='Version Health Score'
        />
      )}
    </Stack>
  )
}
