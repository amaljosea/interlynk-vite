import { Box, useColorMode } from '@chakra-ui/react'

import SidebarContent from './SidebarContent'

const Sidebar = ({ routes }) => {
  const { colorMode } = useColorMode()

  return (
    <Box
      px={3.5}
      height={'100vh'}
      bg={colorMode === 'light' ? 'white' : 'gray.900'}
      borderRight={`-.5px solid ${colorMode === 'light' ? '#E2E8F0' : '#1A202C'}`}
    >
      <SidebarContent routes={routes} />
    </Box>
  )
}

export default Sidebar
