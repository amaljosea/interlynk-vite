import React, { useEffect, useState } from 'react'
import GlobalContext from './GlobalContext'
import { dashboardTableData } from 'variables/general'
import { SBOMLinks } from 'variables/general'
import { Vulnerabilities } from 'variables/general'
import { activitiesDataLong } from 'variables/general'

const ContextWrapper = (props) => {
  const [productVersionsData, setProductVersionsData] = useState(
    dashboardTableData
  )
  const [SBOMLinksData, setSBOMLinksData] = useState(SBOMLinks)
  const [vulnerabilitiesData, setVulnerabilitiesData] = useState([])
  const [activitiesData, setActivitiesData] = useState(activitiesDataLong)

  const productExploded = []
  dashboardTableData.map((p) => {
    p.versions.map((v) => {
      productExploded.push({
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
  const [customerView, setCustomerView] = useState('')
  const [minimize, setMinimize] = useState(false)
  const [activeDockerHub, setActiveDockerHub] = useState(true)
  const [userLocation, setUserLocation] = useState(null)
  const [selectedRows, setSelectedRows] = useState([])
  const [registryList, setRegistryList] = useState([])
  const [images, setImages] = useState([
    {
      id: 1,
      version: 'v0.0.1',
      image: 'interlynk/sbomqs',
      connection: 'Interlynk Prod',
      scanResult: ['Grype']
    },
    {
      id: 2,
      version: 'v1.0',
      image: 'interlynk/sbomasm',
      connection: 'Interlynk Prod',
      scanResult: ['Trivy', 'Scout']
    },
    {
      id: 3,
      version: 'v1.0',
      image: 'interlynk/sbomgr',
      connection: 'Interlynk Prod',
      scanResult: ['Grype', 'Trivy']
    },
    {
      id: 4,
      version: 'v1.0',
      image: 'interlynk/sbomex',
      connection: 'Interlynk Prod',
      scanResult: ['Grype', 'Custom']
    }
  ])
  const [tabIndex, setTabIndex] = useState(0)

  const [componentsVal, setComponentsVal] = useState('')
  const [VulnerabilitiesVal, setVulnerabilitiesVal] = useState('')
  const [activeVulnVal, setActiveVulnVal] = useState('')
  const [riskScoreVal, setRiskScoreVal] = useState('')

  const [isAuthenticate, setIsAuthenticate] = useState(false)

  const [scannerItems, setScannerItems] = useState('')

  // useEffect(() => {
  //   const docker = window.localStorage.getItem('DockerHub')
  //   if (docker === 'true') {
  //     setActiveDockerHub(true)
  //   } else {
  //     setActiveDockerHub(false)
  //   }
  // }, [])

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
        activitiesData,
        setActivitiesData,
        activeDockerHub,
        setActiveDockerHub,
        userLocation,
        setUserLocation,
        selectedRows,
        setSelectedRows,
        registryList,
        setRegistryList,
        images,
        setImages,
        tabIndex,
        setTabIndex,
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
        setScannerItems
      }}
    >
      {props.children}
    </GlobalContext.Provider>
  )
}

export default ContextWrapper
