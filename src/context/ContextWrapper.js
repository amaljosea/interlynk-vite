import { useState } from 'react'

import GlobalContext from './GlobalContext'

const ContextWrapper = (props) => {
  const [signedCompFilters, setSignedCompFilters] = useState({})
  const [signedVulnFilters, setSignedVulnFilters] = useState({})

  const [signedCompField, setSignedCompField] = useState(
    'COMPONENTS_UPDATED_AT'
  )
  const [signedCompDirection, setSignedCompDirection] = useState('DESC')
  const [signedVulnField, setSignedVulnField] = useState(
    'COMPONENT_VULNS_UPDATED_AT'
  )
  const [signedVulnDirection, setSignedVulnDirection] = useState('DESC')
  const [signedActiveTab, setSignedActiveTab] = useState(0)

  // SIGNED VULN FILTER
  const [signedVulnSearchInput, setSignedVulnSearchInput] = useState('')
  const [signedVulnSeverity, setSignedVulnSeverity] = useState([])
  const [signedVulnComponent, setSignedVulnComponent] = useState([])
  const [signedVulnStatus, setSignedVulnStatus] = useState([])
  const [signedVulnKev, setSignedVulnKev] = useState('')
  const [signedVulnEpss, setSignedVulnEpss] = useState('')
  const [signedMinVal, setSignedMinVal] = useState(0)
  const [signedMaxVal, setSignedMaxVal] = useState(0)

  return (
    <GlobalContext.Provider
      value={{
        signedCompFilters,
        setSignedCompFilters,
        signedVulnFilters,
        setSignedVulnFilters,
        signedCompField,
        setSignedCompField,
        signedCompDirection,
        setSignedCompDirection,
        signedVulnField,
        setSignedVulnField,
        signedVulnDirection,
        setSignedVulnDirection,
        signedActiveTab,
        setSignedActiveTab,
        signedVulnSearchInput,
        setSignedVulnSearchInput,
        signedVulnSeverity,
        setSignedVulnSeverity,
        signedVulnComponent,
        setSignedVulnComponent,
        signedVulnStatus,
        setSignedVulnStatus,
        signedVulnKev,
        setSignedVulnKev,
        signedVulnEpss,
        setSignedVulnEpss,
        signedMinVal,
        setSignedMinVal,
        signedMaxVal,
        setSignedMaxVal
      }}
    >
      {props.children}
    </GlobalContext.Provider>
  )
}

export default ContextWrapper
