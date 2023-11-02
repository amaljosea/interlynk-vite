import React, { useContext, useEffect, useState } from 'react'
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
import {
  GetCheckResults,
  GetComponentData,
  GetVulnData,
  GetChangeLogs,
  GetCompFilterData,
  GetVulnFilterData,
  GetCheckFilterData,
  GetLogsFilterData
} from 'graphQL/Queries'
import { useLocation } from 'react-router-dom'
import GlobalContext from 'context/GlobalContext'

const SBOMTable = ({
  status,
  type,
  data,
  refetch,
  filteredData,
  setComponents,
  setTotalComp,
  vulnData,
  getVulnData
}) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)

  const productId = queryParams.get('p')
  const sbomId = queryParams.get('sbom')

  const {
    setCompFilters,
    setVulnFilters,
    setCheckFilters,
    setLogFilters,
    compField,
    compDirection,
    checkField,
    checkDirection,
    logField,
    logDirection,
    totalRows,
    setTotalRows,
    activeProdTab,
    setActiveProdTab
  } = useContext(GlobalContext)

  const tab = window.localStorage.getItem('activeProdTab')

  const { lifecycle } = data

  // PAGINATION STATS FOR DIFFERENT TABS
  const [componentIndex, setComponentIndex] = useState(1)
  const [vulnIndex, setVulnIndex] = useState(1)
  const [resultIndex, setResultIndex] = useState(1)
  const [changelogIndex, setChangelogIndex] = useState(1)

  // GET COMPONENT DATA
  const [
    getCompData,
    { data: compData, refetch: compRefetch, error, loading }
  ] = useLazyQuery(GetComponentData)

  useEffect(() => {
    if (compData) {
      setComponents(compData.sbom.components.nodes)
      setTotalComp(compData.sbom.components.totalCount)
    }
  }, [compData])

  // GET HEALTH CHECK DATA
  const [getCheckData, { data: checkData, refetch: healthRefetch }] =
    useLazyQuery(GetCheckResults)

  // GET CHANGE LOG DATA
  const [getLogData, { data: logsData, refetch: logsRefetch }] =
    useLazyQuery(GetChangeLogs)

  // GET COMPONENT FILTER HEADS
  const [getCompFilters, { refetch: compFilterRefetch }] =
    useLazyQuery(GetCompFilterData)

  // GET VULN FILTER HEADS
  const [getVulnFilters, { refetch: vulnFilterRefetch }] =
    useLazyQuery(GetVulnFilterData)

  // GET HEALTH CHECK FILTER HEADS
  const [getCheckFilters, { refetch: checkFilterRefetch }] =
    useLazyQuery(GetCheckFilterData)

  // GET LOGS FILTER HEADS
  const [getLogsFilters] = useLazyQuery(GetLogsFilterData)

  // FETCH COMPONENT DATA
  useEffect(() => {
    if (compData === undefined) {
      getCompData({
        variables: {
          projectId: productId,
          sbomId: sbomId,
          first: totalRows,
          field: compField,
          direction: compDirection
        }
      })
    }
  }, [])

  // FETCH HEALTH CHECK DATA
  useEffect(() => {
    if (checkData === undefined) {
      getCheckData({
        variables: {
          projectId: productId,
          sbomId: sbomId,
          first: totalRows,
          field: checkField,
          direction: checkDirection
        }
      })
    }
  }, [])

  // FETCH ACTIVITY LOGS DATA
  useEffect(() => {
    if (logsData === undefined) {
      getLogData({
        variables: {
          projectId: productId,
          sbomId: sbomId,
          first: totalRows,
          field: logField,
          direction: logDirection
        }
      })
    }
  }, [])

  // FETCH FILTER DATA BASE ON SELECTED TAB
  useEffect(() => {
    if (activeProdTab === 0) {
      refetch({
        projectId: productId,
        sbomId: sbomId
      })
    } else if (activeProdTab === 1) {
      getCompFilters({
        variables: {
          projectId: productId,
          sbomId: sbomId
        }
      }).then((res) => {
        if (res.data) {
          setCompFilters(res.data.sbom.filters)
        }
      })
    } else if (activeProdTab === 2) {
      getVulnFilters({
        variables: {
          projectId: productId,
          sbomId: sbomId
        }
      }).then((res) => {
        if (res.data) {
          setVulnFilters(res.data.sbom.filters)
        }
      })
    } else if (activeProdTab === 3) {
      getCheckFilters({
        variables: {
          projectId: productId,
          sbomId: sbomId
        }
      }).then((res) => {
        if (res.data) {
          setCheckFilters(res.data.sbom.filters)
        }
      })
    } else if (activeProdTab === 4) {
      logsRefetch({
        projectId: productId,
        sbomId: sbomId,
        first: totalRows,
        field: logField,
        direction: logDirection
      })
      getLogsFilters({
        variables: {
          projectId: productId,
          sbomId: sbomId
        }
      }).then((res) => {
        if (res.data) {
          setLogFilters(res.data.sbom.filters)
        }
      })
    }
  }, [activeProdTab])

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
          index={activeProdTab}
          onChange={(value) => setActiveProdTab(Number(value))}
        >
          {/* TAB LIST */}
          <TabList mt='20px'>
            {[
              'General',
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
            {/* COMPONENT TABLE */}
            <TabPanel px={0}>
              {compData && data && (
                <ComponentTable
                  type={type}
                  lifecycle={lifecycle}
                  data={compData.sbom.components}
                  loading={loading}
                  error={error}
                  refetch={compRefetch}
                  filterRefetch={compFilterRefetch}
                  pageIndex={componentIndex}
                  setPageIndex={setComponentIndex}
                  primaryComp={data.primaryComponent}
                  totalRows={totalRows}
                  setTotalRows={setTotalRows}
                />
              )}

              {loading && (
                <Flex width={'100%'} gap={4} direction={'column'}>
                  <Skeleton width={'100%'} height='20px' />
                  <Skeleton width={'100%'} height='20px' />
                  <Skeleton width={'100%'} height='20px' />
                  <Skeleton width={'100%'} height='20px' />
                  <Skeleton width={'100%'} height='20px' />
                </Flex>
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
                filterRefetch={vulnFilterRefetch}
                pageIndex={vulnIndex}
                setPageIndex={setVulnIndex}
                totalRows={totalRows}
                setTotalRows={setTotalRows}
              />
            </TabPanel>
            {/* HEALTH CHECK TABLE */}
            <TabPanel px={0}>
              {checkData && data ? (
                <HealthCheckTable
                  productId={productId}
                  sbomId={sbomId}
                  sbomData={data}
                  data={checkData.sbom.checkResults}
                  refetch={healthRefetch}
                  filterRefetch={checkFilterRefetch}
                  components={components}
                  pageIndex={resultIndex}
                  setPageIndex={setResultIndex}
                  totalRows={totalRows}
                  setTotalRows={setTotalRows}
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
            {/* CHANGELOG TABLE */}
            <TabPanel px={0}>
              {logsData ? (
                <SbomChangelogTable
                  data={logsData.sbom.activityLogs}
                  refetch={logsRefetch}
                  pageIndex={changelogIndex}
                  setPageIndex={setChangelogIndex}
                  totalRows={totalRows}
                  setTotalRows={setTotalRows}
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
          </TabPanels>
        </Tabs>
      </Card>
    </>
  )
}

export default SBOMTable
