import { useParams } from 'react-router-dom'

import useOrg from 'hooks/useOrg'
import { useSbom } from 'hooks/useSbom'

const { createContext } = require('react')

export const GlobalQueryContext = createContext({
  sbomHookData: null
})

export const GlobalQueryContextWrapper = ({ children }) => {
  const params = useParams()
  const sbomHookData = useSbom({
    projectId: params?.productid,
    sbomId: params?.sbomid,
    skip: !params?.sbomid
  })

  const { data, loading } = useOrg()

  return (
    <GlobalQueryContext.Provider
      value={{
        sbomHookData,
        orgView: data?.organization ? true : false,
        orgLoading: loading
      }}
    >
      {children}
    </GlobalQueryContext.Provider>
  )
}
