import React, { useContext } from 'react'
// Chakra imports
import {
  Tabs,
  TabList,
  Tab,
  TabPanel,
  TabPanels,
  Button,
  Flex,
  Box,
  Skeleton
} from '@chakra-ui/react'
import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import GeneralDataRow from 'components/Tables/GeneralDataRow'
import GlobalContext from 'context/GlobalContext'
import ComponentTable from 'components/Tables/ComponentTable'
import VulnTable from 'components/Tables/VulnTable'
import HealthCheckTable from 'components/Tables/HealthCheckTable'
import ChangelogTable from 'components/Tables/ChangelogTable'

const SBOMTable = ({
  status,
  productId,
  sbomId,
  type,
  data,
  refetch,
  lifecycle,
  compData,
  compRefetch,
  checkData,
  checkRefetch,
  logsData,
  logsRefetch,
  vulnData,
  vulnRefetch,
  filteredData
}) => {
  const { productVulData } = useContext(GlobalContext)

  const tab = window.localStorage.getItem('activeProdTab')

  const handleTabClick = (value) => {
    window.history.pushState(
      null,
      null,
      `/vendor/products?tab=${value}&p=${productId}&sbom=${sbomId}`
    )
    window.localStorage.setItem('activeProdTab', value)

    if (value === 0) {
    }

    switch (value) {
      case 0:
        return refetch({
          projectId: productId,
          sbomId: sbomId
        })
      case 1:
        return compRefetch({
          projectId: productId,
          sbomId: sbomId,
          first: 10,
          field: 'NAME',
          direction: 'ASC'
        })
      case 2:
        vulnRefetch({
          projectId: productId,
          sbomId: sbomId,
          first: 10,
          field: 'UPDATED_AT',
          direction: 'ASC'
        })
      case 3:
        return checkRefetch({
          projectId: productId,
          sbomId: sbomId,
          first: 10,
          field: 'STATUS',
          direction: 'DESC'
        })
      case 4:
        return logsRefetch({
          projectId: productId,
          sbomId: sbomId,
          first: 10,
          field: 'CREATED_AT',
          direction: 'ASC'
        })
    }
  }

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
        <Tabs variant='enclosed' defaultIndex={tab ? Number(tab) : 0}>
          {/* TAB LIST */}
          <TabList mt='20px'>
            <Tab _focus={{ outline: 'none' }} onClick={() => handleTabClick(0)}>
              General
            </Tab>
            <Tab _focus={{ outline: 'none' }} onClick={() => handleTabClick(1)}>
              Components
            </Tab>
            <Tab _focus={{ outline: 'none' }} onClick={() => handleTabClick(2)}>
              Vulnerabilities
            </Tab>
            <Tab _focus={{ outline: 'none' }} onClick={() => handleTabClick(3)}>
              Checks
            </Tab>
            <Tab _focus={{ outline: 'none' }} onClick={() => handleTabClick(4)}>
              Change Log
            </Tab>
          </TabList>
          {/* TAB PANEL */}
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
                  refetch={compRefetch}
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
              {/* pagination */}
              {vulnData ? (
                <VulnTable
                  data={vulnData}
                  refetch={vulnRefetch}
                  productId={productId}
                  sbomId={sbomId}
                  filteredData={filteredData}
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
                  data={checkData}
                  refetch={checkRefetch}
                  components={components}
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
                <ChangelogTable data={logsData} refetch={logsRefetch} />
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
