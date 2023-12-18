// Chakra imports
import {
  Box,
  ChakraProvider,
  Portal,
  Stack,
  useDisclosure
} from '@chakra-ui/react'
import Footer from 'components/Footer/Footer.js'
// Layout components
import AdminNavbar from 'components/Navbars/AdminNavbar.js'
import Sidebar from 'components/Sidebar'
import React, { useEffect, useState } from 'react'
import { Redirect, Route, Switch, useHistory } from 'react-router-dom'
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
import Automation from 'views/Dashboard/Automation'
import ChangeLog from 'views/Dashboard/Changelog'
import { jwtDecode } from 'jwt-decode'
import { GlobalStateProvider } from 'hooks/useGlobalState'

export default function Dashboard(props) {
  const authToken = Cookies.get('authToken')
  const history = useHistory()
  const { ...rest } = props
  // states and functions
  const [sidebarVariant] = useState('transparent')
  // functions for changing the states from components
  const getRoute = () => {
    return window.location.pathname !== '/vendor/full-screen-maps'
  }

  const getRoutes = (routes) => {
    const route = routes.map((prop, key) => {
      // console.log('prop', prop)
      if (prop.collapse) {
        return getRoutes(prop.views)
      }
      if (prop.category === 'account') {
        return getRoutes(prop.views)
      }
      if (prop.layout === '/vendor') {
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

    return route
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
        history.push('/auth')
      }
    }
  }, [])

  useEffect(() => {
    if (!authToken) {
      history.push('/auth')
    }
  }, [])

  return (
    <GlobalStateProvider>
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
              {getRoute() && (
                <PanelContent>
                  <PanelContainer>
                    <Switch>
                      {getRoutes(dashRoutes)}
                      <Route path={`/vendor/autofix`} component={Automation} />
                      <Route path={`/vendor/changelog`} component={ChangeLog} />
                      <Redirect from='/vendor' to='/vendor/dashboard' />
                    </Switch>
                  </PanelContainer>
                </PanelContent>
              )}
              <Footer />
            </Box>
          </Box>
        </Stack>
      </ApolloProvider>
    </GlobalStateProvider>
  )
}
