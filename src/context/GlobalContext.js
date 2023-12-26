import React from 'react'

const GlobalContext = React.createContext({
  signedCompFilters: {},
  setSignedCompFiltes: () => {},
  signedVulnFilters: {},
  setSignedVulnFilters: () => {},
  signedActiveTab: 0,
  setSignedActiveTab: () => {},
  // SIGNED VULN FILTER
  signedVulnSearchInput: '',
  setSignedVulnSearchInput: () => {},
  signedVulnSeverity: [],
  setSignedVulnSeverity: () => {},
  signedVulnComponent: [],
  setSignedVulnComponent: () => {},
  signedVulnStatus: [],
  setSignedVulnStatus: () => {},
  signedVulnKev: '',
  setSignedVulnKev: () => {},
  signedVulnEpss: '',
  setSignedVulnEpss: () => {},
  signedMinVal: 0,
  setSignedMinVal: () => {},
  signedMaxVal: 0,
  setSignedMaxVal: () => {},
  // SIGNED STATE
  signedCompField: '',
  setSignedCompField: () => {},
  signedCompDirection: '',
  setSignedCompDirection: () => {},
  signedVulnField: '',
  setSignedVulnField: () => {},
  signedVulnDirection: '',
  setSignedVulnDirection: () => {}
})

export default GlobalContext
