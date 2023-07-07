// Chakra imports
import { ChakraProvider, Portal, useDisclosure } from '@chakra-ui/react'
import Configurator from 'components/Configurator/Configurator'
import Footer from 'components/Footer/Footer.js'
// Layout components
import AdminNavbar from 'components/Navbars/AdminNavbar.js'
import Sidebar from 'components/Sidebar'
import React, { useContext, useState } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import routes from 'routes.js'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
// Custom Chakra theme
import theme from 'theme/theme.js'
import FixedPlugin from '../components/FixedPlugin/FixedPlugin'
// Custom components
import MainPanel from '../components/Layout/MainPanel'
import PanelContainer from '../components/Layout/PanelContainer'
import PanelContent from '../components/Layout/PanelContent'

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import GlobalContext from 'context/GlobalContext'

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import Cookies from 'js-cookie'

export default function Dashboard(props) {
  const { setCustomerView, minimize, token } = useContext(GlobalContext)

  const authToken = Cookies.get('authToken')

  const { ...rest } = props
  const location = useLocation()
  // states and functions
  const [sidebarVariant, setSidebarVariant] = useState('transparent')
  const [fixed, setFixed] = useState(false)
  // functions for changing the states from components
  const getRoute = () => {
    return window.location.pathname !== '/admin/full-screen-maps'
  }
  const getActiveRoute = (routes) => {
    let activeRoute = 'Default Brand Text'
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].collapse) {
        let collapseActiveRoute = getActiveRoute(routes[i].views)
        if (collapseActiveRoute !== activeRoute) {
          return collapseActiveRoute
        }
      } else if (routes[i].category) {
        let categoryActiveRoute = getActiveRoute(routes[i].views)
        if (categoryActiveRoute !== activeRoute) {
          return categoryActiveRoute
        }
      } else {
        if (
          window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
        ) {
          return routes[i].name
        }
      }
    }
    return activeRoute
  }
  // This changes navbar state(fixed or not)
  const getActiveNavbar = (routes) => {
    let activeNavbar = false
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].category) {
        let categoryActiveNavbar = getActiveNavbar(routes[i].views)
        if (categoryActiveNavbar !== activeNavbar) {
          return categoryActiveNavbar
        }
      } else {
        if (
          window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
        ) {
          if (routes[i].secondaryNavbar) {
            return routes[i].secondaryNavbar
          }
        }
      }
    }
    return activeNavbar
  }
  const getRoutes = (routes) => {
    const route = routes.map((prop, key) => {
      // console.log('getting routes')
      if (prop.collapse) {
        // console.log('getting routes collapse')
        return getRoutes(prop.views)
      }
      if (prop.category === 'account') {
        // console.log('getting account')
        return getRoutes(prop.views)
      }
      if (prop.layout === '/admin') {
        // console.log('getting admin', prop)
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

  useEffect(() => {
    setCustomerView(location.pathname)
    // console.log(location.pathname)
  }, [location])

  const httpLink = createHttpLink({
    uri: 'http://localhost:3000/lynkapi'
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
    link: authLink.concat(httpLink),
    cache: new InMemoryCache()
  })

  return (
    <ApolloProvider client={client}>
      <ChakraProvider theme={theme} resetCss={false}>
        <Sidebar
          routes={routes}
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
              brandText={getActiveRoute(routes)}
              secondary={getActiveNavbar(routes)}
              fixed={fixed}
              {...rest}
            />
          </Portal>
          {getRoute() && (
            <PanelContent>
              <PanelContainer>
                <Switch>
                  {getRoutes(routes)}
                  <Redirect from='/admin' to='/admin/dashboard' />
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
