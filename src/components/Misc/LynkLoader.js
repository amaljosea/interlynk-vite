import { Box, SkeletonText } from '@chakra-ui/react'

import Card from 'components/Card/Card'

const LynkLoader = () => {
  return (
    <Card h='100%'>
      <Box padding='2'>
        <SkeletonText mt='4' noOfLines={8} spacing='4' skeletonHeight='2' />
      </Box>
    </Card>
  )
}

export default LynkLoader
