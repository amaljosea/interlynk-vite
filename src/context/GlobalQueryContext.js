import { createContext } from 'react'
import { useParams } from 'react-router-dom'

import { useGlobalState } from 'hooks/useGlobalState'
import { useSbom } from 'hooks/useSbom'

export const GlobalQueryContext = createContext({
  sbomHookData: null,
  orgView: false,
  isFreeTier: null
})

export const GlobalQueryContextWrapper = ({ children }) => {
  const params = useParams()
  const { organization } = useGlobalState()
  const sbomHookData = useSbom({
    projectId: params?.productid,
    sbomId: params?.sbomid,
    skip: !params?.sbomid
  })

  return (
    <GlobalQueryContext.Provider
      value={{
        sbomHookData,
        orgView: organization ? true : false,
        isFreeTier: organization?.tier === 'free'
      }}
    >
      {children}
    </GlobalQueryContext.Provider>
  )
}
