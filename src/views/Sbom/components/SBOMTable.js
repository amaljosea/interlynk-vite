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
import { useLazyQuery } from '@apollo/client'
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

  // PAGINATION STATS FOR DIFFERENT TABS
  const [componentIndex, setComponentIndex] = useState(1)
  const [vulnIndex, setVulnIndex] = useState(1)
  const [resultIndex, setResultIndex] = useState(1)
  const [changelogIndex, setChangelogIndex] = useState(1)

  // GET COMPONENT DATA
  const [getComponents, { data: compData }] = useLazyQuery(GetComponentData)

  // GET VULN DATA
  const [getVulns, { data: vulnData }] = useLazyQuery(GetVulnData)

  // GET HEALTH CHECK DATA
  const [getResults, { data: checkData }] = useLazyQuery(GetCheckResults)

  // GET CHANGE LOG DATA
  const [getLogs, { data: logsData }] = useLazyQuery(GetChangeLogs)

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
      getComponents({
        variables: {
          projectId: productId,
          sbomId: sbomId,
          first: 10,
          last: undefined,
          field: 'NAME',
          direction: 'ASC'
        }
      }).then(() => setComponentIndex(1))
    } else if (tabIndex === 2) {
      getVulns({
        variables: {
          projectId: productId,
          sbomId: sbomId,
          first: 10,
          last: undefined,
          field: 'UPDATED_AT',
          direction: 'ASC'
        }
      }).then(() => setVulnIndex(1))
    } else if (tabIndex === 3) {
      getResults({
        variables: {
          projectId: productId,
          sbomId: sbomId,
          first: 10,
          last: undefined,
          field: 'STATUS',
          direction: 'DESC'
        }
      }).then(() => setResultIndex(1))
    } else {
      getLogs({
        variables: {
          projectId: productId,
          sbomId: sbomId,
          first: 10,
          last: undefined,
          field: 'CREATED_AT',
          direction: 'ASC'
        }
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
              {compData ? (
                <ComponentTable
                  type={type}
                  lifecycle={lifecycle}
                  data={compData.sbom.components}
                  getComponents={getComponents}
                  pageIndex={componentIndex}
                  setPageIndex={setComponentIndex}
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
                  getVulns={getVulns}
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
              {checkData ? (
                <HealthCheckTable
                  productId={productId}
                  sbomId={sbomId}
                  data={checkData.sbom.checkResults}
                  getResults={getResults}
                  components={components}
                  pageIndex={resultIndex}
                  setPageIndex={setResultIndex}
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
                  getLogs={getLogs}
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
