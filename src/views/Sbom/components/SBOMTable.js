import React, { useEffect, useState, useContext } from 'react'
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
  useToast,
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
import { GetCheckResults } from 'graphQL/Queries'
import { useLazyQuery } from '@apollo/client'
import { GetComponentData } from 'graphQL/Queries'

const SBOMTable = ({
  status,
  productId,
  sbomId,
  type,
  data,
  refetch,
  lifecycle
}) => {
  const { healthCheckData, changelogData, productVulData } = useContext(
    GlobalContext
  )
  const toast = useToast()

  const tab = window.localStorage.getItem('activeProdTab')

  const [filteredData, setFilteredData] = useState(healthCheckData)
  const [filteredChangelog, setFilteredChangelog] = useState(changelogData)

  const updateIdenifier = () => {
    toast({
      description: 'A unique identifier has been added to the component',
      status: 'success',
      duration: 3000,
      position: 'top'
    })
  }

  const handleTabClick = (value) => {
    window.history.pushState(
      null,
      null,
      `/vendor/products?tab=${value}&p=${productId}&sbom=${sbomId}`
    )
    window.localStorage.setItem('activeProdTab', value)
  }

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
                  data={data.sbom}
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
              <ComponentTable type={type} lifecycle={lifecycle} />
            </TabPanel>
            {/* VUNERABILITIES TABLE */}
            <TabPanel px={0}>
              <CardBody>
                <VulnTable data={productVulData} />
              </CardBody>
              {/* pagination */}
              {productVulData && (
                <Flex
                  flexDir={'row'}
                  gap={4}
                  alignItems={'center'}
                  mt={6}
                  justifyContent={'flex-start'}
                >
                  <Button colorScheme='blue'>Previous</Button>
                  <Button colorScheme='blue'>Next</Button>
                  <Box>Page 1 of 1</Box>
                </Flex>
              )}
            </TabPanel>
            {/* HEALTH CHECK TABLE */}
            <TabPanel px={0}>
              <HealthCheckTable productId={productId} sbomId={sbomId} />
            </TabPanel>
            {/* CHANGELOG TABLE */}
            <TabPanel px={0}>
              <CardBody>
                <ChangelogTable
                  data={filteredChangelog}
                  setFilteredChangelog={setFilteredChangelog}
                />
              </CardBody>
              {/* pagination */}
              {filteredChangelog && (
                <Flex
                  flexDir={'row'}
                  gap={4}
                  alignItems={'center'}
                  mt={6}
                  justifyContent={'flex-start'}
                >
                  <Button colorScheme='blue'>Previous</Button>
                  <Button colorScheme='blue'>Next</Button>
                  <Box>Page 1 of 1</Box>
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
