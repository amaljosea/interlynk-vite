import { useState } from 'react'
import GlobalContext from './GlobalContext'
import { changeLogs } from 'variables/general'

const ContextWrapper = (props) => {
  const [vulnerabilitiesData, setVulnerabilitiesData] = useState([])
  const [minimize, setMinimize] = useState(true)
  const [activeDockerHub, setActiveDockerHub] = useState(true)
  const [userLocation, setUserLocation] = useState(null)
  const [componentsVal, setComponentsVal] = useState('')
  const [riskScoreVal, setRiskScoreVal] = useState('')
  const [isAuthenticate, setIsAuthenticate] = useState(false)
  const [scanEnabled, setScanEnabled] = useState(false)

  const [changelogData, setChangelogData] = useState(changeLogs)

  const [automationRules, setAutomationRules] = useState([
    {
      id: 1,
      active: true,
      selectorOne: 'document',
      conditionOne: '',
      selectorTwo: 'Supplier',
      conditionTwo: 'Missing',
      fixAction: ''
    },
    {
      id: 2,
      active: true,
      selectorOne: 'component',
      conditionOne: 'fizzler.1.2.0.nupkg',
      selectorTwo: 'Package URL (PURL)',
      conditionTwo: 'Missing',
      fixAction: ''
    }
  ])

  const [totalProducts, setTotalProducts] = useState(0)
  const [totalVulns, setTotalVulns] = useState(0)

  const [orgInfo, setOrgInfo] = useState({})
  const [compFilters, setCompFilters] = useState({})
  const [signedCompFilters, setSignedCompFilters] = useState({})
  const [vulnFilters, setVulnFilters] = useState({})
  const [signedVulnFilters, setSignedVulnFilters] = useState({})
  const [checkFilters, setCheckFilters] = useState({})
  const [logFilters, setLogFilters] = useState({})

  // SORT ORDER AND DIRECTIONS
  const [compField, setCompField] = useState('COMPONENTS_UPDATED_AT')
  const [compDirection, setCompDirection] = useState('DESC')
  const [signedCompField, setSignedCompField] = useState(
    'COMPONENTS_UPDATED_AT'
  )
  const [signedCompDirection, setSignedCompDirection] = useState('DESC')
  const [vulnField, setVulnField] = useState('COMPONENT_VULNS_UPDATED_AT')
  const [vulnDirection, setVulnDirection] = useState('DESC')
  const [signedVulnField, setSignedVulnField] = useState(
    'COMPONENT_VULNS_UPDATED_AT'
  )
  const [signedVulnDirection, setSignedVulnDirection] = useState('DESC')
  const [checkField, setCheckField] = useState('CHECK_RESULTS_UPDATED_AT')
  const [checkDirection, setCheckDirection] = useState('DESC')
  const [logField, setLogField] = useState('ACTIVITY_LOGS_CREATED_AT')
  const [logDirection, setLogDirection] = useState('DESC')
  const [activeProdTab, setActiveProdTab] = useState(0)
  const [signedActiveTab, setSignedActiveTab] = useState(0)
  const [totalRows, setTotalRows] = useState(25)

  // VULN FILTER
  const [vulnSearchInput, setVulnSearchInput] = useState('')
  const [vulnSeverity, setVulnSeverity] = useState([])
  const [vulnComponent, setVulnComponent] = useState([])
  const [vulnStatus, setVulnStatus] = useState([])
  const [vulnKev, setVulnKev] = useState('')
  const [vulnEpss, setVulnEpss] = useState('')
  const [minVal, setMinVal] = useState()
  const [maxVal, setMaxVal] = useState()

  // SIGNED VULN FILTER
  const [signedVulnSearchInput, setSignedVulnSearchInput] = useState('')
  const [signedVulnSeverity, setSignedVulnSeverity] = useState([])
  const [signedVulnComponent, setSignedVulnComponent] = useState([])
  const [signedVulnStatus, setSignedVulnStatus] = useState([])
  const [signedVulnKev, setSignedVulnKev] = useState('')
  const [signedVulnEpss, setSignedVulnEpss] = useState('')
  const [signedMinVal, setSignedMinVal] = useState()
  const [signedMaxVal, setSignedMaxVal] = useState()

  return (
    <GlobalContext.Provider
      value={{
        vulnerabilitiesData,
        setVulnerabilitiesData,
        totalProducts,
        setTotalProducts,
        totalVulns,
        setTotalVulns,
        minimize,
        setMinimize,
        activeDockerHub,
        setActiveDockerHub,
        userLocation,
        setUserLocation,
        componentsVal,
        setComponentsVal,
        riskScoreVal,
        setRiskScoreVal,
        isAuthenticate,
        setIsAuthenticate,
        scanEnabled,
        setScanEnabled,
        changelogData,
        setChangelogData,
        automationRules,
        setAutomationRules,
        orgInfo,
        setOrgInfo,
        compFilters,
        setCompFilters,
        vulnFilters,
        setVulnFilters,
        checkFilters,
        setCheckFilters,
        logFilters,
        setLogFilters,
        compField,
        setCompField,
        compDirection,
        setCompDirection,
        vulnField,
        setVulnField,
        vulnDirection,
        setVulnDirection,
        checkField,
        setCheckField,
        checkDirection,
        setCheckDirection,
        logField,
        setLogField,
        logDirection,
        setLogDirection,
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
        activeProdTab,
        setActiveProdTab,
        signedActiveTab,
        setSignedActiveTab,
        totalRows,
        setTotalRows,
        vulnSearchInput,
        setVulnSearchInput,
        vulnSeverity,
        setVulnSeverity,
        vulnComponent,
        setVulnComponent,
        vulnStatus,
        setVulnStatus,
        vulnKev,
        setVulnKev,
        vulnEpss,
        setVulnEpss,
        minVal,
        setMinVal,
        maxVal,
        setMaxVal,
        // SIGNED VULN FILTER DATA
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
