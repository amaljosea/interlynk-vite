import { useState } from 'react'

import GlobalContext from './GlobalContext'
import { advisoriesDataLong } from 'variables/general'

const ContextWrapper = (props) => {
  const [vulnerabilitiesData, setVulnerabilitiesData] = useState([])

  const [customerView, setCustomerView] = useState('')
  const [minimize, setMinimize] = useState(false)
  const [activeDockerHub, setActiveDockerHub] = useState(true)
  const [userLocation, setUserLocation] = useState(null)
  const [selectedRows, setSelectedRows] = useState([])
  const [registryList, setRegistryList] = useState([])

  const [componentsVal, setComponentsVal] = useState('')
  const [VulnerabilitiesVal, setVulnerabilitiesVal] = useState('')
  const [activeVulnVal, setActiveVulnVal] = useState('')
  const [riskScoreVal, setRiskScoreVal] = useState('')

  const [isAuthenticate, setIsAuthenticate] = useState(false)

  const [scannerItems, setScannerItems] = useState('')
  const [scanEnabled, setScanEnabled] = useState(false)

  const [advisoriesData, setAdvisoriesData] = useState(advisoriesDataLong)

  const [isConfirmed, setIsConfirmed] = useState(false)

  return (
    <GlobalContext.Provider
      value={{
        vulnerabilitiesData,
        setVulnerabilitiesData,
        customerView,
        setCustomerView,
        minimize,
        setMinimize,
        activeDockerHub,
        setActiveDockerHub,
        userLocation,
        setUserLocation,
        selectedRows,
        setSelectedRows,
        registryList,
        setRegistryList,
        componentsVal,
        setComponentsVal,
        VulnerabilitiesVal,
        setVulnerabilitiesVal,
        activeVulnVal,
        setActiveVulnVal,
        riskScoreVal,
        setRiskScoreVal,
        isAuthenticate,
        setIsAuthenticate,
        scannerItems,
        setScannerItems,
        scanEnabled,
        setScanEnabled,
        advisoriesData,
        setAdvisoriesData,
        isConfirmed,
        setIsConfirmed
      }}
    >
      {props.children}
    </GlobalContext.Provider>
  )
}

export default ContextWrapper
