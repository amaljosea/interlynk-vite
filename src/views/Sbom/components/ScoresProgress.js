import { useParams } from 'react-router-dom'
import { shouldShowDemoFeatures } from 'utils/shouldShowDemoFeatures'

import { Box, Progress, Text, Tooltip } from '@chakra-ui/react'

import { useQualityScore } from 'hooks/useQualityScore'

export const ScoresProgress = () => {
  const params = useParams()

  const showDemoFeatures = shouldShowDemoFeatures()

  const productId = params.productid
  const sbomId = params.sbomid

  const { qualityScore, maxScore, currentScore, loading } = useQualityScore({
    projectId: productId,
    sbomId,
    skip: !showDemoFeatures
  })

  if (!shouldShowDemoFeatures()) {
    return null
  }

  return (
    <Box>
      <Tooltip
        isDisabled={loading}
        label={`${qualityScore}/100 or ${currentScore}/${maxScore}`}
      >
        <Box mb={5}>
          <Text>SBOM quality score</Text>
          <Progress value={qualityScore} size='lg' isIndeterminate={loading} />
        </Box>
      </Tooltip>

      {/* <Box mb={5}>
        <Text>Health score</Text>
        <Progress value={80} />
      </Box> */}
    </Box>
  )
}
