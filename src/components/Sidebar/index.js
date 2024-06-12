import { Box } from '@chakra-ui/react'

import SidebarContent from './SidebarContent'

const Sidebar = ({ routes }) => {
  return (
    <Box
      px={3.5}
      bg={'white'}
      height={'100vh'}
      borderRight={'0.5px solid #EDF2F7'}
    >
      <SidebarContent routes={routes} />
    </Box>
  )
}

export default Sidebar
