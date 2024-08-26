import { Flex, Skeleton, Text } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'

import SbomDetails from './SbomDetails/index'

const SbomInfo = ({ data, error, loading }) => {
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
    <Card className='version'>
      <CardBody>
        <SbomDetails sbomData={data} />
      </CardBody>
    </Card>
  )
}

export default SbomInfo
