// Chakra imports
import {
  Box,
  ChakraProvider,
  Portal,
  Stack,
  useDisclosure
} from '@chakra-ui/react'
// Layout components
import AdminNavbar from 'components/Navbars/AdminNavbar.js'
import Sidebar from 'components/Sidebar'
import React, { useState } from 'react'
import { Route, Switch } from 'react-router-dom'
// Custom Chakra theme
import theme from 'theme/theme.js'
// Custom components
import PanelContainer from '../components/Layout/PanelContainer'
import PanelContent from '../components/Layout/PanelContent'
import { customerRoutes } from 'routes.js'
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  ApolloLink
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import Cookies from 'js-cookie'
import { getActiveNavbar, getActiveRoute } from '../utils'
import { createUploadLink } from 'apollo-upload-client'
import ContextWrapper from 'context/ContextWrapper'

export default function Customer(props) {
  const { ...rest } = props

  // states and functions
  const [sidebarVariant, setSidebarVariant] = useState('transparent')
  // functions for changing the states from components
  const getRoute = () => {
    return window.location.pathname !== '/vendor/full-screen-maps'
  }

  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      // console.log('getting routes')
      if (prop.collapse) {
        // console.log('getting routes collapse')
        return getRoutes(prop.views)
      }
      if (prop.category === 'account') {
        // console.log('getting account')
        return getRoutes(prop.views)
      }
      if (prop.layout === '/customer') {
        // console.log('getting admin')
        return (
          <Route
            path={prop.layout + prop.path}
            component={prop.component}
            key={key}
          />
        )
      } else {
        return null
      }
    })
  }

  const { onOpen } = useDisclosure()
  document.documentElement.dir = 'ltr'
  // Chakra Color Mode

  const userToken = Cookies.get('userToken')

  const graphqlAPI = process.env.REACT_APP_GRAPHQL_API

  const uploadLink = createUploadLink({
    uri: graphqlAPI
  })

  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        authorization: userToken ? userToken : ''
      }
    }
  })
  const client = new ApolloClient({
    link: ApolloLink.from([authLink, uploadLink]),
    cache: new InMemoryCache()
  })

  return (
    <ApolloProvider client={client}>
      <ContextWrapper>
        <ChakraProvider theme={theme} resetCss={false}>
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
                  onOpen={onOpen}
                  logoText={'Interlynk DASHBOARD'}
                  brandText={getActiveRoute(customerRoutes)}
                  secondary={getActiveNavbar(customerRoutes)}
                />
              </Portal>
              <Box bg='rgba(0,0,0,0.04)' minH={'100vh'} maxH={'100%'}>
                {getRoute() && (
                  <PanelContent>
                    <PanelContainer>
                      <Switch>{getRoutes(customerRoutes)}</Switch>
                    </PanelContainer>
                  </PanelContent>
                )}
              </Box>
            </Box>
          </Stack>
        </ChakraProvider>
      </ContextWrapper>
    </ApolloProvider>
  )
}
