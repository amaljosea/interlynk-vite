import React, { createContext, useState } from 'react'

export const TabContext = createContext()

export const TabProvider = ({ children }) => {
  const initialTabData = {
    details: {
      kind: '',
      name: '',
      scope: '',
      group: '',
      primary: '',
      internal: '',
      version: '',
      description: '',
      copyright: '',
      supportLevel: '',
      endOfSupport: '',
      licenses: []
    },
    identifiers: {
      cpe: '',
      isValidCpe: true,
      purl: '',
      isValidPurl: true
    },
    supplier: {
      name: '',
      url: '',
      contactName: '',
      contactEmail: ''
    },
    links: {
      url: '',
      name: ''
    },
    relations: {
      to: '',
      relType: ''
    }
  }
  const initialUnsavedChanges = {
    details: false,
    identifiers: false,
    supplier: false,
    links: false,
    relations: false
  }

  const [tabData, setTabData] = useState(initialTabData)
  const [unsavedChanges, setUnsavedChanges] = useState(initialUnsavedChanges)

  const handleChange = (tab, field, value) => {
    setTabData((prevData) => ({
      ...prevData,
      [tab]: {
        ...prevData[tab],
        [field]: value
      }
    }))
    setUnsavedChanges((prevChanges) => ({
      ...prevChanges,
      [tab]: true
    }))
  }

  const saveChanges = () => {
    console.log('Saving data:', tabData)
    setTabData(initialTabData)
    setUnsavedChanges(initialUnsavedChanges)
  }

  return (
    <TabContext.Provider
      value={{
        tabData,
        setTabData,
        handleChange,
        unsavedChanges,
        saveChanges
      }}
    >
      {children}
    </TabContext.Provider>
  )
}
