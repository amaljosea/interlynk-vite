/*eslint-disable*/
// chakra imports
import { Box, useColorModeValue } from '@chakra-ui/react'
import { useEffect, useState, useRef } from 'react'
import SidebarContent from './SidebarContent'
import { useContext } from 'react'
import GlobalContext from 'context/GlobalContext'

// FUNCTIONS

function Sidebar(props) {
  const { minimize, activeDockerHub } = useContext(GlobalContext)
  const [filterRoutes, setFilterRoutes] = useState([])
  // to check for active links and opened collapses
  const mainPanel = useRef()
  let variantChange = '0.2s linear'

  const { logoText, routes, sidebarVariant } = props

  //  BRAND
  //  Chakra Color Mode
  let sidebarBg = 'none'
  let sidebarRadius = '0px'
  let sidebarMargins = '0px'
  if (sidebarVariant === 'opaque') {
    sidebarBg = useColorModeValue('white', 'gray.700')
    sidebarRadius = '16px'
    sidebarMargins = '16px 0px 16px 16px'
  }

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
    <Box ref={mainPanel}>
      <Box display={{ sm: 'none', xl: 'block' }} position='fixed'>
        <Box
          bg={'white'}
          transition={variantChange}
          w={minimize ? '100px' : '210px'}
          borderRight={'1px solid lightgray'}
          maxW={minimize ? '100px' : '210px'}
          ms={{
            sm: '16px'
          }}
          my={{
            sm: '16px'
          }}
          h='calc(100vh - 32px)'
          // ps='20px'
          // pe='20px'
          m={sidebarMargins}
          borderRadius={sidebarRadius}
        >
          <SidebarContent
            routes={filterRoutes}
            logoText={'Interlynk'}
            display='none'
            sidebarVariant={sidebarVariant}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default Sidebar
