import { TabProvider } from 'context/TabContext'
import { useCallback, useMemo, useState } from 'react'

import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react'

import Card from 'components/Card/Card'

import { usePaginatedQuery } from 'hooks/usePaginatedQuery'

import { PackageData } from 'graphQL/Queries'

import PackageTable from './PackageTable'

const TABS = [
  { label: 'Package Versions', selector: 'packageVersions' },
  { label: 'Package Overrides', selector: 'packageOverrides' }
]

const Package = () => {
  const [tabIndex, setTabIndex] = useState(0)
  const [filters, setFilters] = useState({})

  const isOverrides = useMemo(
    () => TABS[tabIndex].selector === 'packageOverrides',
    [tabIndex]
  )

  const { nodes, paginationProps, reset, loading } = usePaginatedQuery(
    PackageData,
    {
      selector: TABS[tabIndex].selector,
      variables: { ...filters, isOverrides }
    }
  )

  const handleTabChange = (index) => {
    setTabIndex(index)
    setFilters({})
    reset()
  }

  const updateFilters = useCallback(
    (newFilters) => {
      setFilters(newFilters)
      reset()
    },
    [reset]
  )

  return (
    <TabProvider>
      <Card>
        <Tabs variant='enclosed' onChange={handleTabChange}>
          <TabList>
            {TABS.map((tab) => (
              <Tab key={tab.label}>{tab.label}</Tab>
            ))}
          </TabList>
          <TabPanels>
            <TabPanel>
              <PackageTable
                data={nodes}
                loading={loading}
                paginationProps={paginationProps}
                filters={filters}
                setFilters={updateFilters}
                isOverrides={isOverrides}
              />
            </TabPanel>
            <TabPanel>
              <PackageTable
                data={nodes}
                loading={loading}
                paginationProps={paginationProps}
                filters={filters}
                setFilters={updateFilters}
                isOverrides={isOverrides}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>
    </TabProvider>
  )
}

export default Package
