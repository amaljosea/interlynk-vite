import { useGlobalState } from 'hooks/useGlobalState'
import React, { useEffect, useState } from 'react'
import {
  Tabs,
  TabList,
  Tab,
  TabPanel,
  TabPanels,
  Flex,
  Skeleton,
  Button,
  Text
} from '@chakra-ui/react'
import GeneralDataRow from 'components/Tables/GeneralDataRow'
import ComponentTable from 'components/Tables/ComponentTable'
import VulnTable from 'components/Tables/VulnTable'
import { useLocation } from 'react-router-dom'
import Card from 'components/Card/Card'
import { FaLock } from 'react-icons/fa6'

const SbomTable = ({
  status,
  type,
  data,
  refetch,
  filteredData,
  vulnData,
  getVulnData,
  getCompData,
  compData,
  error
}) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('id')
  const sbomId = queryParams.get('sbom')
  const activeTab = Number(localStorage.getItem('activeCsSbomTab') || 0)
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')

  const {
    activeCsSbomTab,
    setActiveCsSbomTab,
    totalRows,
    prodCompState,
    prodVulnState,
    dispatch
  } = useGlobalState()
  const { prodCompDispatch, prodVulnDispatch } = dispatch

  // How often each tab should refetch the data (in minutes)
  const fetchIntervalMinutes = {
    General: 0,
    Components: 0,
    Vulnerabilities: 1
  }

  const [lastFetchTime, setLastFetchTime] = useState({
    General: null,
    Components: null,
    Vulnerabilities: null
  })

  const shouldFetchData = (tabName) => {
    const lastFetch = lastFetchTime[tabName]
    const now = new Date()

    if (!lastFetch) return true // If never fetched, fetch data

    const minutesElapsed = (now - lastFetch) / 60000
    return minutesElapsed >= fetchIntervalMinutes[tabName]
  }

  const updateLastFetchTime = (tabName) => {
    setLastFetchTime({ ...lastFetchTime, [tabName]: new Date() })
  }

  const getUndefinedIfEmpty = (value) => (value !== '' ? value : undefined)

  const getUndefinedIfEmptyOrAll = (value, allValue = 'all') =>
    value.includes(allValue) || value.length === 0 ? undefined : value

  const tabIndexToName = {
    0: 'General',
    1: 'Components',
    2: 'Vulnerabilities',
    3: 'Checks',
    4: 'Change Log'
  }

  const handleTabChange = (value) => {
    localStorage.setItem('activeCsSbomTab', value)
    setActiveCsSbomTab(value)
  }

  const fetchTabData = (activeTab) => {
    const commonParams = {
      projectId: signedUrlParams ? undefined : productId,
      sbomId: sbomId,
      first: totalRows,
      last: undefined,
      after: undefined,
      before: undefined
    }

    const tabName = tabIndexToName[activeTab]

    if (tabName === 'General' && shouldFetchData(tabName)) {
      refetch({
        ...commonParams
      }).then(() => {
        updateLastFetchTime(tabName)
      })
    } else if (tabName === 'Components' && shouldFetchData(tabName)) {
      const {
        field,
        direction,
        searchInput,
        ecosystems,
        kinds,
        licenses,
        suppliers,
        scope,
      } = prodCompState

      getCompData({
        ...commonParams,
        search: getUndefinedIfEmpty(searchInput),
        ecosystem: getUndefinedIfEmptyOrAll(ecosystems),
        kind: getUndefinedIfEmptyOrAll(kinds),
        licenses: getUndefinedIfEmptyOrAll(licenses),
        supplierName: getUndefinedIfEmptyOrAll(suppliers),
        primary: scope === 'primary' ? true : undefined,
        internal: scope === 'internal' ? true : undefined,
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
      const {
        field,
        direction,
        searchInput,
        severities,
        components,
        statues,
        source,
        kev,
        epss,
      } = prodVulnState
      console.log('source', source)

      const vulnEpss =
        epss !== 'all' && epss !== ''
          ? epss.split('-').map((v) => parseFloat(v) / 10000)
          : undefined
      getVulnData({
        ...commonParams,
        search: getUndefinedIfEmpty(searchInput),
        source: source === 'BOTH' || source === '' ? undefined : source,
        severity: getUndefinedIfEmptyOrAll(severities),
        componentName: getUndefinedIfEmptyOrAll(components),
        status: getUndefinedIfEmptyOrAll(statues),
        kev: kev === 'yes' ? true : kev === 'no' ? false : undefined,
        epss:
          epss !== '' && epss !== 'all'
            ? { min: vulnEpss[0], max: vulnEpss[1] }
            : undefined,
        field: field,
        direction: direction
      }).then((res) => {
        if (res.data) {
          prodVulnDispatch({
            type: 'SET_TOTAL_VULNS',
            payload: res?.data?.shareLynkQuery?.sbom?.vulns?.totalCount
          })
          prodVulnDispatch({ type: 'FETCH_DATA_SUCCESS' })
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
      <Tabs
        variant='enclosed'
        index={activeCsSbomTab}
        onChange={(value) => handleTabChange(value)}
      >
        {/* TAB LIST */}
        <TabList mt='20px'>
          {Object.values(tabIndexToName).map((item, index) => (
            <Tab
              key={index}
              _focus={{ outline: 'none' }}
              isDisabled={item === 'Checks' || item === 'Change Log'}
            >
              {(item === 'Checks' || item === 'Change Log') && (
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
              <GeneralDataRow
                status={status}
                type={type}
                data={data}
                refetch={refetch}
              />
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
          {/* COMPONENT TABLE */}
          <TabPanel px={0}>
            {data && (
              <ComponentTable
                type={type}
                lifecycle={data.lifecycle}
                data={compData?.sbom?.components}
                refetch={getCompData}
                sbomRefetch={refetch}
                primaryComp={data.primaryComponent}
              />
            )}
            {error && (
              <Flex
                py={10}
                flexDirection={'column'}
                gap={2}
                width={'70%'}
                mx={'auto'}
                alignItems={'center'}
                justifyContent={'center'}
              >
                <Text color={'red.500'} textAlign={'center'}>
                  {error.message}
                </Text>
                <Text>Something went wrong. Please refresh this page</Text>
                <Button
                  mt={2}
                  variant='solid'
                  colorScheme='blue'
                  fontWeight={'normal'}
                  onClick={() => window.location.reload()}
                >
                  Refresh
                </Button>
              </Flex>
            )}
          </TabPanel>
          {/* VUNERABILITIES TABLE */}
          <TabPanel px={0}>
            <VulnTable
              data={vulnData?.sbom?.vulns}
              sbomData={data}
              sbomRefetch={refetch}
              filteredData={filteredData}
              refetch={getVulnData}
              productId={productId}
              sbomId={sbomId}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Card>
  )
}

export default SbomTable
