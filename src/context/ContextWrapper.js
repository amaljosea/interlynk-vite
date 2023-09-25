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
      id: 'qs-1',
      severity: 'Critical',
      shortDesc: 'Primary Component',
      longDesc: 'SBOM does not indicate a primary component',
      status: 'fix'
    },
    {
      id: 'qs-3',
      severity: 'Critical',
      shortDesc: 'Primary Component Version',
      longDesc: 'SBOM does not include a primary component version',
      status: 'fix'
    },
    {
      id: 'qs-4',
      severity: 'Critical',
      shortDesc: 'Component Name',
      longDesc: 'Component identified with <XXXX> does not have a name',
      status: 'fix'
    },
    {
      id: 'qs-5',
      severity: 'Medium',
      shortDesc: 'Supplier Name',
      longDesc: 'Component identified with <XXXX> does not have a supplier',
      status: 'fix'
    },
    {
      id: 'qs-6',
      severity: 'Critical',
      shortDesc: 'Unique Identifier',
      longDesc:
        'Component identifeid with <XXXX> does not have a unique identifier',
      status: 'fix'
    },
    {
      id: 'qs-7',
      severity: 'High',
      shortDesc: 'Component Version',
      longDesc: 'Component identifeid with <XXXX> does not have a version',
      status: 'fix'
    },
    {
      id: 'qs-8',
      severity: 'Low',
      shortDesc: 'Author Name',
      longDesc: 'Component identifeid with <XXXX> does not have an author',
      status: 'fix'
    },
    {
      id: 'qs-9',
      severity: 'High',
      shortDesc: 'Timestamp',
      longDesc: 'SBOM does not include a timestamp',
      status: 'fix'
    },
    {
      id: 'qs-10',
      severity: 'High',
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
