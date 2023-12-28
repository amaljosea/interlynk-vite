import React from 'react'
import ReactDOM from 'react-dom'
import * as Sentry from '@sentry/react'
import TagManager from 'react-gtm-module'
import {
  BrowserRouter,
  Route,
  Redirect,
  Routes,
  Navigate
} from 'react-router-dom'
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
import ProductList from 'views/Dashboard/Products/ProductList'
import ProductDetails from 'views/Dashboard/Products/ProductDetails'
import Vulnerabilities from 'views/Dashboard/Vulnerabilities'
import Licenses from 'views/Dashboard/Linceses'
import Profile from 'views/Dashboard/Profile'
import Success from 'layouts/Success'
import Cookies from 'js-cookie'
import theme from 'theme/theme.js'

const authToken = Cookies.get('authToken')

// Sentry.init({
//   dsn: 'https://a54aeaf934a655793d8b33ac62b1db8d@o4505997805682688.ingest.sentry.io/4505997807976448',
//   integrations: [
//     new Sentry.BrowserTracing({
//       // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
//       tracePropagationTargets: [
//         // 'localhost:3001',
//         'https://app.interlynk.io',
//         'https://api.interlynk.io/login',
//         'https://api.interlynk.io/lynkapi'
//       ]
//     }),
//     new Sentry.Replay()
//   ],
//   // Performance Monitoring
//   tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
//   // Session Replay
//   replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
//   replaysOnErrorSampleRate: 1.0 // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
// })

// const tagManagerArgs = {
//   gtmId: 'G-VDPMCV382D'
// }

// TagManager.initialize(tagManagerArgs)

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <GlobalStateProvider>
        <ChakraProvider theme={theme} resetCSS={true}>
          <ScrollToTop />
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
            <Route path={`register`} element={<Register />} />
            <Route path={`accept-user-invitation`} element={<Success />} />
            <Route path={`vendor`} element={<AdminLayout />}>
              <Route
                path=''
                element={
                  location.pathname === '/vendor' ? (
                    <Navigate replace to='/vendor/dashboard' />
                  ) : (
                    <Navigate replace to={location.pathname} />
                  )
                }
              />
              <Route path={`dashboard`} element={<Dashboard />} />
              <Route path={`products`} element={<Products />}>
                <Route index element={<ProductList />} />
                <Route path={`:name`} element={<ProductDetails />} />
              </Route>
              <Route path={`vulnerabilities`} element={<Vulnerabilities />} />
              <Route path={`licenses`} element={<Licenses />} />
              <Route path={`settings`} element={<Profile />} />
            </Route>
            <Route path={`login`} element={<LoginLayout />} />
            {/* <Route path={`customer`} element={<CustomerLayout />} /> */}
            <Route path={`register`} element={<Register />} />
          </Routes>
        </ChakraProvider>
      </GlobalStateProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
)
