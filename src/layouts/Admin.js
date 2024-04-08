import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'
import React, { useEffect, useState } from 'react'
import { Outlet, redirect, useNavigate } from 'react-router-dom'
import { dashRoutes } from 'routes.js'

import { Box, Portal, Stack } from '@chakra-ui/react'

// Layout components
import AdminNavbar from 'components/Navbars/AdminNavbar.js'
import Sidebar from 'components/Sidebar'

import PanelContainer from '../components/Layout/PanelContainer'
import PanelContent from '../components/Layout/PanelContent'
import { getActiveNavbar, getActiveRoute } from '../utils'
import { logoutUser } from '../utils/authUtils'

export default function Dashboard(props) {
  const authToken = Cookies.get('authToken')
  const highRes = window.matchMedia('(min-width: 2500px)')
  const tabRes = window.matchMedia('(max-width: 1199px)')
  const navigate = useNavigate()
  const { ...rest } = props
  // states and functions
  const [sidebarVariant] = useState('transparent')
  // functions for changing the states from components

  document.documentElement.dir = 'ltr'
  // Chakra Color Mode

  const isTokenExpired = (token) => {
    const decodedToken = jwtDecode(token)
    if (!decodedToken) {
      return true
    }
    const currentTime = Date.now() / 1000
    return decodedToken.exp < currentTime
  }

  useEffect(() => {
    if (authToken) {
      try {
        const expired = isTokenExpired(authToken)
        if (expired === true) {
          logoutUser().then((r) => navigate('/auth'))
        }
      } catch (err) {
        console.error('Invalid Token')
        logoutUser().then((r) => navigate('/auth'))
      }
    }
  }, [authToken])

  useEffect(() => {
    if (!authToken) {
      navigate('/auth')
    }
  }, [])

  useEffect(() => {
    if (location.pathname.startsWith('/vendor')) {
      redirect('/vendor/dashboard')
      sessionStorage.removeItem('signedUrlParams')
    }
  }, [location])

  return (
    <Stack width={'100%'} direction={'row'} alignItems={'flex-start'}>
      <Sidebar
        routes={dashRoutes}
        logoText={'Interlynk DASHBOARD'}
        display='none'
        sidebarVariant={sidebarVariant}
        {...rest}
      />
      <Box
        minH='100vh'
        w={highRes?.matches ? '98%' : tabRes?.matches ? '100%' : '96%'}
        pos={'absolute'}
        right={0}
      >
        <Portal>
          <AdminNavbar
            tabRes={tabRes}
            brandText={getActiveRoute(dashRoutes)}
            secondary={getActiveNavbar(dashRoutes)}
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
