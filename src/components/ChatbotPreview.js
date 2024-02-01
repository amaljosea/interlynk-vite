import React, { useEffect } from 'react'
import { loadHubSpotScript } from 'utils/hubspotUtils'

const ChatbotPreview = ({ env }) => {
  useEffect(() => {
    const cleanup = loadHubSpotScript(env)
    return cleanup
  }, [env])

  if (env !== 'production') {
    return null
  }

  return <div id='hs-script-loader' />
}

export default ChatbotPreview
