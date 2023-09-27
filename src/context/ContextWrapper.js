import { useState } from 'react'
import GlobalContext from './GlobalContext'
import { healthChecks } from 'variables/general'
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

  const [healthCheckData, setHealthCheckData] = useState(healthChecks)

  const [changelogData, setChangelogData] = useState(changeLogs)

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
        setChangelogData
      }}
    >
      {props.children}
    </GlobalContext.Provider>
  )
}

export default ContextWrapper
