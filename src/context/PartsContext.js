import { useLocation, useParams } from 'react-router-dom'
import createPersistedState from 'use-persisted-state'
import { getProductVersionDetailPageUrl } from 'utils/url'

import { useSbom } from 'hooks/useSbom'

const usePartsState = createPersistedState('parts')
const { createContext, useEffect } = require('react')

export const useProductParts = () => {
  const [parts, setParts] = usePartsState([])
  const params = useParams()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const { versionName, projectGroupName } = useSbom({
    projectId: params?.productid,
    sbomId: params?.sbomid
  })

  const partsQueryParam = queryParams.get('parts')

  const pop = () => {
    setParts(parts.slice(0, -1))
  }

  const push = () => {
    setParts([
      ...parts,
      {
        versionName,
        projectGroupName,
        url: getProductVersionDetailPageUrl({
          productgroupid: params.productgroupid,
          productid: params.productid,
          sbomid: params.sbomid,
          paramsObj: {
            parts: true
          }
        })
      }
    ])
  }

  const goTo = (index) => {
    setParts(parts.slice(0, index))
  }

  useEffect(() => {
    if (!partsQueryParam) {
      setParts([])
    }
    // only update when partsQueryParam change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partsQueryParam])

  return {
    latestPart: parts[parts.length - 1] || null,
    parts,
    pop,
    push,
    goTo
  }
}

export const PartsContext = createContext({
  latestPart: null,
  parts: [],
  pop: () => {},
  push: () => {}
})

export const PartsContextWrapper = ({ children }) => {
  const value = useProductParts()

  console.log('PartsContext:', value)

  return <PartsContext.Provider value={value}>{children}</PartsContext.Provider>
}
