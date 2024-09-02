import { useQuery } from '@apollo/client'
import Cookies from 'js-cookie'
import { createContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import useOrg from 'hooks/useOrg'
import { useSbom } from 'hooks/useSbom'

import { GetOrgName } from 'graphQL/Queries'

export const GlobalQueryContext = createContext({
  sbomHookData: null,
  orgLoading: false,
  tier: null
})

export const GlobalQueryContextWrapper = ({ children }) => {
  const params = useParams()
  const authToken = Cookies.get('authToken')
  const sbomHookData = useSbom({
    projectId: params?.productid,
    sbomId: params?.sbomid,
    skip: !params?.sbomid
  })

  const { data, loading } = useOrg()
  const [isFreeTier, setIsFreeTier] = useState(false)

  const { data: orgData, loading: orgQueryLoading } = useQuery(GetOrgName, {
    fetchPolicy: 'network-only',
    skip: authToken ? false : true
  })

  useEffect(() => {
    if (!orgQueryLoading && orgData) {
      setIsFreeTier(orgData.organization?.tier === 'free')
    }
  }, [orgQueryLoading, orgData])

  if (orgQueryLoading) {
    return null
  }

  return (
    <GlobalQueryContext.Provider
      value={{
        sbomHookData,
        orgLoading: loading,
        orgView: data?.organization?.name ? true : false,
        isFreeTier,
        orgQueryLoading
      }}
    >
      {children}
    </GlobalQueryContext.Provider>
  )
}
