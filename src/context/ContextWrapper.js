import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import GlobalContext from './GlobalContext'
import {
  advisoriesDataLong,
  dashboardTableData,
  SBOMLinks
} from 'variables/general'

const ContextWrapper = (props) => {
  const [productVersionsData, setProductVersionsData] = useState(
    dashboardTableData
  )

  const productExploded = []
  dashboardTableData.map((p) => {
    p.versions.map((v) => {
      productExploded.push({
        id: uuidv4(),
        name: p.name,
        description: p.description,
        logo: p.logo,
        version: v.version,
        vendor: p.vendor,
        quality_score: p.quality_score,
        sbom_links: v.sbom_links,
        risk_score: v.risk_score,
        updated_at: v.updated_at,
        active: v.active,
        source: p.source
      })
    })
  })

  const [productVersionExploded, setProductVersionExploded] = useState(
    productExploded
  )

  const [SBOMLinksData, setSBOMLinksData] = useState(SBOMLinks)

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
        productVersionsData,
        setProductVersionsData,
        productVersionExploded,
        setProductVersionExploded,
        SBOMLinksData,
        setSBOMLinksData,
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
