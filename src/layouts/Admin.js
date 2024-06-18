import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'
import { KBarProvider } from 'kbar'
import React, { useEffect } from 'react'
import { Outlet, redirect, useNavigate } from 'react-router-dom'
import { dashRoutes } from 'routes.js'

import { Box, Flex, Stack, useColorMode } from '@chakra-ui/react'

import Kbar from 'components/Kbar'
// Layout components
import AdminNavbar from 'components/Navbars/AdminNavbar.js'
import Sidebar from 'components/Sidebar'

import { FaRegFile } from 'react-icons/fa6'

import { getActiveNavbar, getActiveRoute } from '../utils'
import { logoutUser } from '../utils/authUtils'

export default function Admin() {
  const authToken = Cookies.get('authToken')
  const tabRes = window.matchMedia('(max-width: 1199px)')
  const navigate = useNavigate()
  const { colorMode } = useColorMode()

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

  const actions = [
    {
      id: 'home',
      name: 'Home',
      section: 'navigation',
      icon: <FaRegFile color='#718096' />,
      perform: () => navigate('/vendor/dashboard')
    },
    {
      id: 'products',
      name: 'Products',
      section: 'navigation',
      icon: <FaRegFile color='#718096' />,
      perform: () => navigate('/vendor/products')
    },
    {
      id: 'requests',
      name: 'Requests',
      section: 'navigation',
      icon: <FaRegFile color='#718096' />,
      perform: () => navigate('/vendor/requests')
    },
    {
      id: 'vulnerabilities',
      name: 'Vulnerabilities',
      section: 'navigation',
      icon: <FaRegFile color='#718096' />,
      perform: () => navigate('/vendor/vulnerabilities')
    },
    {
      id: 'policies',
      name: 'Policies',
      section: 'navigation',
      icon: <FaRegFile color='#718096' />,
      perform: () => navigate('/vendor/policies')
    }
  ]

  useEffect(() => {
    if (authToken) {
      try {
        const expired = isTokenExpired(authToken)
        if (expired === true) {
          logoutUser().then(() => navigate('/auth'))
        }
      } catch (err) {
        console.error('Invalid Token')
        logoutUser().then(() => navigate('/auth'))
      }
    }
  }, [authToken, navigate])

  useEffect(() => {
    if (!authToken) {
      navigate('/auth')
    }
  }, [authToken, navigate])

  useEffect(() => {
    if (location.pathname.startsWith('/vendor')) {
      redirect('/vendor/dashboard')
      sessionStorage.removeItem('signedUrlParams')
    }
  }, [])

  return (
    <KBarProvider actions={actions} options={{ enableHistory: true }}>
      <Kbar />
      <Stack
        spacing={0}
        width={'100%'}
        direction={'row'}
        alignItems={'flex-start'}
        bg='rgba(0,0,0,0.04)'
      >
        <Box pos={'sticky'} top={0}>
          <Sidebar routes={dashRoutes} />
        </Box>
        <Flex width={'100%'} flexDir={'column'}>
          <Box
            top={0}
            zIndex={111}
            pos={'sticky'}
            bg={colorMode === 'light' ? 'white' : 'gray.900'}
            borderBottom={`1px solid ${colorMode === 'light' ? '#E2E8F0' : '#1A202C'}`}
          >
            <AdminNavbar
              tabRes={tabRes}
              brandText={getActiveRoute(dashRoutes)}
              secondary={getActiveNavbar(dashRoutes)}
            />
          </Box>
          <Box my={6} px={10}>
            <Outlet />
          </Box>
        </Flex>
      </Stack>
    </KBarProvider>
  )
}
