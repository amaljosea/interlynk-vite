import {
  compVulnReducer,
  prodCompReducer,
  prodReducer,
  prodRulesReducer,
  prodVulnReducer,
  sbomReducer,
  toolsReducer,
  versionReducer
} from 'context/reducers'
import React, { createContext, useContext, useReducer, useState } from 'react'

const GlobalStateContext = createContext()

const GlobalStateProvider = ({ children }) => {
  const env = localStorage.getItem('environment')
  const [steps, setSteps] = useState([])
  const [organization, setOrganization] = useState(null)
  const [userPermissions, setUserPermissions] = useState([])
  const [userName, setUserName] = useState('')
  const [totalRows, setTotalRows] = useState(25)
  const [activeCsProdTab, setActiveCsProdTab] = useState(0)
  const [activeCsSbomTab, setActiveCsSbomTab] = useState(0)
  const [activeDockerHub, setActiveDockerHub] = useState(true)
  const [vulnerabilitiesData, setVulnerabilitiesData] = useState([])
  const [scanEnabled, setScanEnabled] = useState(false)
  const [envName, setEnvName] = useState(env || 'default')
  const [clearSelect, setClearSelect] = useState(true)
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
    expLicense: '',
    cpeString: '',
    isCpeValid: true,
    expandedRows: [],
    purlString: '',
    include: [],
    selectedComp: null
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
    statues: ['Unspecified', 'In Triage', 'Affected', 'Fixed'],
    include: [],
    source: false,
    kev: '',
    epss: '',
    minEpss: 0,
    maxEpss: 0,
    direct: 'all',
    filters: null,
    selectedVulns: [],
    importSbom: [],
    mergeData: [],
    currentSbom: [],
    licenseString: [],
    vexComplete: 'all',
    statusTitle: '',
    statusName: '',
    justification: '',
    justifyName: '',
    selectedTag: '',
    actionStatement: '',
    response: '',
    responseTitle: '',
    details: '',
    notes: '',
    impactData: '',
    upstream: false,
    retracted: false
  })
  const [sbomState, sbomDispatch] = useReducer(sbomReducer, {
    licenseType: 'license_exp',
    expLicense: '',
    licenseString: null
  })
  // SBOM VERSIONS
  const [toolsState, toolsDispatch] = useReducer(toolsReducer, {
    drifts: [],
    difference: '',
    component: '',
    searchInput: '',
    filters: null
  })

  const onChangeEnv = (env) => {
    localStorage.setItem('environment', env)
    setEnvName(env)
  }

  return (
    <GlobalStateContext.Provider
      value={{
        steps,
        setSteps,
        totalRows,
        organization,
        setOrganization,
        setTotalRows,
        activeCsProdTab,
        setActiveCsProdTab,
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
        compVulnState,
        prodState,
        prodCompState,
        prodVulnState,
        prodRulesState,
        sbomState,
        versionState,
        toolsState,
        onChangeEnv,
        dispatch: {
          compVulnDispatch,
          prodDispatch,
          prodCompDispatch,
          prodVulnDispatch,
          prodRulesDispatch,
          sbomDispatch,
          versionDispatch,
          toolsDispatch
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
