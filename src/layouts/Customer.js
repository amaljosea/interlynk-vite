// Chakra imports
import React, { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { customerRoutes } from 'routes'

import { Box, Portal, Stack } from '@chakra-ui/react'

// Layout components
import AdminNavbar from 'components/Navbars/AdminNavbar.js'
import Sidebar from 'components/Sidebar'

// Custom components
import PanelContainer from '../components/Layout/PanelContainer'
import PanelContent from '../components/Layout/PanelContent'
import { getActiveNavbar, getActiveRoute } from '../utils'

export default function Customer(props) {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const signedUrlParams = queryParams.get('signed_url_params')

  const { ...rest } = props
  // states and functions
  const [sidebarVariant] = useState('transparent')

  document.documentElement.dir = 'ltr'

  useEffect(() => {
    if (signedUrlParams) {
      sessionStorage.setItem('signedUrlParams', signedUrlParams)
    }
  }, [signedUrlParams])

  return (
    <Stack width={'100%'} direction={'row'} alignItems={'flex-start'}>
      <Sidebar
        routes={customerRoutes}
        logoText={'Interlynk DASHBOARD'}
        display='none'
        sidebarVariant={sidebarVariant}
        {...rest}
      />
      <Box minH='100vh' w={'96%'} pos={'absolute'} right={0}>
        <Portal>
          <AdminNavbar
            logoText={'Interlynk DASHBOARD'}
            brandText={getActiveRoute(customerRoutes)}
            secondary={getActiveNavbar(customerRoutes)}
          />
        </Portal>
        <Box bg='rgba(0,0,0,0.04)' minH={'100vh'} maxH={'100%'}>
          <PanelContent>
            <PanelContainer>
              <Outlet />
            </PanelContainer>
          </PanelContent>
        </Box>
      </Box>
    </Stack>
  )
}
