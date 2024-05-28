import React, { useEffect } from 'react'
import { loadHubSpotScript } from 'utils/hubspotUtils'

const ChatbotPreview = () => {
  const { hostname } = window.location

  useEffect(() => {
    const cleanup = loadHubSpotScript(hostname)
    return cleanup
  }, [hostname])

  if (hostname === 'app.interlynk.io') {
    return <div id='hs-script-loader' />
  }

  return null
}

export default ChatbotPreview
