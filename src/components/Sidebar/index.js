/*eslint-disable*/
// chakra imports
import { Box } from '@chakra-ui/react'
import SidebarContent from './SidebarContent'
import { useGlobalState } from 'hooks/useGlobalState'

// FUNCTIONS

function Sidebar({ routes }) {
  const { minimize, setMinimize } = useGlobalState()

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
    >
      <SidebarContent routes={routes} logoText={'Interlynk'} />
    </Box>
  )
}

export default Sidebar
