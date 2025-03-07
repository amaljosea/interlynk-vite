import React, { createContext, useState } from 'react'
import { formatString } from 'utils'

export const TabContext = createContext()

const tabOptions = [
  { name: 'details', label: 'Details' },
  { name: 'identifiers', label: 'Identifiers' },
  { name: 'suppliers', label: 'Supplier' },
  { name: 'links', label: 'Links' },
  { name: 'relationships', label: 'Relationships' }
]

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
    suppliers: {
      name: '',
      url: '',
      contactName: '',
      contactEmail: ''
    },
    links: {
      url: '',
      name: ''
    },
    relationships: {
      to: '',
      relType: ''
    }
  }
  const initialUnsavedChanges = {
    details: false,
    identifiers: false,
    suppliers: false,
    links: false,
    relationships: false
  }

  const [tab, setTab] = useState(tabOptions[0].name)
  const [alert, setAlert] = useState(false)
  const [tabData, setTabData] = useState(initialTabData)
  const [unsavedChanges, setUnsavedChanges] = useState(initialUnsavedChanges)
  const [alertMessage, setAlertMessage] = useState('')

  const onTabChange = (index) => {
    setAlertMessage('')
    setAlert('')
    setTab(tabOptions[index].name)
  }

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

  function resetUnsavedChange(tab) {
    setUnsavedChanges((prevChanges) => ({
      ...prevChanges,
      [tab]: initialUnsavedChanges[tab] // Reset only the specified key
    }))
  }

  const saveChanges = (tab) => {
    setAlert(false)
    resetUnsavedChange(tab)
  }

  function getUnsavedTabList(obj) {
    const keys = Object.keys(obj)
      .filter((key) => obj[key] === true)
      .map((key) => formatString(key))

    if (keys.length > 2) {
      return `${keys.slice(0, -1).join(', ')} and ${keys[keys.length - 1]}`
    } else {
      return keys.join(' and ')
    }
  }

  function alertMessageSetter(obj) {
    const unsavedTabs = getUnsavedTabList(obj)

    setAlertMessage(
      unsavedTabs
        ? `You have unsaved changes in ${unsavedTabs} tab. You can still proceed to save this tab, Save other tabs separately to retain their data.`
        : ''
    )
  }

  const resetData = () => {
    setTab(tabOptions[0].name)
    setAlert(false)
    setTabData(initialTabData)
    setUnsavedChanges(initialUnsavedChanges)
    setAlertMessage('')
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
        setAlert,
        alertMessage,
        alertMessageSetter
      }}
    >
      {children}
    </TabContext.Provider>
  )
}
