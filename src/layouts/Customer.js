import React, { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { customerRoutes } from 'routes'

import { Box, Flex, Stack } from '@chakra-ui/react'

// Layout components
import AdminNavbar from 'components/Navbars/AdminNavbar.js'
import Sidebar from 'components/Sidebar'

// Custom components
import { getActiveNavbar, getActiveRoute } from '../utils'

export default function Customer(props) {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const signedUrlParams = queryParams.get('signed_url_params')
  const tabRes = window.matchMedia('(max-width: 1199px)')

  document.documentElement.dir = 'ltr'

  useEffect(() => {
    if (signedUrlParams) {
      sessionStorage.setItem('signedUrlParams', signedUrlParams)
    }
  }, [signedUrlParams])

  return (
    <Stack
      spacing={0}
      width={'100%'}
      direction={'row'}
      alignItems={'flex-start'}
      bg='rgba(0,0,0,0.04)'
    >
      <Box pos={'sticky'} top={0}>
        <Sidebar routes={customerRoutes} />
      </Box>
      <Flex width={'100%'} flexDir={'column'}>
        <Box
          top={0}
          bg={'white'}
          zIndex={111}
          pos={'sticky'}
          borderBottom={'1px solid #E2E8F0'}
        >
          <AdminNavbar
            tabRes={tabRes}
            brandText={getActiveRoute(customerRoutes)}
            secondary={getActiveNavbar(customerRoutes)}
          />
        </Box>
        <Box my={6} px={10}>
          <Outlet />
        </Box>
      </Flex>
    </Stack>
  )
}
