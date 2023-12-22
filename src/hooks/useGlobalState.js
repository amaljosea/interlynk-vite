import React, { useState, createContext, useContext, useReducer } from 'react'
import {
  prodCheckReducer,
  prodCompReducer,
  prodLogReducer,
  prodVulnReducer,
  sbomLogReducer,
  prodReducer
} from 'context/reducers'

const GlobalStateContext = createContext()

const GlobalStateProvider = ({ children }) => {
  const [totalRows, setTotalRows] = useState(25)
  const [prodState, prodDispatch] = useReducer(prodReducer, {
    field: 'PROJECTS_UPDATED_AT',
    direction: 'DESC',
    totalProduct: 0,
    searchInput: '',
    pageIndex: 1,
    enabled: 'yes'
  })
  const [prodLogState, prodLogDispatch] = useReducer(prodLogReducer, {
    field: 'ACTIVITY_LOGS_CREATED_AT',
    direction: 'DESC'
  })
  const [prodCompState, prodCompDispatch] = useReducer(prodCompReducer, {
    field: 'COMPONENTS_UPDATED_AT',
    direction: 'DESC',
    searchInput: '',
    pageIndex: 1,
    ecosystems: [],
    kinds: [],
    licenses: [],
    suppliers: [],
    scope: ''
  })
  const [prodVulnState, prodVulnDispatch] = useReducer(prodVulnReducer, {
    field: 'COMPONENT_VULNS_UPDATED_AT',
    direction: 'DESC',
    searchInput: '',
    pageIndex: 1,
    severities: [],
    components: [],
    statues: [],
    kev: '',
    epss: {
      min: 0,
      max: 10000
    }
  })
  const [prodCheckState, prodCheckDispatch] = useReducer(prodCheckReducer, {
    field: 'CHECK_RESULTS_UPDATED_AT',
    direction: 'DESC',
    searchInput: '',
    pageIndex: 1,
    rules: [],
    categories: [],
    severities: [],
    statues: []
  })
  const [sbomLogState, sbomLogDispatch] = useReducer(sbomLogReducer, {
    field: 'ACTIVITY_LOGS_CREATED_AT',
    direction: 'DESC',
    searchInput: '',
    pageIndex: 1,
    users: [],
    objects: [],
    types: []
  })

  return (
    <GlobalStateContext.Provider
      value={{
        totalRows,
        setTotalRows,
        prodState,
        prodLogState,
        prodCompState,
        prodVulnState,
        prodCheckState,
        sbomLogState,
        dispatch: {
          prodDispatch,
          prodLogDispatch,
          prodCompDispatch,
          prodVulnDispatch,
          prodCheckDispatch,
          sbomLogDispatch
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
