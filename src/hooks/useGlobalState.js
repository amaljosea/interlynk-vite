import React, { useState, createContext, useContext, useReducer } from 'react'
import { globalVulnReducer, compVulnReducer, prodRulesReducer, prodCheckReducer, prodCompReducer, prodLogReducer, prodVulnReducer, sbomLogReducer, prodReducer, sbomReducer, versionReducer, toolsReducer, supportReducer, policyReducer } from 'context/reducers'

const GlobalStateContext = createContext()

const GlobalStateProvider = ({ children }) => {
  const env = localStorage.getItem('environment')

  const [userPermissions, setUserPermissions] = useState([])
  const [userName, setUserName] = useState('')
  const [totalRows, setTotalRows] = useState(25)
  const [activeProdTab, setActiveProdTab] = useState(0)
  const [activeCsProdTab, setActiveCsProdTab] = useState(0)
  const [activeSbomTab, setActiveSbomTab] = useState(0)
  const [activeCsSbomTab, setActiveCsSbomTab] = useState(0)
  const [activeDockerHub, setActiveDockerHub] = useState(true)
  const [vulnerabilitiesData, setVulnerabilitiesData] = useState([])
  const [scanEnabled, setScanEnabled] = useState(false)
  const [envName, setEnvName] = useState(env || 'default')
  const [clearSelect, setClearSelect] = useState(false)
  const [selectedSbom, setSelectedSbom] = useState([])
  // PRODUCTS
  const [prodState, prodDispatch] = useReducer(prodReducer, {
    data: null,
    field: 'PROJECT_GROUPS_UPDATED_AT',
    direction: 'DESC',
    totalProduct: 0,
    searchInput: '',
    pageIndex: 1,
    enabled: 'yes',
    currentProduct: null
  })
  // SBOM VERSIONS
  const [versionState, versionDispatch] = useReducer(versionReducer, {
    field: 'SBOMS_CREATED_AT',
    direction: 'DESC',
    searchInput: '',
    pageIndex: 1
  })
  // GLOBAL VULNERABILITIES
  const [globalVulnState, globalVulnDispatch] = useReducer(globalVulnReducer, {
    field: 'VULNS_VULN_ID',
    direction: 'DESC',
    after: '',
    before: '',
    searchInput: '',
    severities: [],
    products: [],
    statues: [],
    kev: '',
    epss: '',
    minEpss: 0,
    maxEpss: 0,
    pageIndex: 1
  })
  // SINGLE VULNERABILITIES
  const [compVulnState, compVulnDispatch] = useReducer(compVulnReducer, {
    after: '',
    before: '',
    searchInput: '',
    vexComplete: undefined,
    envs: [],
    versions: [],
    products: [],
    statuses: [],
    pageIndex: 1
  })
  const [prodRulesState, prodRulesDispatch] = useReducer(prodRulesReducer, {
    field: 'AUTO_CHECKS_UPDATED_AT',
    direction: 'DESC',
    pageIndex: 1
  })
  const [prodLogState, prodLogDispatch] = useReducer(prodLogReducer, {
    field: 'ACTIVITY_LOGS_CREATED_AT',
    direction: 'DESC',
    searchInput: '',
    type: [],
    user: [],
    object: [],
    pageIndex: 1
  })
  const [prodCompState, prodCompDispatch] = useReducer(prodCompReducer, {
    field: 'COMPONENTS_UPDATED_AT',
    direction: 'DESC',
    after: '',
    before: '',
    totalComp: 0,
    searchInput: '',
    pageIndex: 1,
    ecosystems: [],
    kinds: [],
    licenses: [],
    suppliers: [],
    scope: '',
    direct: false,
    filters: null,
    licenseType: 'license_exp',
    spdxLicenses: [],
    spdxList: [],
    customLicenses: [],
    customList: [],
    expLicense: '',
    cpeString: '',
    isCpeValid: true,
    purlString: ''
  })
  const [prodVulnState, prodVulnDispatch] = useReducer(prodVulnReducer, {
    field: 'COMPONENT_VULNS_UPDATED_AT',
    direction: 'DESC',
    after: '',
    before: '',
    totalVuln: 0,
    searchInput: '',
    pageIndex: 1,
    severities: [],
    components: [],
    statues: [],
    source: false,
    kev: '',
    epss: '',
    minEpss: 0,
    maxEpss: 0,
    direct: false,
    filters: null,
    selectedVulns: [],
    importSbom: [],
    mergeData: [],
    currentSbom: [],
    licenseString: [],
    vexComplete: undefined,
    statusTitle:'',
    statusName:'',
    justification: '',
    justifyName:'',
    selectedTag:'',
    actionStatement:'',
    response:'',
    responseTitle:'',
    details:'',
    notes:'',
    impactData:'',
    upstream:false
  })
  const [prodCheckState, prodCheckDispatch] = useReducer(prodCheckReducer, {
    field: 'CHECK_RESULTS_UPDATED_AT',
    direction: 'DESC',
    after: '',
    before: '',
    searchInput: '',
    pageIndex: 1,
    rules: [],
    categories: [],
    severities: [],
    statues: [],
    filters: null
  })
  const [sbomState, sbomDispatch] = useReducer(sbomReducer, {
    licenseType: 'license_exp',
    spdxLicenses: [],
    spdxList: [],
    customLicenses: [],
    customList: [],
    expLicense: '',
    licenseString: []
  })
  const [sbomLogState, sbomLogDispatch] = useReducer(sbomLogReducer, {
    field: 'ACTIVITY_LOGS_CREATED_AT',
    direction: 'DESC',
    after: '',
    before: '',
    searchInput: '',
    pageIndex: 1,
    users: [],
    objects: [],
    types: [],
    filters: null
  })
   // SBOM VERSIONS
   const [supportState, supportDispatch] = useReducer(supportReducer, {
    pageIndex: 1,
    searchInput: '',
    after:'',
    before: '',
    field: 'COMPONENT_SUPPORT_OVERRIDES_UPDATED_AT',
    direction: 'DESC'
  })
  // SBOM VERSIONS
  const [toolsState, toolsDispatch] = useReducer(toolsReducer, {
    drifts: [],
    difference: '',
    component: '',
    searchInput: '',
    filters: null
  })
   // POLICIES
   const [policyState, policyDispatch] = useReducer(policyReducer, {
    pageIndex: 1,
    searchInput: '',
    after:'',
    before: '',
    field: 'POLICIES_UPDATED_AT',
    direction: 'DESC'
  })

  return (
    <GlobalStateContext.Provider
      value={{
        totalRows,
        setTotalRows,
        activeProdTab,
        setActiveProdTab,
        activeCsProdTab,
        setActiveCsProdTab,
        activeSbomTab,
        setActiveSbomTab,
        activeCsSbomTab,
        setActiveCsSbomTab,
        activeDockerHub,
        setActiveDockerHub,
        vulnerabilitiesData,
        setVulnerabilitiesData,
        userPermissions,
        setUserPermissions,
        scanEnabled,
        setScanEnabled,
        userName,
        setUserName,
        envName,
        setEnvName,
        clearSelect,
        setClearSelect,
        selectedSbom,
        setSelectedSbom,
        globalVulnState,
        compVulnState,
        prodState,
        prodLogState,
        prodCompState,
        prodVulnState,
        prodCheckState,
        prodRulesState,
        sbomLogState,
        sbomState,
        versionState,
        toolsState,
        supportState,
        policyState,
        dispatch: {
          globalVulnDispatch,
          compVulnDispatch,
          prodDispatch,
          prodLogDispatch,
          prodCompDispatch,
          prodVulnDispatch,
          prodCheckDispatch,
          prodRulesDispatch,
          sbomLogDispatch,
          sbomDispatch,
          versionDispatch,
          toolsDispatch,
          supportDispatch,
          policyDispatch
        }
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  )
}

const useGlobalState = () => {
  const context = useContext(GlobalStateContext)
  if (!context)
    throw new Error('useGlobalState must be used within a GlobalStateProvider')
  return context
}

export { GlobalStateProvider, useGlobalState }
