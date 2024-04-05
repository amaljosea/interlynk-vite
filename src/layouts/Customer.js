// Chakra imports
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { createUploadLink } from 'apollo-upload-client'
import React, { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { customerRoutes } from 'routes'

import { Box, Portal, Stack, useToast } from '@chakra-ui/react'

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

  const authToken = sessionStorage.getItem('signedUrlParams')
  const highRes = window.matchMedia('(min-width: 2500px)')
  const { ...rest } = props
  // states and functions
  const [sidebarVariant] = useState('transparent')

  document.documentElement.dir = 'ltr'

  const graphqlAPI = process.env.REACT_APP_GRAPHQL_API

  const uploadLink = createUploadLink({
    uri: graphqlAPI
  })

  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        'Interlynk-ShareLynk-Token': signedUrlParams || authToken
      }
    }
  })

  const toast = useToast()
  const env = process.env.NODE_ENV

  const errorLink = onError(({ graphQLErrors }) => {
    if (graphQLErrors && env !== 'production') {
      graphQLErrors.forEach(({ message }) => {
        toast({
          title: 'An error occurred.',
          description: message,
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top'
        })
      })
    }
  })

  const client = new ApolloClient({
    link: ApolloLink.from([errorLink, authLink, uploadLink]),
    cache: new InMemoryCache(),
    queryDeduplication: false
  })

  useEffect(() => {
    if (signedUrlParams) {
      sessionStorage.setItem('signedUrlParams', signedUrlParams)
    }
  }, [signedUrlParams])

  return (
    <ApolloProvider client={client}>
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
    </ApolloProvider>
  )
}
