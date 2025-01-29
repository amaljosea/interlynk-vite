import { Box, SkeletonCircle, SkeletonText } from '@chakra-ui/react'

import Card from 'components/Card/Card'

const LynkLoader = () => {
  return (
    <Card>
      <Box padding='2'>
        <SkeletonCircle size='10' />
        <SkeletonText mt='4' noOfLines={6} spacing='4' skeletonHeight='2' />
      </Box>
    </Card>
  )
}

export default LynkLoader
