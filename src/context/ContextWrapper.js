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
  const [prodField, setProdField] = useState('PROJECTS_UPDATED_AT')
  const [prodDirection, setProdDirection] = useState('DESC')
  const [prodLogField, setProdLogField] = useState('ACTIVITY_LOGS_CREATED_AT')
  const [prodLogDirection, setProdLogDirection] = useState('DESC')
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
  const [comPageIndex, setComPageIndex] = useState(1)
  const [currentProduct, setCurrentProduct] = useState(null)

  // PRODUCT FILTERS
  const [prodSearchInput, setProdSearchInput] = useState('')

  // COMPONENT FILTER STATES
  const [compSearchInput, setCompSearchInput] = useState('')
  const [compEcosystem, setCompEcosystem] = useState([])
  const [compType, setCompType] = useState([])
  const [compLicense, setCompLicense] = useState([])
  const [compSupplier, setCompSupplier] = useState([])
  const [compScope, setCompScope] = useState('')

  // VULN FILTER
  const [vulnSearchInput, setVulnSearchInput] = useState('')
  const [vulnSeverity, setVulnSeverity] = useState([])
  const [vulnComponent, setVulnComponent] = useState([])
  const [vulnStatus, setVulnStatus] = useState([])
  const [vulnKev, setVulnKev] = useState('')
  const [vulnEpss, setVulnEpss] = useState('')
  const [minVal, setMinVal] = useState(0)
  const [maxVal, setMaxVal] = useState(10000)

  // SIGNED VULN FILTER
  const [signedVulnSearchInput, setSignedVulnSearchInput] = useState('')
  const [signedVulnSeverity, setSignedVulnSeverity] = useState([])
  const [signedVulnComponent, setSignedVulnComponent] = useState([])
  const [signedVulnStatus, setSignedVulnStatus] = useState([])
  const [signedVulnKev, setSignedVulnKev] = useState('')
  const [signedVulnEpss, setSignedVulnEpss] = useState('')
  const [signedMinVal, setSignedMinVal] = useState(0)
  const [signedMaxVal, setSignedMaxVal] = useState(0)

  // HEALTH CHECK FILTER
  const [checkSearchInput, setCheckSearchInput] = useState('')
  const [checkCategory, setCheckCategory] = useState([])
  const [checkSeverity, setCheckSeverity] = useState([])
  const [checkStatus, setCheckStatus] = useState([])

  // IMPORT DATA
  const [mergeData, setMergeData] = useState([])
  const [currentSbom, setCurrentSbom] = useState([])
  const [importSbom, setImportSbom] = useState([])
  const [selectedVulns, setSelectedVulns] = useState([])

  const [compAfter, setCompAfter] = useState('')
  const [compBefore, setCompBefore] = useState('')
  const [checkAfter, setCheckAfter] = useState('')
  const [checkBefore, setCheckBefore] = useState('')

  const [cpeString, setCpeString] = useState('')
  const [purlString, setPurlString] = useState('')

  // LICENSE TYPES
  const [spdxList, setSpdxList] = useState([])
  const [expList, setExpList] = useState([])
  const [customList, setCustomList] = useState([])

  const [licenseType, setLicenseType] = useState('license_spdx')
  const [spdxLicense, setSpdxLicense] = useState([])
  const [licenseExp, setLicenseExp] = useState([])
  const [customLicense, setCustomLicense] = useState([])

  return (
    <GlobalContext.Provider
      value={{
        vulnerabilitiesData,
        setVulnerabilitiesData,
        totalProducts,
        setTotalProducts,
        prodSearchInput,
        setProdSearchInput,
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
        // COMP FILTER DATA
        compSearchInput,
        setCompSearchInput,
        compEcosystem,
        setCompEcosystem,
        compType,
        setCompType,
        compLicense,
        setCompLicense,
        compSupplier,
        setCompSupplier,
        compScope,
        setCompScope,
        // VULNS FILTER DATA
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
        setSignedMaxVal,
        mergeData,
        setMergeData,
        currentSbom,
        setCurrentSbom,
        importSbom,
        setImportSbom,
        comPageIndex,
        setComPageIndex,
        currentProduct,
        setCurrentProduct,
        prodField,
        setProdField,
        prodDirection,
        setProdDirection,
        prodLogField,
        setProdLogField,
        prodLogDirection,
        setProdLogDirection,
        selectedVulns,
        setSelectedVulns,
        compAfter,
        setCompAfter,
        compBefore,
        setCompBefore,
        checkSearchInput,
        setCheckSearchInput,
        checkCategory,
        setCheckCategory,
        checkSeverity,
        setCheckSeverity,
        checkStatus,
        setCheckStatus,
        checkAfter,
        setCheckAfter,
        checkBefore,
        setCheckBefore,
        cpeString,
        setCpeString,
        purlString,
        setPurlString,
        spdxList,
        setSpdxList,
        expList,
        setExpList,
        customList,
        setCustomList,
        spdxLicense,
        setSpdxLicense,
        licenseExp,
        setLicenseExp,
        customLicense,
        setCustomLicense,
        licenseType,
        setLicenseType
      }}
    >
      {props.children}
    </GlobalContext.Provider>
  )
}

export default ContextWrapper
