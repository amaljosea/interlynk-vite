// Chakra imports
import { ChakraProvider, Portal, useDisclosure } from '@chakra-ui/react'
import Footer from 'components/Footer/Footer.js'
// Layout components
import AdminNavbar from 'components/Navbars/AdminNavbar.js'
import Sidebar from 'components/Sidebar'
import React, { useContext, useState, useEffect } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
// Custom Chakra theme
import theme from 'theme/theme.js'
// Custom components
import MainPanel from '../components/Layout/MainPanel'
import PanelContainer from '../components/Layout/PanelContainer'
import PanelContent from '../components/Layout/PanelContent'
import GlobalContext from 'context/GlobalContext'
import customerRoutes from 'customerRoutes'
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import Cookies from 'js-cookie'
import { getActiveNavbar, getActiveRoute } from '../utils'

export default function Customer(props) {
  const { ...rest } = props
  const { minimize } = useContext(GlobalContext)
  // states and functions
  const [sidebarVariant, setSidebarVariant] = useState('transparent')
  const [fixed, setFixed] = useState(false)
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
  const { isOpen, onOpen, onClose } = useDisclosure()
  document.documentElement.dir = 'ltr'
  // Chakra Color Mode

  const userToken = Cookies.get('userToken')

  const graphqlAPI = process.env.REACT_APP_GRAPHQL_API

  const httpLink = createHttpLink({
    uri: `${graphqlAPI}`
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
    link: authLink.concat(httpLink),
    cache: new InMemoryCache()
  })

  return (
    <ApolloProvider client={client}>
      <ChakraProvider theme={theme} resetCss={false}>
        <Sidebar
          routes={customerRoutes}
          logoText={'Interlynk DASHBOARD'}
          display='none'
          sidebarVariant={sidebarVariant}
          {...rest}
        />
        <MainPanel
          w={{
            base: '100%',
            xl: minimize ? 'calc(100% - 110px)' : 'calc(100% - 220px)'
          }}
        >
          <Portal>
            <AdminNavbar
              onOpen={onOpen}
              logoText={'Interlynk DASHBOARD'}
              brandText={getActiveRoute(customerRoutes)}
              secondary={getActiveNavbar(customerRoutes)}
              fixed={fixed}
              {...rest}
            />
          </Portal>
          {getRoute() ? (
            <PanelContent>
              <PanelContainer>
                <Switch>
                  {getRoutes(customerRoutes)}
                  {/* <Redirect from={`/customer`} to='/customer' /> */}
                </Switch>
              </PanelContainer>
            </PanelContent>
          ) : null}
          <Footer />
        </MainPanel>
      </ChakraProvider>
    </ApolloProvider>
  )
}
