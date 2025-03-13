import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import useQueryParam from 'hooks/useQueryParam'

const { createContext, useEffect, useState } = require('react')

export const useProductParts = () => {
  const { generateProductVersionDetailPageUrlFromCurrentUrl } =
    useProductUrlContext()
  const [parts, setParts] = useState([])
  const partsQueryParam = useQueryParam('parts')

  const isParts = partsQueryParam === 'true'

  const { sbomHookData } = useGlobalQueryContext()

  const { versionName, projectGroupName } = sbomHookData

  const pop = () => {
    setParts(parts.slice(0, -1))
  }

  const push = () => {
    const urlArgument = {}

    if (parts.length !== 0) {
      urlArgument.paramsObj = {
        parts: true
      }
    }

    const url = generateProductVersionDetailPageUrlFromCurrentUrl(urlArgument)

    const newPart = {
      versionName,
      projectGroupName,
      url
    }
    setParts([...parts, newPart])
  }

  const goTo = (index) => {
    setParts(parts.slice(0, index))
  }

  useEffect(() => {
    if (!isParts) {
      setParts([])
    }
    // only update when isParts change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isParts])

  return {
    latestPart: parts[parts.length - 1] || null,
    parts,
    pop,
    push,
    goTo,
    isParts
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

  return <PartsContext.Provider value={value}>{children}</PartsContext.Provider>
}
