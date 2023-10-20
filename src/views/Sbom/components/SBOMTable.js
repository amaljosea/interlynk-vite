import React, { useEffect, useState } from 'react'
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
import { useQuery } from '@apollo/client'
import {
  GetCheckResults,
  GetComponentData,
  GetVulnData,
  GetChangeLogs
} from 'graphQL/Queries'

const SBOMTable = ({
  status,
  productId,
  sbomId,
  type,
  data,
  refetch,
  lifecycle,
  filteredData,
  setComponents,
  compFilters,
  compFilterRefetch,
  vulnFilters,
  vulnFilterRefetch,
  checkFilters,
  checkFilterRefetch,
  logsFilters
}) => {
  const tab = window.localStorage.getItem('activeProdTab')

  const [tabIndex, setTabIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  // PAGINATION STATS FOR DIFFERENT TABS
  const [componentIndex, setComponentIndex] = useState(1)
  const [vulnIndex, setVulnIndex] = useState(1)
  const [resultIndex, setResultIndex] = useState(1)
  const [changelogIndex, setChangelogIndex] = useState(1)

  const [totalRows, setTotalRows] = useState(25)

  // GET COMPONENT DATA
  const {
    data: compData,
    refetch: compRefetch,
    error,
    loading
  } = useQuery(GetComponentData, {
    variables: {
      projectId: productId,
      sbomId: sbomId,
      first: totalRows,
      field: 'UPDATED_AT',
      direction: 'DESC'
    }
  })

  useEffect(() => {
    if (compData) {
      setComponents(compData.sbom.components.nodes)
    }
  }, [compData])

  // GET VULN DATA
  const { data: vulnData, refetch: vulnRefetch } = useQuery(GetVulnData, {
    variables: {
      projectId: productId,
      sbomId: sbomId,
      first: totalRows,
      field: 'UPDATED_AT',
      direction: 'ASC'
    }
  })

  // GET HEALTH CHECK DATA
  const { data: checkData, refetch: healthRefetch } = useQuery(
    GetCheckResults,
    {
      variables: {
        projectId: productId,
        sbomId: sbomId,
        first: totalRows,
        field: 'UPDATED_AT',
        direction: 'DESC'
      }
    }
  )

  // GET CHANGE LOG DATA
  const { data: logsData, refetch: logsRefetch } = useQuery(GetChangeLogs, {
    variables: {
      projectId: productId,
      sbomId: sbomId,
      first: totalRows,
      field: 'CREATED_AT',
      direction: 'DESC'
    }
  })

  // ON TAB CHANGE
  const onTabChange = (value) => {
    setTabIndex(value)
    window.localStorage.setItem('activeProdTab', value)

    if (value === 4) {
      logsRefetch({
        projectId: productId,
        sbomId: sbomId,
        first: totalRows,
        field: 'CREATED_AT',
        direction: 'DESC'
      }).then((res) => res.data && setChangelogIndex(1))
    }

    // if (value === 0) {
    //   refetch({
    //     projectId: productId,
    //     sbomId: sbomId
    //   })
    // } else if (value === 1) {
    //   compRefetch({
    //     projectId: productId,
    //     sbomId: sbomId,
    //     first: totalRows,
    //     field: 'UPDATED_AT',
    //     direction: 'DESC'
    //   }).then((res) => {
    //     if (res.data) {
    //       setComponentIndex(1)
    //     }
    //   })
    // } else if (value === 2) {
    //   vulnRefetch({
    //     projectId: productId,
    //     sbomId: sbomId,
    //     first: totalRows,
    //     field: 'UPDATED_AT',
    //     direction: 'ASC'
    //   }).then((res) => res.data && setVulnIndex(1))
    // } else if (value === 3) {
    //   healthRefetch({
    //     projectId: productId,
    //     sbomId: sbomId,
    //     first: totalRows,
    //     field: 'STATUS',
    //     direction: 'DESC'
    //   }).then((res) => res.data && setResultIndex(1))
    // } else if (value === 4) {
    //   logsRefetch({
    //     projectId: productId,
    //     sbomId: sbomId,
    //     first: totalRows,
    //     field: 'CREATED_AT',
    //     direction: 'DESC'
    //   }).then((res) => res.data && setChangelogIndex(1))
    // }
  }

  // EXTRACT ALL THE COMPONENT NAME AND ID'S FROM SELECTED SBOM VERSION
  const components =
    compData &&
    compData.sbom.components.nodes.map((item) => {
      return {
        value: item.name,
        id: item.id
      }
    })

  // useEffect(() => {
  //   if (tabIndex === 1) {
  //     getCompFilters({
  //       variables: {
  //         projectId: productId,
  //         sbomId: sbomId
  //       }
  //     })
  //   } else if (tabIndex === 2) {
  //     getVulnFilters({
  //       variables: {
  //         projectId: productId,
  //         sbomId: sbomId
  //       }
  //     })
  //   } else if (tabIndex === 3) {
  //     getCheckFilters({
  //       variables: {
  //         projectId: productId,
  //         sbomId: sbomId
  //       }
  //     })
  //   } else {
  //     getLogsFilters({
  //       variables: {
  //         projectId: productId,
  //         sbomId: sbomId
  //       }
  //     })
  //   }
  // }, [tabIndex])

  return (
    <>
      <Card>
        <Tabs
          variant='enclosed'
          defaultIndex={tabIndex}
          onChange={(e) => onTabChange(e)}
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
              {compData && data && compFilters && (
                <ComponentTable
                  type={type}
                  lifecycle={lifecycle}
                  data={compData.sbom.components}
                  error={error}
                  refetch={compRefetch}
                  filterHeads={compFilters}
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
              {vulnData && vulnFilters ? (
                <VulnTable
                  data={vulnData.sbom.vulns}
                  filteredData={filteredData}
                  refetch={vulnRefetch}
                  productId={productId}
                  sbomId={sbomId}
                  filterHeads={vulnFilters}
                  filterRefetch={vulnFilterRefetch}
                  pageIndex={vulnIndex}
                  setPageIndex={setVulnIndex}
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
            {/* HEALTH CHECK TABLE */}
            <TabPanel px={0}>
              {checkData && isLoading === false && checkFilters ? (
                <HealthCheckTable
                  productId={productId}
                  sbomId={sbomId}
                  data={checkData.sbom.checkResults}
                  refetch={healthRefetch}
                  filterHeads={checkFilters}
                  filterRefetch={checkFilterRefetch}
                  components={components}
                  pageIndex={resultIndex}
                  setPageIndex={setResultIndex}
                  setIsLoading={setIsLoading}
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
              {logsData && logsFilters ? (
                <SbomChangelogTable
                  data={logsData.sbom.activityLogs}
                  refetch={logsRefetch}
                  pageIndex={changelogIndex}
                  filterHeads={logsFilters}
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
