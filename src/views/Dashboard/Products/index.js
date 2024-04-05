// Chakra imports
import { Outlet } from 'react-router-dom'

import { Flex } from '@chakra-ui/react'

function Index() {
  return (
    <Flex
      flexDirection='column'
      pt={{ base: '120px', md: '74px' }}
      pr={2}
      pl={5}
    >
      <Outlet />
    </Flex>
  )
}

export default Index
