import { useParams } from 'react-router-dom'
import { shouldShowDemoFeatures } from 'utils/shouldShowDemoFeatures'

import { Box, Progress, Stack, Text } from '@chakra-ui/react'

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

  const getColor = () => {
    if (qualityScore < 30) {
      return 'red'
    } else if (qualityScore >= 30 && qualityScore <= 70) {
      return 'blue'
    } else {
      return 'green'
    }
  }

  if (!shouldShowDemoFeatures()) {
    return null
  }

  return (
    <Stack spacing={0.4}>
      <Box position='relative' display='inline-block' width='100%'>
        <Progress
          size='lg'
          height={'1.5rem'}
          value={qualityScore}
          colorScheme={getColor()}
          borderRadius={'0.375rem'}
          isIndeterminate={loading}
        />
        <Box
          position='absolute'
          top='0'
          left='0'
          width='100%'
          height='100%'
          display='flex'
          alignItems='center'
          justifyContent='center'
          color={qualityScore < 50 ? 'black' : 'white'}
          fontWeight='medium'
          fontSize={'xs'}
        >
          <Text>{qualityScore} / 100</Text>
        </Box>
      </Box>
      <Text
        pos={'relative'}
        top={1}
        textAlign={'center'}
        fontSize={'xs'}
        style={{ cursor: 'pointer' }}
      >
        SBOM Quality Score
      </Text>
    </Stack>
  )
}
