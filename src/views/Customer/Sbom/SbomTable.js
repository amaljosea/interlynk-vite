import { useGlobalState } from 'hooks/useGlobalState'
import React, { useEffect, useState } from 'react'
import { Tabs, TabList, Tab, TabPanel, TabPanels, Flex, Skeleton, Button, Text } from '@chakra-ui/react'
import GeneralDataRow from 'components/Tables/GeneralDataRow'
import ComponentTable from 'components/Tables/ComponentTable'
import VulnTable from 'components/Tables/VulnTable'
import { useLocation } from 'react-router-dom'
import Card from 'components/Card/Card'
import { FaLock } from 'react-icons/fa6'
import { GetShareLicensesTable } from 'graphQL/Queries'
import { useLazyQuery } from '@apollo/client'
import SbomLicenseTable from 'components/Licenses/SbomLicenseTable'

const SbomTable = ({ status, type, data, refetch, filteredData, vulnData, getVulnData, getCompData, compData, error
}) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('id')
  const sbomId = queryParams.get('sbom')
  const activeTab = Number(localStorage.getItem('activeCsSbomTab') || 0)
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')

  const { activeCsSbomTab, setActiveCsSbomTab, totalRows, prodCompState, prodVulnState, dispatch } = useGlobalState()
  const { prodCompDispatch, prodVulnDispatch } = dispatch

  // How often each tab should refetch the data (in minutes)
  const fetchIntervalMinutes = { 'General': 0, 'Parts': 0, 'Components': 0, 'Vulnerabilities': 0.5, 'Licenses': 0, 'Support': 0, 'Relationships': 0, 'Checks': 0, 'Change Log': 0 }

  const [lastFetchTime, setLastFetchTime] = useState({ 'General': null, 'Parts': null, 'Components': null, 'Vulnerabilities': null, 'Licenses': null, 'Support': null, 'Relationships': null, 'Checks': null, 'Change Log': null })

  const tabIndexToName = { 0: 'General', 1: 'Parts', 2: 'Components', 3: 'Vulnerabilities', 4: 'Licenses', 5: 'Support', 6: 'Relationships', 7: 'Checks', 8: 'Change Log' }

  // GET LICENSES DATA
  const [getLicensesData, { data: licensesData }] = useLazyQuery(GetShareLicensesTable, {fetchPolicy: 'network-only'})

  const shouldFetchData = (tabName) => {
    const lastFetch = lastFetchTime[tabName]
    const now = new Date()
    if (!lastFetch) return true // If never fetched, fetch data
    const minutesElapsed = (now - lastFetch) / 60000
    return minutesElapsed >= fetchIntervalMinutes[tabName]
  }

  const updateLastFetchTime = (tabName) => setLastFetchTime({ ...lastFetchTime, [tabName]: new Date() })
  const getUndefinedIfEmpty = (value) => (value !== '' ? value : undefined)
  const getUndefinedIfEmptyOrAll = (value, allValue = 'all') => value.includes(allValue) || value.length === 0 ? undefined : value

  const handleTabChange = (value) => {
    localStorage.setItem('activeCsSbomTab', value)
    setActiveCsSbomTab(value)
  }

  const fetchTabData = (activeTab) => {
    const commonParams = { projectId: signedUrlParams ? undefined : productId, sbomId: sbomId, first: totalRows, last: undefined, after: undefined, before: undefined }
    const tabName = tabIndexToName[activeTab]
    if (tabName === 'General' && shouldFetchData(tabName)) {
      refetch({ ...commonParams }).then(() => updateLastFetchTime(tabName))
    } else if (tabName === 'Components' && shouldFetchData(tabName)) {
      const { field, direction, searchInput, ecosystems, kinds, licenses, suppliers, scope, direct } = prodCompState
      getCompData({
        ...commonParams,
        search: getUndefinedIfEmpty(searchInput),
        ecosystem: getUndefinedIfEmptyOrAll(ecosystems),
        kind: getUndefinedIfEmptyOrAll(kinds),
        licenses: getUndefinedIfEmptyOrAll(licenses),
        supplierName: getUndefinedIfEmptyOrAll(suppliers),
        primary: scope === 'primary' ? true : undefined,
        internal: scope === 'internal' ? true : undefined,
        direct: direct === true ? true : undefined,
        field: field,
        direction: direction
      }).then((res) => {
        if (res.data) {
          prodCompDispatch({
            type: 'SET_TOTAL_COMP',
            payload: res?.data?.shareLynkQuery?.sbom?.components?.totalCount
          })
          prodCompDispatch({ type: 'FETCH_DATA_SUCCESS' })
          updateLastFetchTime(tabName)
        }
      })
    } else if (tabName === 'Vulnerabilities' && shouldFetchData(tabName)) {
      const { field, direction, searchInput, severities, components, statues, source, kev, epss, direct } = prodVulnState
      const vulnEpss = epss !== 'all' && epss !== '' ? epss.split('-').map((v) => parseFloat(v) / 10000) : undefined
      getVulnData({
        ...commonParams,
        search: getUndefinedIfEmpty(searchInput),
        source: source === true ? undefined : 'COMPONENT',
        severity: getUndefinedIfEmptyOrAll(severities),
        componentName: getUndefinedIfEmptyOrAll(components),
        status: getUndefinedIfEmptyOrAll(statues),
        kev: kev === 'yes' ? true : kev === 'no' ? false : undefined,
        epss:
          epss !== '' && epss !== 'all'
            ? { min: parseFloat(vulnEpss[0]) / 100, max: parseFloat(vulnEpss[1]) / 100 }
            : undefined,
        direct: direct === true ? true : undefined,
        field: field,
        direction: direction
      }).then((res) => {
        if (res.data) {
          prodVulnDispatch({ type: 'SET_TOTAL_VULNS', payload: res?.data?.shareLynkQuery?.sbom?.vulns?.totalCount })
          prodVulnDispatch({ type: 'FETCH_DATA_SUCCESS' })
          updateLastFetchTime(tabName)
        }
      })
    } else if (tabName === 'Licenses' && shouldFetchData(tabName)) {
      getLicensesData({ variables: { ...commonParams }})
      .then((res) => {
        if (res.data) {
          updateLastFetchTime(tabName)
        }
      })
    }
  }

  useEffect(() => {
    setActiveCsSbomTab(activeTab)
    fetchTabData(activeTab)
  }, [activeTab, setActiveCsSbomTab])

  return (
    <Card>
      <Tabs variant='enclosed' index={activeCsSbomTab} onChange={(value) => handleTabChange(value)}>
        {/* TAB LIST */}
        <TabList mt='20px'>
          {Object.values(tabIndexToName).map((item, index) => (
            <Tab key={index} _focus={{ outline: 'none' }} isDisabled={item === 'Parts' || item === 'Checks' || item === 'Change Log' || item === 'Support' || item === 'Relationships'}>
              {(item === 'Parts' || item === 'Checks' || item === 'Change Log' || item === 'Support' || item === 'Relationships') && (
                <FaLock color='darkgray' style={{ marginRight: '6px' }} />
              )}
              {item}
            </Tab>
          ))}
        </TabList>
        {/* TAB PANELS */}
        <TabPanels>
          {/* GENERAL TABLE */}
          <TabPanel px={1}>
            {data ? (
              <GeneralDataRow status={status} type={type} data={data} refetch={refetch} />
            ) : (
              <Flex width={'100%'} gap={4} direction={'column'}>
                <Skeleton width={'100%'} height='20px' />
                <Skeleton width={'100%'} height='20px' />
                <Skeleton width={'100%'} height='20px' />
                <Skeleton width={'100%'} height='20px' />
                <Skeleton width={'100%'} height='20px' />
              </Flex>
            )}
          </TabPanel>
          {/* PARTS TABLE */}
          <TabPanel px={1}></TabPanel>
          {/* COMPONENT TABLE */}
          <TabPanel px={0}>
            {data && (
              <ComponentTable type={type} lifecycle={data.lifecycle} data={compData?.sbom?.components} refetch={getCompData} sbomRefetch={refetch} primaryComp={data.primaryComponent} />
            )}
            {error && (
              <Flex py={10} flexDirection={'column'} gap={2} width={'70%'} mx={'auto'} alignItems={'center'} justifyContent={'center'}>
                <Text color={'red.500'} textAlign={'center'}>{error.message}</Text>
                <Text>Something went wrong. Please refresh this page</Text>
                <Button mt={2} variant='solid' colorScheme='blue' fontWeight={'normal'} onClick={() => window.location.reload()}>
                  Refresh
                </Button>
              </Flex>
            )}
          </TabPanel>
          {/* VUNERABILITIES TABLE */}
          <TabPanel px={0}>
            <VulnTable data={vulnData?.sbom?.vulns} sbomData={data} sbomRefetch={refetch} filteredData={filteredData} refetch={getVulnData} productId={productId} sbomId={sbomId} />
          </TabPanel>
          {/* LICENSES TABLE */}
          <TabPanel px={0}>
            <SbomLicenseTable data={licensesData?.shareLynkQuery?.sbom?.componentLicenses} />
          </TabPanel>
          {/* SUPPORT TABLE */}
          <TabPanel px={0}></TabPanel>
          {/* RELATIONSHIPS TABLE */}
          <TabPanel px={0}></TabPanel>
          {/* CHECKS TABLE */}
          <TabPanel px={1}></TabPanel>
          {/* CHANGE LOG TABLE */}
          <TabPanel px={1}></TabPanel>
        </TabPanels>
      </Tabs>
    </Card>
  )
}

export default SbomTable
