import { useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'

import { Box, Flex } from '@chakra-ui/react'

import { ScoreGraphs } from './ScoreGraphs'
import {
  SBOM_LIST_WITH_DATA_QUERY,
  SimpleBarChat,
  SimpleLineChat,
  formatDataForGraph,
  policyConfig,
  vulnConfig
} from './utils'

export const ProductGraphs = () => {
  const params = useParams()
  const productId = params.productid

  const { data, loading, error } = useQuery(SBOM_LIST_WITH_DATA_QUERY, {
    variables: {
      projectId: productId
    }
  })

  const items = data?.project?.sbomVersions?.nodes
  const count = items?.length
  const sbomIds = items?.map((i) => i.id)

  if (error) {
    return 'Error'
  }

  if (loading) {
    return <Box mt={8}>Loading...</Box>
  }

  if (count <= 2) {
    return null
  }

  const graphData = formatDataForGraph(items)

  return (
    <Box display='flex' justifyContent='center' mt={8}>
      <Flex flexWrap={'wrap'} alignItems={'center'} gap={12}>
        <SimpleBarChat
          color='#3182ce'
          label={'Component'}
          dataKey='stats.compCount'
          data={graphData}
        />
        <SimpleBarChat
          color='#3182ce'
          label={'License'}
          dataKey='stats.compLicenseCount'
          data={graphData}
        />
        <SimpleLineChat
          config={vulnConfig}
          data={graphData}
          label={'Vulnerability'}
        />
        <SimpleLineChat
          config={policyConfig}
          data={graphData}
          label={'Policy'}
        />
        <ScoreGraphs sbomIds={sbomIds} />
      </Flex>
    </Box>
  )
}
