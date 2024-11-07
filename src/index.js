import * as Sentry from '@sentry/react'
import { MainRoutes } from 'MainRoutes.js'
import { ApolloWrapper } from 'context/ApolloWrapper.js'
import React from 'react'
import ReactDOM from 'react-dom'
import ReactGA from 'react-ga4'
import { BrowserRouter } from 'react-router-dom'
import theme, { config } from 'theme/theme.js'

import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'

import ChatbotPreview from 'components/ChatbotPreview'
import ScrollToTop from 'components/ScrollToTop.js'

import { GlobalStateProvider } from 'hooks/useGlobalState'

import './main.css'

const { hostname } = window.location

// const TRACKING_ID = '411749268'
hostname === 'app.interlynk.io' && ReactGA.initialize('G-VDPMCV382D')

Sentry.init({
  environment: window.location.hostname,
  dsn: 'https://e40ec0eba58f05f311d64e966f4b6f5b@o4507255029891072.ingest.us.sentry.io/4507255031857152',
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration()
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0 // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
})

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <GlobalStateProvider>
        <ChakraProvider theme={theme} resetCSS={true}>
          <ColorModeScript initialColorMode={config?.initialColorMode} />
          <ChatbotPreview />
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
