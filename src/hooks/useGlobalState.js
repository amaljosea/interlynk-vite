import { sbomCheckReducer } from 'context/reducers'
import { globalVulnReducer } from 'context/reducers'
import {
  prodCompReducer,
  prodReducer,
  prodVulnReducer,
  sbomReducer,
  supportReducer,
  toolsReducer,
  versionReducer
} from 'context/reducers'
import React, { createContext, useContext, useReducer, useState } from 'react'

const GlobalStateContext = createContext()

const GlobalStateProvider = ({ children }) => {
  const env = localStorage.getItem('environment')
  const [organization, setOrganization] = useState(null)
  const [userPermissions, setUserPermissions] = useState([])
  const [envName, setEnvName] = useState(env || 'default')
  const [clearSelect, setClearSelect] = useState(false)
  const [selectedSbom, setSelectedSbom] = useState([])
  const [labelIds, setLabelIds] = useState([])

  // PRODUCTS
  const [prodState, prodDispatch] = useReducer(prodReducer, {
    data: null,
    field: 'PROJECT_GROUPS_UPDATED_AT',
    direction: 'DESC',
    totalProduct: 0,
    searchInput: '',
    labelIds: [],
    lifestage: [],
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
    supportLevel: [],
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
    statues: [],
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
  const [sbomCheckState, sbomCheckDispatch] = useReducer(sbomCheckReducer, {
    field: 'CHECK_RESULTS_UPDATED_AT',
    direction: 'DESC',
    category: [],
    severity: [],
    checkId: [],
    status: [],
    search: ''
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
  // COMPONENT SUPPORT
  const [supportState, supportDispatch] = useReducer(supportReducer, {
    level: [],
    field: 'COMPONENTS_UPDATED_AT',
    direction: 'DESC',
    searchInput: ''
  })
  // GLOBAL VULNERABILITIES
  const [globalVulnState, globalVulnDispatch] = useReducer(globalVulnReducer, {
    field: 'VULNS_PUBLISHED_AT',
    direction: 'DESC',
    search: '',
    projectGroupIds: [],
    projectNames: [],
    projectGroupLabelIds: [],
    severity: [],
    status: [],
    kev: '',
    epss: '',
    minEpss: 0,
    maxEpss: 0
  })

  const onChangeEnv = (env) => {
    localStorage.setItem('environment', env)
    setEnvName(env)
  }

  return (
    <GlobalStateContext.Provider
      value={{
        organization,
        setOrganization,
        userPermissions,
        setUserPermissions,
        envName,
        setEnvName,
        clearSelect,
        setClearSelect,
        prodState,
        prodCompState,
        prodVulnState,
        sbomState,
        versionState,
        toolsState,
        onChangeEnv,
        sbomCheckState,
        globalVulnState,
        selectedSbom,
        setSelectedSbom,
        labelIds,
        setLabelIds,
        supportState,
        dispatch: {
          prodDispatch,
          prodCompDispatch,
          prodVulnDispatch,
          sbomDispatch,
          versionDispatch,
          toolsDispatch,
          sbomCheckDispatch,
          globalVulnDispatch,
          supportDispatch
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
