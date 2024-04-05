import { useLazyQuery } from '@apollo/client'
import React, { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { parseJSONSafely } from 'utils'

import {
  Button,
  Flex,
  Skeleton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text
} from '@chakra-ui/react'

import Card from 'components/Card/Card.js'
import ComponentTable from 'components/Tables/ComponentTable'
import GeneralDataRow from 'components/Tables/GeneralDataRow'
import HealthCheckTable from 'components/Tables/HealthCheckTable'
import PartsTable from 'components/Tables/PartsTable'
import PolicyEvalTable from 'components/Tables/PolicyEvalTable'
import SbomChangelogTable from 'components/Tables/SbomChangelogTable'
import SupportTable from 'components/Tables/SupportTable'
import VulnTable from 'components/Tables/VulnTable'

import { useGlobalState } from 'hooks/useGlobalState'

import {
  GetChangeLogs,
  GetCheckResults,
  GetSbomLicensesTable,
  GetSbomParts,
  GetSbomSupportTab
} from 'graphQL/Queries'
import { PolicyResults } from 'graphQL/Queries'

import SbomLicenseTable from '../../../components/Licenses/SbomLicenseTable'

const SBOMTable = ({
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
  // How often each tab should refetch the data (in minutes)
  const fetchIntervalMinutes = {
    General: 0,
    Parts: 0,
    Components: 0,
    Vulnerabilities: 0.5,
    Licenses: 0,
    Policies: 0,
    Support: 0,
    Checks: 0,
    'Change Log': 0
  }

  const [lastFetchTime, setLastFetchTime] = useState({
    General: null,
    Parts: null,
    Components: null,
    Vulnerabilities: null,
    Licenses: null,
    Policies: null,
    Support: null,
    Checks: null,
    'Change Log': null
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

  const {
    totalRows,
    userPermissions,
    activeSbomTab,
    setActiveSbomTab,
    prodCompState,
    prodVulnState,
    prodCheckState,
    sbomLogState,
    dispatch
  } = useGlobalState()
  const {
    prodCompDispatch,
    prodVulnDispatch,
    prodCheckDispatch,
    sbomLogDispatch
  } = dispatch

  const vulnsPermissions = useMemo(
    () => userPermissions?.find((item) => item.key === 'view_feeds'),
    [userPermissions]
  )

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('id')
  const sbomId = queryParams.get('sbom')
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')
  const activeTab = Number(localStorage.getItem('activeSbomTab') || 0)
  const subProduct = (() => {
    try {
      return parseJSONSafely(localStorage.getItem('subProduct'))
    } catch (error) {
      console.log(error)
      return null
    }
  })()

  const [activeComp, setActiveComp] = useState(null)

  // GET SBOM PARTS
  const [getPartsData, { data: partsData }] = useLazyQuery(GetSbomParts, {
    fetchPolicy: 'network-only'
  })

  // GET HEALTH CHECK DATA
  const [getChecksData, { data: checksData }] = useLazyQuery(GetCheckResults, {
    fetchPolicy: 'network-only'
  })

  // GET CHANGE LOG DATA
  const [getLogsData, { data: logsData, refetch: logsRefetch }] = useLazyQuery(
    GetChangeLogs,
    { fetchPolicy: 'network-only' }
  )

  // GET COMPONENT SUPPORT INFO
  const [getSupportInfos, { data: support }] = useLazyQuery(GetSbomSupportTab, {
    fetchPolicy: 'network-only'
  })

  // GET LICENSES DATA
  const [getLicensesData, { data: licensesData, refetch: licensesRefetch }] =
    useLazyQuery(GetSbomLicensesTable, { fetchPolicy: 'network-only' })

  // GET POLICY DATA
  const [getPolicyData, { data: policyData }] = useLazyQuery(PolicyResults, {
    fetchPolicy: 'network-only'
  })

  const getUndefinedIfEmpty = (value) => (value !== '' ? value : undefined)
  const getUndefinedIfEmptyOrAll = (value, allValue = 'all') =>
    value.includes(allValue) || value.length === 0 ? undefined : value

  const tabIndexToName = {
    0: 'General',
    1: 'Parts',
    2: 'Components',
    3: 'Vulnerabilities',
    4: 'Licenses',
    5: 'Policies',
    6: 'Support',
    7: 'Checks',
    8: 'Change Log'
  }

  const handleTabChange = (value) => {
    localStorage.setItem('activeSbomTab', value)
    setActiveSbomTab(value)
  }

  useEffect(() => {
    setActiveSbomTab(activeTab)
    fetchTabData(activeTab)
  }, [activeTab, setActiveSbomTab])

  const fetchTabData = (activeTab) => {
    const commonParams = {
      projectId: productId,
      sbomId: sbomId,
      first: totalRows,
      last: undefined,
      after: undefined,
      before: undefined
    }
    const tabName = tabIndexToName[activeTab]
    if (tabName === 'General' && shouldFetchData(tabName)) {
      refetch({ ...commonParams }).then(() => updateLastFetchTime(tabName))
    } else if (tabName === 'Parts') {
      getPartsData({ variables: { ...commonParams } }).then(() =>
        updateLastFetchTime(tabName)
      )
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
        direct
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
        direct: direct === true ? true : undefined,
        field,
        direction
      }).then((res) => {
        if (res.data) {
          prodCompDispatch({
            type: 'SET_TOTAL_COMP',
            payload: res.data.sbom.components.totalCount
          })
          prodCompDispatch({ type: 'FETCH_DATA_SUCCESS' })
          updateLastFetchTime(tabName)
        }
      })
    } else if (
      tabName === 'Vulnerabilities' &&
      shouldFetchData(tabName) &&
      vulnsPermissions?.value === true
    ) {
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
        direct,
        vexComplete
      } = prodVulnState
      const vulnEpss =
        epss !== 'all' && epss !== ''
          ? epss.split('-').map((v) => parseFloat(v) / 10000)
          : undefined
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
            ? { min: vulnEpss[0], max: vulnEpss[1] }
            : undefined,
        direct: direct === 'direct only' ? true : undefined,
        vexComplete: vexComplete === 'all' ? undefined : false,
        field,
        direction
      }).then((res) => {
        if (res.data) {
          prodVulnDispatch({
            type: 'SET_TOTAL_VULNS',
            payload: res.data.sbom.vulns.totalCount
          })
          prodVulnDispatch({ type: 'FETCH_DATA_SUCCESS' })
          updateLastFetchTime(tabName)
        }
      })
    } else if (tabName === 'Licenses' && shouldFetchData(tabName)) {
      getLicensesData({ variables: { ...commonParams } }).then((res) => {
        if (res.data) {
          updateLastFetchTime(tabName)
        }
      })
    } else if (tabName === 'Policies' && shouldFetchData(tabName)) {
      getPolicyData({ variables: { sbomId: sbomId, first: totalRows } }).then(
        (res) => {
          if (res.data) {
            updateLastFetchTime(tabName)
          }
        }
      )
    } else if (tabName === 'Support' && shouldFetchData(tabName)) {
      getSupportInfos({ variables: { projectId: productId, sbomId } }).then(
        (res) => {
          if (res?.data) {
            updateLastFetchTime(tabName)
          }
        }
      )
    } else if (tabName === 'Checks' && shouldFetchData(tabName)) {
      const {
        field,
        direction,
        searchInput,
        rules,
        categories,
        severities,
        statues
      } = prodCheckState
      getChecksData({
        variables: {
          ...commonParams,
          search: getUndefinedIfEmpty(searchInput),
          checkId: getUndefinedIfEmptyOrAll(rules),
          category: getUndefinedIfEmptyOrAll(categories),
          severity: getUndefinedIfEmptyOrAll(severities),
          status: getUndefinedIfEmptyOrAll(statues),
          field: field || 'CHECK_RESULTS_UPDATED_AT',
          direction: direction || 'DESC'
        }
      }).then((res) => {
        if (res.data) {
          prodCheckDispatch({ type: 'FETCH_DATA_SUCCESS' })
          updateLastFetchTime(tabName)
        }
      })
    } else if (tabName === 'Change Log' && shouldFetchData(tabName)) {
      const { field, direction, searchInput } = sbomLogState
      getLogsData({
        variables: {
          ...commonParams,
          search: searchInput !== '' ? searchInput : undefined,
          field,
          direction
        }
      }).then((res) => {
        if (res.data) {
          sbomLogDispatch({ type: 'FETCH_DATA_SUCCESS' })
          updateLastFetchTime(tabName)
        }
      })
    }
  }

  return (
    <>
      <Card>
        <Tabs
          variant='enclosed'
          index={activeSbomTab}
          onChange={(value) => handleTabChange(value)}
        >
          {/* TAB LIST */}
          <TabList mt='20px'>
            {Object.values(tabIndexToName).map((item, index) => (
              <Tab
                key={index}
                _focus={{ outline: 'none' }}
                display={
                  item === 'Parts' &&
                  subProduct?.name &&
                  subProduct?.childOne?.name &&
                  subProduct?.childTwo?.name &&
                  subProduct?.childThree?.name &&
                  subProduct?.childFour?.name
                    ? 'none'
                    : 'flex'
                }
                isDisabled={
                  signedUrlParams &&
                  (item === 'Checks' || item === 'Change Log')
                }
              >
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
            {/* PARTS TABLE */}
            <TabPanel px={0}>
              <PartsTable
                data={partsData?.sbom?.sbomParts}
                refetch={getPartsData}
                getVulnData={getVulnData}
                getCompData={getCompData}
              />
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
                  activeComp={activeComp}
                  setActiveComp={setActiveComp}
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
              {vulnsPermissions?.value === true ? (
                <VulnTable
                  data={vulnData?.sbom?.vulns}
                  sbomData={data}
                  sbomRefetch={refetch}
                  filteredData={filteredData}
                  refetch={getVulnData}
                  productId={productId}
                  sbomId={sbomId}
                />
              ) : (
                <Text mt={4} textAlign={'center'}>
                  You don't have permission to access this data
                </Text>
              )}
            </TabPanel>
            {/* LICENSES TABLE */}
            <TabPanel px={0}>
              <SbomLicenseTable
                data={licensesData?.sbom?.componentLicenses}
                refetch={licensesRefetch}
              />
            </TabPanel>
            {/* POLICY TABLE */}
            <TabPanel px={0}>
              <PolicyEvalTable
                data={policyData?.policyResults}
                refetch={getPolicyData}
              />
            </TabPanel>
            {/* SUPPORT TABLE */}
            <TabPanel px={0}>
              <SupportTable
                data={support?.sbom?.supports}
                refetch={getSupportInfos}
              />
            </TabPanel>
            {/* HEALTH CHECK TABLE */}
            <TabPanel px={0}>
              {data && (
                <HealthCheckTable
                  productId={productId}
                  sbomId={sbomId}
                  sbomData={data}
                  data={checksData?.sbom?.checkResults}
                  refetch={getChecksData}
                  components={compData?.sbom?.components.nodes.map((item) => ({
                    value: item.name,
                    id: item.id
                  }))}
                />
              )}
            </TabPanel>
            {/* CHANGELOG TABLE */}
            <TabPanel px={0}>
              <SbomChangelogTable
                data={logsData?.sbom?.activityLogs}
                refetch={logsRefetch}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>
    </>
  )
}

export default SBOMTable
