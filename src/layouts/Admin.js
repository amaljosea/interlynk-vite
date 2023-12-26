// Chakra imports
import { Box, Portal, Stack, useDisclosure } from '@chakra-ui/react'
import Footer from 'components/Footer/Footer.js'
// Layout components
import AdminNavbar from 'components/Navbars/AdminNavbar.js'
import Sidebar from 'components/Sidebar'
import React, { useEffect, useState } from 'react'
import { Outlet, redirect, useNavigate } from 'react-router-dom'
import { dashRoutes } from 'routes.js'
import PanelContainer from '../components/Layout/PanelContainer'
import PanelContent from '../components/Layout/PanelContent'
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  ApolloLink
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import Cookies from 'js-cookie'
import { createUploadLink } from 'apollo-upload-client'
import { getActiveNavbar, getActiveRoute } from '../utils'
import { jwtDecode } from 'jwt-decode'

export default function Dashboard(props) {
  const authToken = Cookies.get('authToken')
  const navigate = useNavigate()
  const { ...rest } = props
  // states and functions
  const [sidebarVariant] = useState('transparent')
  // functions for changing the states from components
  const getRoute = () => {
    return window.location.pathname !== '/vendor/full-screen-maps'
  }

  const { isOpen, onOpen, onClose } = useDisclosure()
  document.documentElement.dir = 'ltr'
  // Chakra Color Mode

  const graphqlAPI = process.env.REACT_APP_GRAPHQL_API

  // const httpLink = createHttpLink({
  //   uri: graphqlAPI
  // })

  const uploadLink = createUploadLink({
    uri: graphqlAPI
  })

  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        authorization: authToken
      }
    }
  })

  const client = new ApolloClient({
    link: ApolloLink.from([authLink, uploadLink]),
    cache: new InMemoryCache(),
    queryDeduplication: false
  })

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
      const expired = isTokenExpired(authToken)
      if (expired === true) {
        Cookies.remove('authToken')
        navigate('/auth')
      }
    }
  }, [])

  useEffect(() => {
    if (!authToken) {
      navigate('/auth')
    }
  }, [])

  useEffect(() => {
    if (location.pathname === '/vendor') {
      redirect('/vendor/dashboard')
    }
  }, [location])

  return (
    <ApolloProvider client={client}>
      <Stack width={'100%'} direction={'row'} alignItems={'flex-start'}>
        <Sidebar
          routes={dashRoutes}
          logoText={'Interlynk DASHBOARD'}
          display='none'
          sidebarVariant={sidebarVariant}
          {...rest}
        />
        <Box minH='100vh' w={'96%'} pos={'absolute'} right={0}>
          <Portal>
            <AdminNavbar
              onOpen={onOpen}
              logoText={'Interlynk DASHBOARD'}
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
    </ApolloProvider>
  )
}
