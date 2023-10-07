import React, { useEffect, useRef, useState, useContext } from 'react'
import { useLocation } from 'react-router-dom'
// Chakra imports
import {
  Table,
  Tbody,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  TabPanels,
  useDisclosure,
  Button,
  Flex,
  Box,
  useToast
} from '@chakra-ui/react'
import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import GeneralDataRow from 'components/Tables/GeneralDataRow'
import GeneralDataDrawer from 'components/Drawer/GeneralDataDrawer'
import GlobalContext from 'context/GlobalContext'
import ProductSbomDrawer from 'components/Drawer/ProductSbomDrawer'
import ComponentTable from 'components/Tables/ComponentTable'
import PriSupplierModal from './PriSupplierModal'

import VulnTable from 'components/Tables/VulnTable'
import HealthCheckTable from 'components/Tables/HealthCheckTable'
import ChangelogTable from 'components/Tables/ChangelogTable'
import { GetCheckResults } from 'graphQL/Queries'
import { useQuery } from '@apollo/client'

const SBOMTable = ({
  data,
  refetch,
  handlePreviousPage,
  handleNextPage,
  status,
  productId,
  sbomId,
  type,
  pageIndex
}) => {
  const { healthCheckData, changelogData, productVulData } = useContext(
    GlobalContext
  )
  const textColor = useColorModeValue('gray.700', 'white')
  const toast = useToast()
  const location = useLocation()
  const customerView = location.pathname.startsWith('/customer')

  const [pageIdx, setPageIdx] = useState(1)

  const { data: results, refetch: refetchResults } = useQuery(GetCheckResults, {
    variables: {
      projectId: productId,
      sbomId: sbomId,
      first: 10,
      field: 'STATUS',
      direction: 'ASC'
    }
  })

  const onPreviousPage = () => {
    setPageIdx((prev) => pageIndex !== 0 && prev - 1)
    refetchResults({
      projectId: productId,
      sbomId: sbomId,
      first: undefined,
      last: 10,
      before: results.sbom.checkResults.pageInfo.startCursor,
      after: ''
    })
  }

  const onNextPage = () => {
    setPageIdx(
      (prev) =>
        prev < Math.ceil(results?.sbom.checkResults.totalCount) && prev + 1
    )
    refetchResults({
      projectId: productId,
      sbomId: sbomId,
      first: 10,
      last: undefined,
      after: results.sbom.checkResults.pageInfo.endCursor,
      before: ''
    })
  }

  const { isOpen, onOpen, onClose } = useDisclosure()

  const {
    isOpen: isSBMOpen,
    onOpen: setSBMOpen,
    onClose: setSBMClose,
    onToggle: onSBMToggle
  } = useDisclosure()

  const {
    isOpen: isSupOpen,
    onOpen: onSupOpen,
    onClose: onSupClose
  } = useDisclosure()

  const btnRef = useRef(null)
  const licenseBtn = useRef(null)

  const [selectedKey, setSelectedKey] = useState('')

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

  // ADD KEYBOARD SHORTCUT FOR TOGGLE SBOM DRAWER
  const handleSBMDown = (event) => {
    if (event.altKey && event.key === '2') {
      onSBMToggle()
    }
  }

  // KEYBOARD EVENT LISTNER FOR SBOM DRAWER
  useEffect(() => {
    window.addEventListener('keydown', handleSBMDown)

    return () => {
      window.removeEventListener('keydown', handleSBMDown)
    }
  }, [])

  return (
    <>
      <Card>
        <Tabs variant='enclosed'>
          <TabList mt='20px'>
            <Tab _focus={{ outline: 'none' }}>General</Tab>
            <Tab _focus={{ outline: 'none' }}>Components</Tab>
            <Tab _focus={{ outline: 'none' }}>Vulnerabilities</Tab>
            <Tab _focus={{ outline: 'none' }}>Checks</Tab>
            <Tab _focus={{ outline: 'none' }}>Change Log</Tab>
          </TabList>
          <TabPanels>
            {/* GENERAL TABLE */}
            <TabPanel px={1}>
              <CardBody>
                <Table
                  __css={{ tableLayout: 'fixed', width: 'full' }}
                  variant='simple'
                  color={textColor}
                  size='sm'
                  mt={10}
                >
                  <Thead>
                    <Tr>
                      <Th></Th>
                      <Th></Th>
                      <Th></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    <GeneralDataRow
                      onOpen={onOpen}
                      setSelectedKey={setSelectedKey}
                      data={data}
                      status={status}
                      btnRef={licenseBtn}
                      onSbomOpen={setSBMOpen}
                      onSupOpen={onSupOpen}
                      refetch={refetch}
                    />
                  </Tbody>
                </Table>
              </CardBody>
            </TabPanel>
            {/* COMPONENT TABLE */}
            <TabPanel px={0}>
              <CardBody>
                <ComponentTable
                  data={data.components.nodes}
                  refetch={refetch}
                  type={type}
                />
              </CardBody>
              {/* pagination */}
              {data && (
                <Flex
                  flexDir={'row'}
                  gap={4}
                  alignItems={'center'}
                  mt={6}
                  justifyContent={'flex-start'}
                >
                  <Button
                    colorScheme='blue'
                    onClick={handlePreviousPage}
                    isDisabled={!data.components.pageInfo.hasPreviousPage}
                  >
                    Previous
                  </Button>
                  <Button
                    colorScheme='blue'
                    onClick={handleNextPage}
                    isDisabled={!data.components.pageInfo.hasNextPage}
                  >
                    Next
                  </Button>
                  <Box>
                    Page {pageIndex} of{' '}
                    {Math.ceil(data.components.totalCount / 10)}
                  </Box>
                </Flex>
              )}
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
              {results && (
                <>
                  <CardBody>
                    <HealthCheckTable
                      data={results.sbom.checkResults.nodes}
                      setFilteredData={setFilteredData}
                      refetch={refetchResults}
                      productId={productId}
                      sbomId={sbomId}
                    />
                  </CardBody>
                  {/* pagination */}
                  {filteredData && (
                    <Flex
                      flexDir={'row'}
                      gap={4}
                      alignItems={'center'}
                      mt={6}
                      justifyContent={'flex-start'}
                    >
                      <Button
                        colorScheme='blue'
                        onClick={onPreviousPage}
                        isDisabled={
                          !results.sbom.checkResults.pageInfo.hasPreviousPage
                        }
                      >
                        Previous
                      </Button>
                      <Button
                        colorScheme='blue'
                        onClick={onNextPage}
                        isDisabled={
                          !results.sbom.checkResults.pageInfo.hasNextPage
                        }
                      >
                        Next
                      </Button>
                      <Box>
                        Page {pageIdx} of{' '}
                        {Math.ceil(results.sbom.checkResults.totalCount / 10)}
                      </Box>
                    </Flex>
                  )}
                </>
              )}
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

      {/* SBOM DRAWER */}
      {isSBMOpen && data && !customerView && (
        <ProductSbomDrawer
          isOpen={isSBMOpen}
          onClose={setSBMClose}
          btnRef={licenseBtn}
          projectId={productId}
          name={data.project.name}
          refetch={refetch}
          sbomData={data}
          type={type}
        />
      )}

      {/* GENERAL DRAWER */}
      {data && isOpen && (
        <GeneralDataDrawer
          isOpen={isOpen}
          onClose={onClose}
          btnRef={btnRef}
          data={data}
          selectedKey={selectedKey}
          refetch={refetch}
        />
      )}

      {/* SUPPLIER MODAL */}
      {isSupOpen && data && (
        <PriSupplierModal
          refetch={refetch}
          isOpen={isSupOpen}
          onClose={onSupClose}
          suppliers={data.suppliers}
        />
      )}
    </>
  )
}

export default SBOMTable
