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
  Input
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
import { Vulnerabilities } from 'variables/general'
import VulnTable from 'components/Tables/VulnTable'

const SBOMTable = ({
  data,
  refetch,
  handlePreviousPage,
  handleNextPage,
  status,
  productId,
  type
}) => {
  const { healthCheckData, changelogData } = useContext(GlobalContext)

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
  const [filterType, setFilterType] = useState('')
  const [filterUser, setFilterUser] = useState('')
  const [filteredData, setFilteredData] = useState(healthCheckData)

  // FILTER CHANGE LOG BASED ON TYPE AND USER
  const filterChangelog = changelogData.filter((item) => {
    return item.type.includes(filterType) && item.changedBy.includes(filterUser)
  })

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
      <Card my='22px'>
        <Tabs variant='enclosed'>
          <TabList mt='20px'>
            <Tab _focus={{ outline: 'none' }}>General</Tab>
            <Tab _focus={{ outline: 'none' }}>Components</Tab>
            <Tab _focus={{ outline: 'none' }}>Vulnerabilities</Tab>
            <Tab _focus={{ outline: 'none' }}>Health checks</Tab>
            <Tab _focus={{ outline: 'none' }}>Change log</Tab>
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
              {!customerView && (
                <CardHeader>
                  <Flex
                    width={'100%'}
                    alignItems={'flex-end'}
                    justifyContent={'flex-end'}
                  >
                    <Button
                      ref={compBtn}
                      onClick={onCompOpen}
                      leftIcon={<AddIcon />}
                      colorScheme='blue'
                      variant='solid'
                      mb={6}
                      fontSize={'sm'}
                      isDisabled={data.lifecycle === 'signed'}
                    >
                      Component
                    </Button>
                  </Flex>
                </CardHeader>
              )}
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
                </Flex>
              )}
            </TabPanel>
            {/* VUNERABILITIES TABLE */}
            <TabPanel>
              <CardBody>
                <VulnTable data={Vulnerabilities} />
              </CardBody>
            </TabPanel>
            {/* HEALTH CHECK TABLE */}
            <TabPanel>
              <CardHeader>
                <FilterMenu
                  severityOptions={severityOptions}
                  shortDescOptions={shortDescOptions}
                  onFilterChange={handleFilterChange}
                />
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
              <CardHeader>
                <Flex
                  width={'100%'}
                  alignItems={'flex-end'}
                  justifyContent={'flex-end'}
                  pos={'relative'}
                  gap={3}
                >
                  {/* TYPE FILTER */}
                  <Menu closeOnSelect={true}>
                    <MenuButton
                      as={Button}
                      colorScheme='blue'
                      fontWeight='normal'
                      fontSize={'sm'}
                      leftIcon={<FaFilter size={14} />}
                    >
                      Type
                    </MenuButton>
                    <MenuList minWidth='240px'>
                      <MenuOptionGroup
                        type='radio'
                        value={filterType}
                        onChange={(value) => setFilterType(value)}
                      >
                        <MenuItemOption
                          value={'All'}
                          fontSize={'sm'}
                          textTransform={'capitalize'}
                          onClick={() => setFilterType('')}
                        >
                          All
                        </MenuItemOption>
                        {['added', 'modified', 'deleted'].map((p, index) => (
                          <MenuItemOption
                            value={p}
                            key={index}
                            fontSize={'sm'}
                            textTransform={'capitalize'}
                          >
                            {p}
                          </MenuItemOption>
                        ))}
                      </MenuOptionGroup>
                    </MenuList>
                  </Menu>
                  {/* USER FILTER */}
                  <Menu closeOnSelect={true}>
                    <MenuButton
                      as={Button}
                      colorScheme='blue'
                      fontWeight='normal'
                      fontSize={'sm'}
                      leftIcon={<FaFilter size={14} />}
                    >
                      User
                    </MenuButton>
                    <MenuList minWidth='240px'>
                      <MenuOptionGroup
                        type='radio'
                        value={filterUser}
                        onChange={(value) => setFilterUser(value)}
                      >
                        <MenuItemOption
                          value={'All'}
                          fontSize={'sm'}
                          textTransform={'capitalize'}
                          onClick={() => setFilterUser('')}
                        >
                          All
                        </MenuItemOption>
                        {[
                          'Abhisek Paul',
                          'Brian B.',
                          'Ritesh Noronha',
                          'Shubham Shete',
                          'Surandra Pathak'
                        ].map((p, index) => (
                          <MenuItemOption
                            value={p}
                            key={index}
                            fontSize={'sm'}
                            textTransform={'capitalize'}
                          >
                            {p}
                          </MenuItemOption>
                        ))}
                      </MenuOptionGroup>
                    </MenuList>
                  </Menu>
                </Flex>
              </CardHeader>
              <CardBody overflowX={'scroll'}>
                <Table
                  __css={{ tableLayout: 'flex', width: '100%' }}
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
                    {filterChangelog.length > 0 &&
                      filterChangelog.map((item, index) => (
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
              {filterChangelog.length === 0 && (
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

      {/* COMPONENT DRAWER */}
      {isCompOpen && data && !customerView && (
        <ComponentDrawer
          isOpen={isCompOpen}
          onClose={onCompClose}
          btnRef={compBtn}
          component={''}
          version={''}
          license={''}
          type={type}
          cpes={[]}
          purl={''}
          primary={false}
          internal={false}
          refetch={refetch}
          suppliers={null}
          shortDesc={null}
        />
      )}
    </>
  )
}

export default SBOMTable
