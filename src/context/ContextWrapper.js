import { useState } from 'react'
import GlobalContext from './GlobalContext'
import { healthChecks } from 'variables/general'
import { changeLogs } from 'variables/general'
import { Vulnerabilities } from 'variables/general'

const ContextWrapper = (props) => {
  const [vulnerabilitiesData, setVulnerabilitiesData] = useState([])
  const [minimize, setMinimize] = useState(true)
  const [activeDockerHub, setActiveDockerHub] = useState(true)
  const [userLocation, setUserLocation] = useState(null)
  const [componentsVal, setComponentsVal] = useState('')
  const [riskScoreVal, setRiskScoreVal] = useState('')
  const [isAuthenticate, setIsAuthenticate] = useState(false)
  const [scanEnabled, setScanEnabled] = useState(false)

  const [healthCheckData, setHealthCheckData] = useState(healthChecks)

  const [changelogData, setChangelogData] = useState(changeLogs)

  const [productVulData, setProductVulData] = useState(Vulnerabilities)

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
      selectorTwo: 'PURL',
      conditionTwo: 'Missing',
      fixAction: ''
    }
  ])

  return (
    <GlobalContext.Provider
      value={{
        vulnerabilitiesData,
        setVulnerabilitiesData,
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
        healthCheckData,
        setHealthCheckData,
        changelogData,
        setChangelogData,
        productVulData,
        setProductVulData,
        automationRules,
        setAutomationRules
      }}
    >
      {props.children}
    </GlobalContext.Provider>
  )
}

export default ContextWrapper
