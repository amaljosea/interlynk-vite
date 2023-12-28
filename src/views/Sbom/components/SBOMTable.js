import React, { useEffect } from 'react'
// CHAKRA IMPORTS
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
import Card from 'components/Card/Card.js'

// TABLES
import GeneralDataRow from 'components/Tables/GeneralDataRow'
import ComponentTable from 'components/Tables/ComponentTable'
import VulnTable from 'components/Tables/VulnTable'
import HealthCheckTable from 'components/Tables/HealthCheckTable'
import SbomChangelogTable from 'components/Tables/SbomChangelogTable'

// API QUERIES
import { useLazyQuery } from '@apollo/client'
import { GetCheckResults, GetChangeLogs } from 'graphQL/Queries'
import { useLocation } from 'react-router-dom'
import PartsTable from 'components/Tables/PartsTable'
import { GetSbomParts } from 'graphQL/Queries'
import { useGlobalState } from 'hooks/useGlobalState'

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
  const {
    totalRows,
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

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)

  const productId = queryParams.get('id')
  const sbomId = queryParams.get('sbom')

  const activeTab = Number(localStorage.getItem('activeSbomTab'))

  const { lifecycle } = data

  // GET SBOM PARTS
  const [getParts, { data: parts }] = useLazyQuery(GetSbomParts, {
    fetchPolicy: 'network-only'
  })

  // GET HEALTH CHECK DATA
  const [getCheckData, { data: checkData }] = useLazyQuery(GetCheckResults, {
    fetchPolicy: 'network-only'
  })

  // GET CHANGE LOG DATA
  const [getLogData, { data: logsData, refetch: logsRefetch }] = useLazyQuery(
    GetChangeLogs,
    {
      fetchPolicy: 'network-only'
    }
  )

  const handleTabChange = (value) => {
    localStorage.setItem('activeSbomTab', value)
    setActiveSbomTab(value)
  }

  useEffect(() => {
    if (activeTab === 0) {
      setActiveSbomTab(0)
      refetch({
        projectId: productId,
        sbomId: sbomId
      })
    } else if (activeTab === 1) {
      setActiveSbomTab(1)
      getParts({
        variables: {
          projectId: productId,
          sbomId: sbomId
        }
      })
    } else if (activeTab === 2) {
      const {
        field,
        direction,
        searchInput,
        ecosystems,
        kinds,
        licenses,
        suppliers,
        scope
      } = prodCompState
      setActiveSbomTab(2)
      // FETCH COMPONENT DATA
      getCompData({
        variables: {
          projectId: productId,
          sbomId: sbomId,
          search: searchInput !== '' ? searchInput : undefined,
          ecosystem:
            ecosystems.includes('all') || ecosystems.length === 0
              ? undefined
              : ecosystems,
          kind: kinds.includes('all') || kinds.length === 0 ? undefined : kinds,
          licenses:
            licenses.includes('all') || licenses.length === 0
              ? undefined
              : licenses,
          supplierName:
            suppliers.includes('all') || suppliers.length === 0
              ? undefined
              : suppliers,
          primary: scope === 'primary' ? true : undefined,
          internal: scope === 'internal' ? true : undefined,
          first: totalRows,
          field: field,
          direction: direction
        }
      }).then((res) => {
        if (res.data) {
          prodCompDispatch({
            type: 'SET_TOTAL_COMP',
            payload: res.data.sbom.components.totalCount
          })
          prodCompDispatch({ type: 'FETCH_DATA_SUCCESS' })
        }
      })
    } else if (activeTab === 3) {
      const {
        field,
        direction,
        searchInput,
        severities,
        components,
        statues,
        kev,
        epss
      } = prodVulnState
      const vulnEpss = epss !== 'all' && epss !== '' && epss.split('-')
      const range = {
        min: parseFloat(vulnEpss[0]) / 10000,
        max: parseFloat(vulnEpss[1]) / 10000
      }
      setActiveSbomTab(3)
      getVulnData({
        projectId: productId,
        sbomId: sbomId,
        first: totalRows,
        last: undefined,
        after: undefined,
        before: undefined,
        search: searchInput !== '' ? searchInput : undefined,
        severity: severities.length > 0 ? severities : undefined,
        componentName: components.length > 0 ? components : undefined,
        status: statues.length > 0 ? statues : undefined,
        kev: kev === 'yes' ? true : kev === 'no' ? false : undefined,
        epss: epss !== '' && epss !== 'all' ? range : undefined,
        field: field,
        direction: direction
      }).then((res) => {
        if (res.data) {
          prodVulnDispatch({
            type: 'SET_TOTAL_VULNS',
            payload: res.data.sbom.vulns.totalCount
          })
          prodVulnDispatch({ type: 'FETCH_DATA_SUCCESS' })
        }
      })
    } else if (activeTab === 4) {
      const {
        field,
        direction,
        searchInput,
        rules,
        categories,
        severities,
        statues
      } = prodCheckState
      setActiveSbomTab(4)
      // FETCH HEALTH CHECK DATA
      getCheckData({
        variables: {
          projectId: productId,
          sbomId: sbomId,
          search: searchInput !== '' ? searchInput : undefined,
          checkId:
            rules.includes('all') || rules.length === 0 ? undefined : rules,
          category:
            categories.includes('all') || categories.length === 0
              ? undefined
              : categories,
          severity:
            severities.includes('all') || severities.length === 0
              ? undefined
              : severities,
          status:
            statues.includes('all') || statues.length === 0
              ? undefined
              : statues,
          first: totalRows,
          field: field,
          direction: direction
        }
      }).then(
        (res) => res.data && prodCheckDispatch({ type: 'FETCH_DATA_SUCCESS' })
      )
    } else if (activeTab === 5) {
      const { field, direction } = sbomLogState
      setActiveSbomTab(5)
      // FETCH ACTIVITY LOGS DATA
      getLogData({
        variables: {
          projectId: productId,
          sbomId: sbomId,
          first: totalRows,
          field: field,
          direction: direction
        }
      }).then(
        (res) => res.data && sbomLogDispatch({ type: 'FETCH_DATA_SUCCESS' })
      )
    }
  }, [activeTab])

  // EXTRACT ALL THE COMPONENT NAME AND ID'S FROM SELECTED SBOM VERSION
  const components =
    compData &&
    compData.sbom.components.nodes.map((item) => {
      return {
        value: item.name,
        id: item.id
      }
    })

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
            {[
              'General',
              'Parts',
              'Components',
              'Vulnerabilities',
              'Checks',
              'Change Log'
            ].map((item, index) => (
              <Tab key={index} _focus={{ outline: 'none' }}>
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
                data={parts?.sbom.sbomParts}
                refetch={getParts}
                getVulnData={getVulnData}
                getCompData={getCompData}
              />
            </TabPanel>
            {/* COMPONENT TABLE */}
            <TabPanel px={0}>
              {data && (
                <ComponentTable
                  type={type}
                  lifecycle={lifecycle}
                  data={compData?.sbom?.components}
                  refetch={getCompData}
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
                filteredData={filteredData}
                refetch={getVulnData}
                productId={productId}
                sbomId={sbomId}
              />
            </TabPanel>
            {/* HEALTH CHECK TABLE */}
            <TabPanel px={0}>
              {data && (
                <HealthCheckTable
                  productId={productId}
                  sbomId={sbomId}
                  sbomData={data}
                  data={checkData?.sbom?.checkResults}
                  refetch={getCheckData}
                  components={components}
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
