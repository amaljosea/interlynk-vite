import { Flex } from '@chakra-ui/react'

import Compare from './Compare'

const Tools = () => {
  return (
    <Flex
      flexDirection='column'
      pt={{ base: '120px', md: '74px' }}
      gap={6}
      pr={2}
      pl={5}
    >
      <Compare selectedSboms={null} />
    </Flex>
  )
}

export default Tools
