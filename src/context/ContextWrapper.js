import { useState } from 'react'
import GlobalContext from './GlobalContext'

const ContextWrapper = (props) => {
  const [vulnerabilitiesData, setVulnerabilitiesData] = useState([])
  const [minimize, setMinimize] = useState(true)
  const [activeDockerHub, setActiveDockerHub] = useState(true)
  const [userLocation, setUserLocation] = useState(null)
  const [componentsVal, setComponentsVal] = useState('')
  const [riskScoreVal, setRiskScoreVal] = useState('')
  const [isAuthenticate, setIsAuthenticate] = useState(false)
  const [scanEnabled, setScanEnabled] = useState(false)

  const [healthCheckData, setHealthCheckData] = useState([
    {
      id: 1,
      healthCheckId: 'qs-1',
      severity: 'critical',
      shortDesc: 'Primary Component',
      longDesc: 'SBOM does not indicate a primary component',
      status: 'fix'
    },
    {
      id: 2,
      healthCheckId: 'qs-3',
      severity: 'critical',
      shortDesc: 'Primary Component Version',
      longDesc: 'SBOM does not include a primary component version',
      status: 'fix'
    },
    {
      id: 3,
      healthCheckId: 'qs-4',
      severity: 'critical',
      shortDesc: 'Component Name',
      longDesc: 'Component identified with <XXXX> does not have a name',
      status: 'fix'
    },
    {
      id: 4,
      healthCheckId: 'qs-5',
      severity: 'medium',
      shortDesc: 'Supplier Name',
      longDesc: 'Component identified with <XXXX> does not have a supplier',
      status: 'fix'
    },
    {
      id: 5,
      healthCheckId: 'qs-6',
      severity: 'critical',
      shortDesc: 'Unique Identifier',
      longDesc:
        'Component identifeid with <XXXX> does not have a unique identifier',
      status: 'fix'
    },
    {
      id: 6,
      healthCheckId: 'qs-7',
      severity: 'high',
      shortDesc: 'Component Version',
      longDesc: 'Component identifeid with <XXXX> does not have a version',
      status: 'fix'
    },
    {
      id: 7,
      healthCheckId: 'qs-8',
      severity: 'low',
      shortDesc: 'Author Name',
      longDesc: 'Component identifeid with <XXXX> does not have an author',
      status: 'fix'
    },
    {
      id: 8,
      healthCheckId: 'qs-9',
      severity: 'high',
      shortDesc: 'Timestamp',
      longDesc: 'SBOM does not include a timestamp',
      status: 'fix'
    },
    {
      id: 9,
      healthCheckId: 'qs-10',
      severity: 'high',
      shortDesc: 'Component Relationships',
      longDesc:
        'Component identified with <XXXX> is not related to any component connected to the primary component',
      status: 'active'
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
        setHealthCheckData
      }}
    >
      {props.children}
    </GlobalContext.Provider>
  )
}

export default ContextWrapper
