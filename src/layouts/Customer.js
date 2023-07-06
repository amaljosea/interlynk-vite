// Chakra imports
import { ChakraProvider, Portal, useDisclosure } from '@chakra-ui/react'
import Footer from 'components/Footer/Footer.js'
// Layout components
import AdminNavbar from 'components/Navbars/AdminNavbar.js'
import Sidebar from 'components/Sidebar'
import React, { useContext, useState } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
// Custom Chakra theme
import theme from 'theme/theme.js'
// Custom components
import MainPanel from '../components/Layout/MainPanel'
import PanelContainer from '../components/Layout/PanelContainer'
import PanelContent from '../components/Layout/PanelContent'

import { useLocation } from 'react-router-dom'
import GlobalContext from 'context/GlobalContext'
import customerRoutes from 'customerRoutes'

export default function Customer(props) {
  const { ...rest } = props
  const { minimize } = useContext(GlobalContext)
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

  return (
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
                <Redirect from='/customer' to='/customer/sboms/' />
              </Switch>
            </PanelContainer>
          </PanelContent>
        ) : null}
        <Footer />
      </MainPanel>
    </ChakraProvider>
  )
}
