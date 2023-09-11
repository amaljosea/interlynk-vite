import React from 'react'

const GlobalContext = React.createContext({
  vulnerabilitiesData: [],
  setVulnerabilitiesData: () => {},
  minimize: false,
  setMinimize: () => {},
  activeDockerHub: true,
  setActiveDockerHub: () => {},
  userLocation: null,
  setUserLocation: () => {},
  images: [],
  setImages: () => {},
  componentsVal: '',
  setComponentsVal: () => {},
  riskScoreVal: '',
  setRiskScoreVal: () => {},
  isAuthenticate: false,
  setIsAuthenticate: () => {},
  scanEnabled: false,
  setScanEnabled: () => {}
})

export default GlobalContext
