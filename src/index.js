import * as Sentry from '@sentry/react'
import { MainRoutes } from 'MainRoutes.js'
import { ApolloWrapper } from 'context/ApolloWrapper.js'
import React from 'react'
import ReactDOM from 'react-dom'
import ReactGA from 'react-ga'
import TagManager from 'react-gtm-module'
import { BrowserRouter } from 'react-router-dom'
import theme from 'theme/theme.js'

import { ChakraProvider } from '@chakra-ui/react'

import ChatbotPreview from 'components/ChatbotPreview'
import ScrollToTop from 'components/ScrollToTop.js'

import { GlobalStateProvider } from 'hooks/useGlobalState'

import './main.css'

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
            <MainRoutes />
          </ApolloWrapper>
        </ChakraProvider>
      </GlobalStateProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
)
