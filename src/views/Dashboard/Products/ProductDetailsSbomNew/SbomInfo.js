import { SkeletonText, Text } from '@chakra-ui/react'

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
      <Card>
        <SkeletonText width={'100%'} noOfLines={2} skeletonHeight={'22px'} />
      </Card>
    )
  }

  return (
    <Card className='version' pb={7}>
      <CardBody>
        <SbomDetails sbomData={data} />
      </CardBody>
    </Card>
  )
}

export default SbomInfo
