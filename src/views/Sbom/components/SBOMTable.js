import React, { useEffect, useState } from 'react'
// CHAKRA IMPORTS
import {
  Tabs,
  TabList,
  Tab,
  TabPanel,
  TabPanels,
  Flex,
  Skeleton
} from '@chakra-ui/react'
import Card from 'components/Card/Card.js'

// TABLES
import GeneralDataRow from 'components/Tables/GeneralDataRow'
import ComponentTable from 'components/Tables/ComponentTable'
import VulnTable from 'components/Tables/VulnTable'
import HealthCheckTable from 'components/Tables/HealthCheckTable'
import SbomChangelogTable from 'components/Tables/SbomChangelogTable'

// API QUERIES
import { useLazyQuery, useQuery } from '@apollo/client'
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
  lifecycle
}) => {
  const tab = window.localStorage.getItem('activeProdTab')

  const [tabIndex, setTabIndex] = useState(Number(tab))
  const [isLoading, setIsLoading] = useState(false)
  // PAGINATION STATS FOR DIFFERENT TABS
  const [componentIndex, setComponentIndex] = useState(1)
  const [vulnIndex, setVulnIndex] = useState(1)
  const [resultIndex, setResultIndex] = useState(1)
  const [changelogIndex, setChangelogIndex] = useState(1)

  // GET COMPONENT DATA
  const {
    data: compData,
    refetch: compRefetch,
    error
  } = useQuery(GetComponentData, {
    variables: {
      projectId: productId,
      sbomId: sbomId,
      first: 10,
      field: 'NAME',
      direction: 'ASC'
    }
  })

  // GET VULN DATA
  const { data: vulnData, refetch: vulnRefetch } = useQuery(GetVulnData, {
    variables: {
      projectId: productId,
      sbomId: sbomId,
      first: 10,
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
        first: 10,
        field: 'STATUS',
        direction: 'DESC'
      }
    }
  )

  // GET CHANGE LOG DATA
  const { data: logsData, refetch: logsRefetch } = useQuery(GetChangeLogs, {
    variables: {
      projectId: productId,
      sbomId: sbomId,
      first: 10,
      field: 'CREATED_AT',
      direction: 'DESC'
    }
  })

  // ON TAB CHANGE
  const onTabChange = (value) => {
    setTabIndex(value)
    window.localStorage.setItem('activeProdTab', value)
  }

  // ONLY FETCH SPECIFIC DATA BASED ON SELECTED TAB
  useEffect(() => {
    if (tabIndex === 0) {
      refetch({
        projectId: productId,
        sbomId: sbomId
      })
    } else if (tabIndex === 1) {
      compRefetch({
        projectId: productId,
        sbomId: sbomId,
        first: 10,
        field: 'NAME',
        direction: 'ASC'
      }).then(() => setComponentIndex(1))
    } else if (tabIndex === 2) {
      vulnRefetch({
        projectId: productId,
        sbomId: sbomId,
        first: 10,
        field: 'UPDATED_AT',
        direction: 'ASC'
      }).then(() => setVulnIndex(1))
    } else if (tabIndex === 3) {
      healthRefetch({
        projectId: productId,
        sbomId: sbomId,
        first: 10,
        last: undefined,
        field: 'STATUS',
        direction: 'DESC'
      }).then(() => setResultIndex(1))
    } else {
      logsRefetch({
        projectId: productId,
        sbomId: sbomId,
        first: 10,
        field: 'CREATED_AT',
        direction: 'DESC'
      }).then(() => setChangelogIndex(1))
    }
  }, [tabIndex])

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
  //   if (error) {
  //     console.log(error.graphQLErrors)
  //   }
  // }, [error])

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
              <Tab key={index} _focus={{ outline: 'none' }} isDisabled={error}>
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
              {compData && data ? (
                <ComponentTable
                  type={type}
                  lifecycle={lifecycle}
                  data={compData.sbom.components}
                  error={error}
                  refetch={compRefetch}
                  pageIndex={componentIndex}
                  setPageIndex={setComponentIndex}
                  primaryComp={data.primaryComponent}
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
            {/* VUNERABILITIES TABLE */}
            <TabPanel px={0}>
              {vulnData ? (
                <VulnTable
                  data={vulnData.sbom.vulns}
                  refetch={vulnRefetch}
                  productId={productId}
                  sbomId={sbomId}
                  pageIndex={vulnIndex}
                  setPageIndex={setVulnIndex}
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
              {checkData && isLoading === false ? (
                <HealthCheckTable
                  productId={productId}
                  sbomId={sbomId}
                  data={checkData.sbom.checkResults}
                  refetch={healthRefetch}
                  components={components}
                  pageIndex={resultIndex}
                  setPageIndex={setResultIndex}
                  setIsLoading={setIsLoading}
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
