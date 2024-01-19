import React, { useState, createContext, useContext, useReducer } from 'react'
import {
  globalVulnReducer,
  prodRulesReducer,
  prodCheckReducer,
  prodCompReducer,
  prodLogReducer,
  prodVulnReducer,
  sbomLogReducer,
  prodReducer,
  sbomReducer
} from 'context/reducers'

const GlobalStateContext = createContext()

const GlobalStateProvider = ({ children }) => {
  const [userPermissions, setUserPermissions] = useState([])
  const [userName, setUserName] = useState('')
  const [totalRows, setTotalRows] = useState(25)
  const [activeProdTab, setActiveProdTab] = useState(0)
  const [activeSbomTab, setActiveSbomTab] = useState(0)
  const [minimize, setMinimize] = useState(true)
  const [activeDockerHub, setActiveDockerHub] = useState(true)
  const [vulnerabilitiesData, setVulnerabilitiesData] = useState([])
  const [scanEnabled, setScanEnabled] = useState(false)
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
  // GLOBAL VULNERABILITIES
  const [globalVulnState, globalVulnDispatch] = useReducer(globalVulnReducer, {
    field: 'GLOBAL_VULNS_UPDATED_AT',
    direction: 'DESC',
    searchInput: '',
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
    filters: null,
    licenseType: 'license_spdx',
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
    kev: '',
    epss: '',
    minEpss: 0,
    maxEpss: 0,
    filters: null,
    selectedVulns: [],
    importSbom: [],
    mergeData: [],
    currentSbom: []
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
    licenseType: 'license_spdx',
    spdxLicenses: [],
    spdxList: [],
    customLicenses: [],
    customList: [],
    expLicense: ''
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

  return (
    <GlobalStateContext.Provider
      value={{
        minimize,
        setMinimize,
        totalRows,
        setTotalRows,
        activeProdTab,
        setActiveProdTab,
        activeSbomTab,
        setActiveSbomTab,
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
        globalVulnState,
        prodState,
        prodLogState,
        prodCompState,
        prodVulnState,
        prodCheckState,
        prodRulesState,
        sbomLogState,
        sbomState,
        dispatch: {
          globalVulnDispatch,
          prodDispatch,
          prodLogDispatch,
          prodCompDispatch,
          prodVulnDispatch,
          prodCheckDispatch,
          prodRulesDispatch,
          sbomLogDispatch,
          sbomDispatch
        }
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  )
}

const useGlobalState = () => {
  const context = useContext(GlobalStateContext)
  if (!context) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider')
  }
  return context
}

export { GlobalStateProvider, useGlobalState }
