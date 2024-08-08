import { useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'

import { Center, SimpleGrid, Skeleton } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'

import { useShouldShowDemoFeatures } from 'hooks/useShouldShowDemoFeatures'

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
  const { shouldShowDemoFeatures } = useShouldShowDemoFeatures()

  const { data, loading, error } = useQuery(SBOM_LIST_WITH_DATA_QUERY, {
    variables: {
      projectId: productId
    }
  })

  const totlaColumns = shouldShowDemoFeatures ? 6 : 5

  const items = data?.project?.sbomVersions?.nodes
  const count = items?.length
  const sbomIds = items?.map((i) => i.id)

  if (error) {
    return <Center as={Card}>Error</Center>
  }

  if (loading) {
    return (
      <SimpleGrid width={'100%'} columns={5} spacing='24px'>
        {[1, 2, 3, 4, 5].map((_, index) => (
          <Card key={index}>
            <CardBody>
              <Skeleton width={'100%'} height={8} />
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>
    )
  }

  if (count <= 2) {
    return null
  }

  const graphData = formatDataForGraph(items)

  return (
    <SimpleGrid spacing={5} width={'100%'} columns={totlaColumns}>
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
      <SimpleLineChat config={policyConfig} data={graphData} label={'Policy'} />
      <ScoreGraphs sbomIds={sbomIds} />
    </SimpleGrid>
  )
}
