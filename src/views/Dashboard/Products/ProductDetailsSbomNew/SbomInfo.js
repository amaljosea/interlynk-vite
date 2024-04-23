import SbomActions from 'views/Sbom/components/SbomActions'

import { Flex, Grid, GridItem, Skeleton, Text } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'

import SbomDetails from './SbomDetails'

const SbomInfo = ({ data, error, loading, refetch }) => {
  if (error) {
    return (
      <Card>
        <Text>Something went wrong</Text>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card mb='6'>
        <Flex alignItems={'center'} gap={6}>
          <Skeleton width={'100%'} height='30px' />
          <Skeleton width={'100%'} height='30px' />
        </Flex>
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
            <SbomDetails sbomData={data} />
          </GridItem>
          <GridItem colSpan={2} height={'fit-content'}>
            <SbomActions sbom={data} refetch={refetch} />
          </GridItem>
        </Grid>
      </CardBody>
    </Card>
  )
}

export default SbomInfo
