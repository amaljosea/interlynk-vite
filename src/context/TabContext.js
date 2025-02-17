import React, { createContext, useState } from 'react'

export const TabContext = createContext()

export const TabProvider = ({ children }) => {
  const initialTabData = {
    details: {
      kind: '',
      name: '',
      scope: '',
      group: '',
      primary: false,
      internal: false,
      version: '',
      description: '',
      copyright: '',
      licenses: []
    },
    identifiers: {
      cpe: '',
      cpeError: '',
      purl: '',
      purlError: ''
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

  const [tab, setTab] = useState(0)
  const [alert, setAlert] = useState(false)
  const [tabData, setTabData] = useState(initialTabData)
  const [unsavedChanges, setUnsavedChanges] = useState(initialUnsavedChanges)

  const onTabChange = (index) => setTab(index)

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
    setAlert(false)
    setUnsavedChanges(initialUnsavedChanges)
  }

  const resetData = () => {
    setTab(0)
    setAlert(false)
    setTabData(initialTabData)
    setUnsavedChanges(initialUnsavedChanges)
  }

  return (
    <TabContext.Provider
      value={{
        tab,
        alert,
        tabData,
        onTabChange,
        setTabData,
        handleChange,
        unsavedChanges,
        saveChanges,
        resetData,

        setAlert
      }}
    >
      {children}
    </TabContext.Provider>
  )
}
