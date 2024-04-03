import React from 'react'
import ReactDOM from 'react-dom'
import ReactGA from 'react-ga'
import * as Sentry from '@sentry/react'
import TagManager from 'react-gtm-module'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import './main.css'

// import SBOMLayout from './layouts/SBOM.js'
import AuthLayout from './layouts/Auth.js'
import AdminLayout from './layouts/Admin.js'
import CustomerLayout from './layouts/Customer.js'
import Register from './layouts/Register.js'
import LoginLayout from './layouts/Login.js'
import ScrollToTop from 'components/ScrollToTop.js'
import { ChakraProvider } from '@chakra-ui/react'
import Dashboard from 'views/Dashboard/Dashboard'
import Products from 'views/Dashboard/Products'
import { GlobalStateProvider } from 'hooks/useGlobalState'
import ChatbotPreview from 'components/ChatbotPreview'
import ProductList from 'views/Dashboard/Products/ProductList'
import ProductDetails from 'views/Dashboard/Products/ProductDetails'
import Vulnerabilities from 'views/Dashboard/Vulnerabilities'
import Licenses from 'components/Licenses'
import Profile from 'views/Dashboard/Profile'
import Success from 'layouts/Success'
import Cookies from 'js-cookie'
import theme from 'theme/theme.js'

import PubProducts from 'views/Customer/Products'
import PubProductList from 'views/Customer/Products/ProductList'
import PubProductDetails from 'views/Customer/Products/ProductDetails'
import Support from 'views/Dashboard/Support'
import Tools from 'views/Dashboard/Tools'
import Reset from 'layouts/Reset'
import Sag from 'views/Dashboard/SAG'
import Policies from 'views/Dashboard/Policies'


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
          <Routes>
            <Route
              path=''
              element={authToken ? <Navigate replace to='/vendor/dashboard' /> : <Navigate replace to='/auth' />}
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
                <Route path={`:name`} element={<ProductDetails />} />
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
                <Route path={`:name`} element={<PubProductDetails />} />
              </Route>
            </Route>
            <Route path={`register`} element={<Register />} />
          </Routes>
        </ChakraProvider>
      </GlobalStateProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
)
