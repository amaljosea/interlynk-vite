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
  Menu,
  MenuButton,
  MenuList,
  MenuOptionGroup,
  MenuItemOption,
  Badge,
  useToast,
  Text,
  Input,
  Stack
} from '@chakra-ui/react'
import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import SBOMComponentRow from 'components/Tables/SBOMComponentRow.js'
import GeneralDataRow from 'components/Tables/GeneralDataRow'
import GeneralDataDrawer from 'components/Drawer/GeneralDataDrawer'
import CardHeader from 'components/Card/CardHeader'
import ComponentDrawer from 'components/Drawer/ComponentDrawer'
import GlobalContext from 'context/GlobalContext'
import HealthCheckRow from 'components/Tables/HealthCheckRow'
import ProductSbomDrawer from 'components/Drawer/ProductSbomDrawer'
import ChangelogRow from 'components/Tables/ChangelogRow'
import ComponentTable from 'components/Tables/ComponentTable'
import PriSupplierModal from './PriSupplierModal'
import FilterMenu from './FilterMenu'

// ICONS
import { AddIcon } from '@chakra-ui/icons'
import { FaFilter } from 'react-icons/fa'
import VulnTable from 'components/Tables/VulnTable'
import FilterChangelog from './FilterChangelog'

const SBOMTable = ({
  data,
  refetch,
  handlePreviousPage,
  handleNextPage,
  status,
  productId,
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

  const { isOpen, onOpen, onClose } = useDisclosure()

  const {
    isOpen: isCompOpen,
    onOpen: onCompOpen,
    onClose: onCompClose,
    onToggle: onCompToggle
  } = useDisclosure()

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
  const compBtn = useRef(null)
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

  const handleFilterChange = (selectedFilters) => {
    if (
      selectedFilters.severity.length === 0 &&
      selectedFilters.shortDesc.length === 0
    ) {
      // IF NO FILTER SELECTED RETURN DEFAULT HEALTH CHECK DATA
      setFilteredData(healthCheckData)
    } else {
      // IF ANY FILTER IS SELECTED RETURN SELECTED DATA
      const filtered = healthCheckData.filter(
        (item) =>
          (selectedFilters.severity.length === 0 ||
            selectedFilters.severity.includes(item.severity)) &&
          (selectedFilters.shortDesc.length === 0 ||
            selectedFilters.shortDesc.includes(item.shortDesc))
      )
      setFilteredData(filtered)
    }
  }

  const handleChangelogChange = (selectedFilters) => {
    if (
      selectedFilters.type.length === 0 &&
      selectedFilters.user.length === 0
    ) {
      // IF NO FILTER SELECTED RETURN DEFAULT HEALTH CHECK DATA
      setFilteredChangelog(changelogData)
    } else {
      // IF ANY FILTER IS SELECTED RETURN SELECTED DATA
      const filtered = changelogData.filter(
        (item) =>
          (selectedFilters.type.length === 0 ||
            selectedFilters.type.includes(item.type)) &&
          (selectedFilters.user.length === 0 ||
            selectedFilters.user.includes(item.changedBy))
      )
      setFilteredChangelog(filtered)
    }
  }

  // EXTRACT ALL SEVERITY OPTIONS FROM HEALTH CHECK DATA
  const severityOptions = [
    ...new Set(healthCheckData.map((item) => item.severity))
  ]

  // EXTRACT ALL SHORT DESC STRING FROM HEALTH CHECK DATA
  const shortDescOptions = [
    ...new Set(healthCheckData.map((item) => item.shortDesc))
  ]

  // ADD KEYBOARD SHORTCUT FOR TOGGLE COMPONENT DRAWER
  const handleCompDown = (event) => {
    if (event.altKey && event.key === 'c') {
      onCompToggle()
    }
  }

  // ADD KEYBOARD SHORTCUT FOR TOGGLE SBOM DRAWER
  const handleSBMDown = (event) => {
    if (event.altKey && event.key === 's') {
      onSBMToggle()
    }
  }

  // KEYBOARD EVENT LISTNER FOR COMPONENT DRAWER
  useEffect(() => {
    window.addEventListener('keydown', handleCompDown)

    return () => {
      window.removeEventListener('keydown', handleCompDown)
    }
  }, [])

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
            <TabPanel>
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
            <TabPanel>
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
            <TabPanel>
              <CardBody>
                <VulnTable data={productVulData} />
              </CardBody>
            </TabPanel>
            {/* HEALTH CHECK TABLE */}
            <TabPanel>
              <CardHeader width='100%' mt={1.5}>
                <Flex
                  width={'100%'}
                  alignItems={'center'}
                  justifyContent={'space-between'}
                >
                  <Stack
                    width={'100%'}
                    direction={'row'}
                    spacing={4}
                    alignItems={'flex-start'}
                  >
                    <Input
                      width={'400px'}
                      id='search'
                      type='text'
                      placeholder='Search'
                      aria-label='Search Input'
                    />

                    <FilterMenu
                      severityOptions={severityOptions}
                      shortDescOptions={shortDescOptions}
                      onFilterChange={handleFilterChange}
                    />
                  </Stack>
                </Flex>
              </CardHeader>
              <CardBody overflowX={'scroll'}>
                <Table
                  // __css={{ tableLayout: 'fixed', width: 'full' }}
                  variant='simple'
                  color={textColor}
                  size='sm'
                  mt={6}
                >
                  <Thead>
                    <Tr my='.8rem' pl='0px'>
                      {[
                        'Check Id',
                        'Severity',
                        'Category',
                        'Long Description',
                        'Status'
                      ].map((caption, idx) => {
                        return (
                          <Th key={idx} ps={idx === 0 ? '0px' : null} pb={4}>
                            <Box>{caption}</Box>
                          </Th>
                        )
                      })}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredData.length > 0 &&
                      filteredData.map((item, index) => (
                        <HealthCheckRow
                          key={index}
                          id={item.id}
                          healthId={item.healthCheckId}
                          severity={item.severity}
                          shortDesc={item.shortDesc}
                          longDesc={item.longDesc}
                          status={item.status}
                          updateIdenifier={updateIdenifier}
                        />
                      ))}
                  </Tbody>
                </Table>
              </CardBody>
              {filteredData.length === 0 && (
                <Flex
                  width={'100%'}
                  alignItems={'center'}
                  justifyContent={'center'}
                  pt={10}
                >
                  <Text>No data found</Text>
                </Flex>
              )}
            </TabPanel>
            {/* CHANGELOG TABLE */}
            <TabPanel>
              <CardHeader mt={1.5}>
                <Flex
                  width={'100%'}
                  alignItems={'center'}
                  justifyContent={'space-between'}
                >
                  <Stack
                    width={'100%'}
                    direction={'row'}
                    spacing={4}
                    alignItems={'flex-start'}
                  >
                    <Input
                      width={'400px'}
                      id='search'
                      type='text'
                      placeholder='Search'
                      aria-label='Search Input'
                    />

                    {/* FILTER TYPE AND USERS */}
                    <FilterChangelog onFilterChange={handleChangelogChange} />
                  </Stack>
                </Flex>
              </CardHeader>
              <CardBody overflowX={'scroll'}>
                <Table
                  // __css={{ tableLayout: 'flex', width: '100%' }}
                  variant='simple'
                  color={textColor}
                  size='sm'
                  mt={6}
                >
                  <Thead>
                    <Tr my='1.8rem' pl='0px'>
                      {[
                        'Type',
                        'Object',
                        'Previous Value',
                        'New Value',
                        'Changed By',
                        'Time'
                      ].map((caption, idx) => {
                        return (
                          <Th key={idx} ps={idx === 0 ? '0px' : null} pb={1}>
                            <Box>{caption}</Box>
                          </Th>
                        )
                      })}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredChangelog.length > 0 &&
                      filteredChangelog.map((item, index) => (
                        <ChangelogRow
                          key={index}
                          id={item.id}
                          type={item.type}
                          object={item.object}
                          prevValue={item.prevValue}
                          newValue={item.newValue}
                          changedBy={item.changedBy}
                          time={item.time}
                        />
                      ))}
                  </Tbody>
                </Table>
              </CardBody>
              {filteredChangelog.length === 0 && (
                <Flex
                  width={'100%'}
                  alignItems={'center'}
                  justifyContent={'center'}
                  pt={10}
                >
                  <Text>No data found</Text>
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
