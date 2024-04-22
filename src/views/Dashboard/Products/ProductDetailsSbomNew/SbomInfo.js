import { useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import SbomActions from 'views/Sbom/components/SbomActions'

import { Grid, GridItem, Skeleton, Text } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'

import { GetProductData } from 'graphQL/Queries'

import SbomDetails from './SbomDetails'

const SbomInfo = () => {
  const params = useParams()

  const productId = params.productid
  const sbomId = params.sbomid

  const {
    data: sbomData,
    loading,
    error,
    refetch
  } = useQuery(GetProductData, {
    variables: { projectId: productId, sbomId: sbomId }
  })

  if (error) {
    return (
      <Card>
        <Text>Something went wrong</Text>
      </Card>
    )
  }

  return (
    <Card mb='6'>
      <CardBody>
        <Grid
          width={'100%'}
          templateColumns='repeat(5, 1fr)'
          alignItems={'top'}
          gap={10}
        >
          <GridItem colSpan={3}>
            {loading ? (
              <Skeleton width={'100%'} height='30px' />
            ) : (
              <SbomDetails sbomData={sbomData} />
            )}
          </GridItem>
          <GridItem colSpan={2} height={'fit-content'}>
            {loading ? (
              <Skeleton width={'100%'} height='30px' />
            ) : (
              <SbomActions sbom={sbomData?.sbom} refetch={refetch} />
            )}
          </GridItem>
        </Grid>
      </CardBody>
    </Card>
  )
}

export default SbomInfo
