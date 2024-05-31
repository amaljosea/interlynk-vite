import { useParams } from 'react-router-dom'

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

  return (
    <GlobalQueryContext.Provider
      value={{
        sbomHookData
      }}
    >
      {children}
    </GlobalQueryContext.Provider>
  )
}
