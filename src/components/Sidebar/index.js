/*eslint-disable*/
// chakra imports
import { Box } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import SidebarContent from './SidebarContent'
import { useGlobalState } from 'hooks/useGlobalState'

// FUNCTIONS

function Sidebar({ routes }) {
  const { minimize, activeDockerHub, setMinimize } = useGlobalState()

  const [filterRoutes, setFilterRoutes] = useState([])

  useEffect(() => {
    if (!activeDockerHub) {
      const allRoutes = routes.filter((item) => item.name !== 'Images')
      setFilterRoutes(allRoutes)
    } else {
      setFilterRoutes(routes)
    }
  }, [activeDockerHub])

  // SIDEBAR
  return (
    <Box
      display={{ sm: 'none', xl: 'block' }}
      position='fixed'
      onMouseEnter={() => setMinimize(false)}
      onMouseLeave={() => setMinimize(true)}
      w={minimize === true ? '75px' : '210px'}
      borderRight={'1px solid #E2E8F0'}
      bg={'white'}
      height={'100vh'}
      zIndex={111}
    >
      <SidebarContent routes={filterRoutes} logoText={'Interlynk'} />
    </Box>
  )
}

export default Sidebar
