import * as Sentry from '@sentry/react'
import { ApolloWrapper } from 'context/ApolloWrapper.js'
import Cookies from 'js-cookie'
import Reset from 'layouts/Reset'
import Success from 'layouts/Success'
import React from 'react'
import ReactDOM from 'react-dom'
import ReactGA from 'react-ga'
import TagManager from 'react-gtm-module'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import theme from 'theme/theme.js'
import PubProducts from 'views/Customer/Products'
import PubProductDetails from 'views/Customer/Products/ProductDetails'
import PubProductList from 'views/Customer/Products/ProductList'
import Dashboard from 'views/Dashboard/Dashboard'
import Policies from 'views/Dashboard/Policies'
import Products from 'views/Dashboard/Products'
import ProductDetailsMain from 'views/Dashboard/Products/ProductDetailsMain.js'
import ProductDetailsSbom from 'views/Dashboard/Products/ProductDetailsSbom.js'
import ProductDetailsVul from 'views/Dashboard/Products/ProductDetailsVul.js'
import ProductList from 'views/Dashboard/Products/ProductList'
import Profile from 'views/Dashboard/Profile'
import Support from 'views/Dashboard/Support'
import Tools from 'views/Dashboard/Tools'
import Vulnerabilities from 'views/Dashboard/Vulnerabilities'

import { ChakraProvider } from '@chakra-ui/react'

import ChatbotPreview from 'components/ChatbotPreview'
import Licenses from 'components/Licenses'
import ScrollToTop from 'components/ScrollToTop.js'

import { GlobalStateProvider } from 'hooks/useGlobalState'

import AdminLayout from './layouts/Admin.js'
// import SBOMLayout from './layouts/SBOM.js'
import AuthLayout from './layouts/Auth.js'
import CustomerLayout from './layouts/Customer.js'
import LoginLayout from './layouts/Login.js'
import Register from './layouts/Register.js'
import './main.css'

const authToken = Cookies.get('authToken')
const env = process.env.NODE_ENV

const TRACKING_ID = '411749268'
const tagManagerArgs = { gtmId: 'G-VDPMCV382D' }
env === 'production' && ReactGA.initialize(TRACKING_ID)
env === 'production' && TagManager.initialize(tagManagerArgs)

Sentry.init({
  dsn: 'https://a54aeaf934a655793d8b33ac62b1db8d@o4505997805682688.ingest.sentry.io/4505997807976448',
  integrations: [
    new Sentry.BrowserTracing({
      // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
      tracePropagationTargets: [
        // 'localhost:3001',
        'https://app.interlynk.io',
        'https://api.interlynk.io/login',
        'https://api.interlynk.io/lynkapi'
      ]
    }),
    new Sentry.Replay()
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0 // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
})

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <GlobalStateProvider>
        <ChakraProvider theme={theme} resetCSS={true}>
          <ChatbotPreview env={env} />
          <ScrollToTop />
          <ApolloWrapper>
            <Routes>
              <Route
                path=''
                element={
                  authToken ? (
                    <Navigate replace to='/vendor/dashboard' />
                  ) : (
                    <Navigate replace to='/auth' />
                  )
                }
              />
              <Route path={`auth`} element={<AuthLayout />} />
              <Route path={`reset_password`} element={<Reset />} />
              <Route path={`register`} element={<Register />} />
              <Route path={`accept-user-invitation`} element={<Success />} />
              <Route path={`confirmation`} element={<Success />} />
              <Route path={`vendor`} element={<AdminLayout />}>
                <Route path={`dashboard`} element={<Dashboard />} />
                <Route path={`products`} element={<Products />}>
                  <Route index element={<ProductList />} />
                  <Route
                    exact
                    path=':productgroupid/env/:productid'
                    Component={ProductDetailsMain}
                  />
                  <Route
                    exact
                    path=':productgroupid/env/:productid/version/:sbomid'
                    Component={ProductDetailsSbom}
                  />
                  <Route
                    exact
                    path=':productgroupid/env/:productid/vulnerability/:vulnerabilityid'
                    Component={ProductDetailsVul}
                  />
                </Route>
                {/* <Route path={`SAG`} element={<Sag />} /> */}
                <Route path={`vulnerabilities`} element={<Vulnerabilities />} />
                <Route path={`licenses`} element={<Licenses />} />
                <Route path={`tools`} element={<Tools />} />
                <Route path={`support`} element={<Support />} />
                <Route path={`policies`} element={<Policies />} />
                <Route path={`settings`} element={<Profile />} />
              </Route>
              <Route path={`login`} element={<LoginLayout />} />
              <Route path={`customer`} element={<CustomerLayout />}>
                <Route path={`products`} element={<PubProducts />}>
                  <Route index element={<PubProductList />} />
                  <Route
                    exact
                    path=':productgroupid/env/:productid'
                    element={<PubProductDetails />}
                  />
                  <Route
                    exact
                    path=':productgroupid/env/:productid/version/:sbomid'
                    element={<PubProductDetails />}
                  />
                  <Route
                    exact
                    path=':productgroupid/env/:productid/vulnerability/:vulnerabilityid'
                    element={<PubProductDetails />}
                  />
                </Route>
              </Route>
              <Route path={`register`} element={<Register />} />
            </Routes>
          </ApolloWrapper>
        </ChakraProvider>
      </GlobalStateProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
)
