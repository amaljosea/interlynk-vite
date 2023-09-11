// Chakra imports
import { ChakraProvider, Portal, useDisclosure } from '@chakra-ui/react'
import Footer from 'components/Footer/Footer.js'
// Layout components
import AdminNavbar from 'components/Navbars/AdminNavbar.js'
import Sidebar from 'components/Sidebar'
import React, { useContext, useState } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import { dashRoutes } from 'routes.js'
// Custom Chakra theme
import theme from 'theme/theme.js'
// Custom components
import MainPanel from '../components/Layout/MainPanel'
import PanelContainer from '../components/Layout/PanelContainer'
import PanelContent from '../components/Layout/PanelContent'

import { useLocation } from 'react-router-dom'
import GlobalContext from 'context/GlobalContext'

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

export default function Dashboard(props) {
  const { minimize } = useContext(GlobalContext)

  const authToken = Cookies.get('authToken')

  const { ...rest } = props
  const location = useLocation()
  // states and functions
  const [sidebarVariant, setSidebarVariant] = useState('transparent')
  const [fixed, setFixed] = useState(false)
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

  const userName = localStorage.getItem('username')

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
        authorization: authToken ? authToken : ''
      }
    }
  })

  const client = new ApolloClient({
    link: ApolloLink.from([authLink, uploadLink]),
    cache: new InMemoryCache(),
    queryDeduplication: false
  })

  return (
    <ApolloProvider client={client}>
      <ChakraProvider theme={theme} resetCss={false}>
        <Sidebar
          routes={dashRoutes}
          logoText={'Interlynk DASHBOARD'}
          display='none'
          sidebarVariant={sidebarVariant}
          {...rest}
        />
        <MainPanel
          w={{
            base: '100%',
            xl: minimize ? 'calc(100% - 105px)' : 'calc(100% - 220px)'
          }}
        >
          <Portal>
            <AdminNavbar
              onOpen={onOpen}
              logoText={'Interlynk DASHBOARD'}
              brandText={getActiveRoute(dashRoutes)}
              secondary={getActiveNavbar(dashRoutes)}
              fixed={fixed}
              {...rest}
            />
          </Portal>
          {getRoute() && (
            <PanelContent>
              <PanelContainer>
                <Switch>
                  {userName && getRoutes(dashRoutes)}
                  {userName ? (
                    <Redirect from='/vendor' to='/vendor/dashboard' />
                  ) : (
                    <Redirect from='/vendor' to='/auth' />
                  )}
                </Switch>
              </PanelContainer>
            </PanelContent>
          )}
          <Footer />
        </MainPanel>
      </ChakraProvider>
    </ApolloProvider>
  )
}
