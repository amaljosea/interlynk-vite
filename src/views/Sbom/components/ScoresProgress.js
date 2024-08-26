import { useParams } from 'react-router-dom'

import { Grid, GridItem } from '@chakra-ui/react'

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
    <Grid
      gap={4}
      width={'100%'}
      alignItems={'flex-start'}
      templateColumns='repeat(12, 1fr)'
    >
      <GridItem colSpan={6}>
        <ProgressBar
          value={qualityScore}
          loading={loading}
          text='SBOM Quality Score'
        />
      </GridItem>
      <GridItem colSpan={6}>
        {shouldShowDemoFeatures && (
          <ProgressBar
            value={healthScore}
            loading={loading}
            text='Version Health Score'
          />
        )}
      </GridItem>
    </Grid>
  )
}
