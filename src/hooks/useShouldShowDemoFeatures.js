import { useQuery } from '@apollo/client'
import { useLocation } from 'react-router-dom'

import { GetOrgName } from 'graphQL/Queries'

const IS_DEMO_ENABLED = true
const DEMO_ORG_NAME = 'Interlynk - Demo'

export const useShouldShowDemoFeatures = () => {
  const location = useLocation()
  const customerView = location.pathname.startsWith('/customer')
  const { data: orgData, loading } = useQuery(GetOrgName, {
    fetchPolicy: 'network-only',
    skip: customerView
  })

  // console.log({ orgData, skip })
  const { organization } = orgData || ''
  const shouldShowDemoFeatures =
    IS_DEMO_ENABLED && organization?.name === DEMO_ORG_NAME

  // console.log({ shouldShowDemoFeatures })
  return {
    loading,
    shouldShowDemoFeatures
  }
}
