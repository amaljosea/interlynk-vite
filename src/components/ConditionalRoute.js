import React from 'react'
import { useNavigate } from 'react-router-dom'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'

const ConditionalRoute = ({ element: Element, ...rest }) => {
  const { isFreeTier } = useGlobalQueryContext()
  const navigate = useNavigate()

  // If isFreeTier is true, render nothing
  if (isFreeTier) {
    navigate(-1)
    return null
  }

  // Otherwise, render the Element component
  return <Element {...rest} />
}

export default ConditionalRoute
