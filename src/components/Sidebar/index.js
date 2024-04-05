/*eslint-disable*/
// chakra imports
import { useState } from 'react'

import { Box } from '@chakra-ui/react'

import SidebarContent from './SidebarContent'

// FUNCTIONS

function Sidebar({ routes }) {
  const [minimize, setMinimize] = useState(true)

  // SIDEBAR
  return (
    <Box
      display={{ sm: 'none', xl: 'block' }}
      position='fixed'
      onMouseEnter={() => setMinimize(false)}
      onMouseLeave={() => setMinimize(true)}
      w={minimize === true ? '75px' : '210px'}
      bg={'white'}
      height={'100vh'}
      zIndex={111}
      borderRight={'0.5px solid #EDF2F7'}
    >
      <SidebarContent
        minimize={minimize}
        routes={routes}
        logoText={'Interlynk'}
      />
    </Box>
  )
}

export default Sidebar
