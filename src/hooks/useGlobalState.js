/* eslint-disable react-hooks/exhaustive-deps */
import { sbomCheckReducer } from 'context/reducers'
import { globalVulnReducer } from 'context/reducers'
import {
  analyticsReducer,
  prodCompReducer,
  prodReducer,
  prodVulnReducer,
  sbomReducer,
  supportReducer,
  toolsReducer,
  versionReducer
} from 'context/reducers'
import React, { createContext, useContext, useReducer, useState } from 'react'
import {
  allActivities,
  allPolicies,
  allProducts,
  allTrends,
  allVulns
} from 'utils/initDashboardData'
import { setItem } from 'utils/localStorageUtils'
import { getItem } from 'utils/localStorageUtils'

const GlobalStateContext = createContext()

const GlobalStateProvider = ({ children }) => {
  const env = getItem('environment')
  const cards = getItem('selectedCards')
  const selectedCards = cards ? JSON.parse(cards) : null

  const [organization, setOrganization] = useState(null)
  const [userPermissions, setUserPermissions] = useState([])
  const [envName, setEnvName] = useState(env || 'default')
  const [clearSelect, setClearSelect] = useState(false)
  const [selectedSbom, setSelectedSbom] = useState([])
  const [labelIds, setLabelIds] = useState([])
  const [selectedActivities, setSelectedActivities] = useState([])
  const [selectedProducts, setSelectedProducts] = useState([])
  const [selectedVulns, setSelectedVulns] = useState([])
  const [selectedTrends, setSelectedTrends] = useState([])
  const [selectedPolicies, setSelectedPolicies] = useState([])
  const [selectedAnalytics, setSelectedAnalytics] = useState([])

  const updateSelection = (data) => {
    setItem('selectedCards', JSON.stringify(data))
    const setters = {
      products: setSelectedProducts,
      activities: setSelectedActivities,
      vulns: setSelectedVulns,
      trends: setSelectedTrends,
      policies: setSelectedPolicies
    }

    Object.entries(data).forEach(([key, value]) => {
      setters[key](value)
    })
  }

  const updateSelectedState = (values, key) => {
    switch (key) {
      case 'products':
        setSelectedProducts(values)
        break
      case 'vulns':
        setSelectedVulns(values)
        break
      case 'trends':
        setSelectedTrends(values)
        break
      case 'policies':
        setSelectedPolicies(values)
        break
      case 'activities':
        setSelectedActivities(values)
        break
      default:
        break
    }
  }

  const updateCards = (values, key) => {
    updateSelectedState(values, key)
    if (selectedCards) {
      const updated = { ...selectedCards, [key]: values }
      setItem('selectedCards', JSON.stringify(updated))
    }
  }

  const handleClearAll = () => {
    updateSelection({
      products: [],
      activities: [],
      vulns: [],
      trends: [],
      policies: []
    })
  }

  const handleSelectAll = () => {
    updateSelection({
      products: allProducts,
      activities: allActivities,
      vulns: allVulns,
      trends: allTrends,
      policies: allPolicies
    })
  }

  // PRODUCTS
  const [prodState, prodDispatch] = useReducer(prodReducer, {
    data: null,
    field: 'PROJECT_GROUPS_UPDATED_AT',
    direction: 'DESC',
    totalProduct: 0,
    searchInput: '',
    labelIds: [],
    lifestage: [],
    enabled: 'yes',
    currentProduct: null
  })
  // SBOM VERSIONS
  const [versionState, versionDispatch] = useReducer(versionReducer, {
    field: 'SBOMS_UPDATED_AT',
    direction: 'DESC',
    searchInput: '',
    lifestage: []
  })

  const [prodCompState, prodCompDispatch] = useReducer(prodCompReducer, {
    field: 'COMPONENTS_UPDATED_AT',
    direction: 'DESC',
    totalComp: 0,
    searchInput: '',
    ecosystems: [],
    kinds: [],
    licenses: [],
    suppliers: [],
    supportLevel: [],
    scope: '',
    direct: false,
    filters: null,
    licenseType: 'all',
    expLicense: '',
    cpeString: '',
    isCpeValid: true,
    expandedRows: [],
    purlString: '',
    exclude: [],
    selectedComp: null,
    filterMode: 'OR'
  })
  const [prodVulnState, prodVulnDispatch] = useReducer(prodVulnReducer, {
    field: 'COMPONENT_VULNS_UPDATED_AT',
    direction: 'DESC',
    totalVuln: 0,
    searchInput: '',
    severities: [],
    components: [],
    statues: [],
    exclude: ['retracted'],
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
    license: []
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
    exclude: [],
    field: 'COMPONENT_SUPPORT_LEVELS_UPDATED_AT',
    direction: 'ASC',
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
  // ANALYTICS
  const [analyticsState, analyticsDispatch] = useReducer(analyticsReducer, {
    product: null,
    label: null,
    lifecycle: [],
    version: [],
    duration: null
  })

  const onChangeEnv = (env) => {
    localStorage.setItem('environment', env)
    setEnvName(env)
  }

  const onClearSelection = () => {
    setSelectedSbom([])
    setClearSelect(!clearSelect)
  }

  return (
    <GlobalStateContext.Provider
      value={{
        organization,
        setOrganization,
        userPermissions,
        setUserPermissions,
        selectedActivities,
        setSelectedActivities,
        selectedProducts,
        setSelectedProducts,
        selectedVulns,
        setSelectedVulns,
        selectedTrends,
        setSelectedTrends,
        selectedPolicies,
        setSelectedPolicies,
        selectedAnalytics,
        setSelectedAnalytics,
        updateCards,
        handleClearAll,
        handleSelectAll,
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
        onClearSelection,
        sbomCheckState,
        globalVulnState,
        selectedSbom,
        setSelectedSbom,
        labelIds,
        setLabelIds,
        supportState,
        analyticsState,
        dispatch: {
          prodDispatch,
          prodCompDispatch,
          prodVulnDispatch,
          sbomDispatch,
          versionDispatch,
          toolsDispatch,
          sbomCheckDispatch,
          globalVulnDispatch,
          supportDispatch,
          analyticsDispatch
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
