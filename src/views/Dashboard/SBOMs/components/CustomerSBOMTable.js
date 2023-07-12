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
  Flex,
  Input,
  Menu,
  MenuButton,
  Button,
  MenuOptionGroup,
  MenuList,
  MenuItemOption,
  Box,
  MenuDivider,
  MenuGroup,
  MenuItem,
  Skeleton,
  Td
} from '@chakra-ui/react'

import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import VulnerabilityRow from 'components/Tables/VulnerabilityRow.js'
import SBOMComponentRow from 'components/Tables/SBOMComponentRow.js'
import GlobalContext from 'context/GlobalContext'
import React, { useState } from 'react'
import { useContext } from 'react'
import { useEffect } from 'react'
import CardHeader from 'components/Card/CardHeader'
import { sbom } from 'variables/general'
import {
  ChevronDownIcon,
  TriangleDownIcon,
  TriangleUpIcon
} from '@chakra-ui/icons'
import { useRef } from 'react'
import CustomerComponentRow from 'components/Tables/CustomerComponentRow'
import { BsFilterRight } from 'react-icons/bs'

const CustomerSBOMTable = ({
  data,
  loading,
  refetch,
  imgVersionId,
  imageInfo,
  filteredVul,
  setFilteredVulItems
}) => {
  const { vulnerabilitiesData, setVulnerabilitiesData } = useContext(
    GlobalContext
  )
  const textColor = useColorModeValue('gray.700', 'white')

  const [filteredRow, setFilteredRow] = useState([])
  const [sortedVulnData, setSortedVulnData] = useState([])

  const [searchVul, setSearchVul] = useState('')

  // const [selectedOptions, setSelectedOptions] = useState([])
  const [selectedScanner, setSelectedScanner] = useState([])
  // const [filterData, setFilterData] = useState([])

  const [sortField, setSortField] = useState('')
  const [sortOrder, setSortOrder] = useState('asc')
  const [sortComponentData, setSortComponentData] = useState([])

  useEffect(() => {
    const filterData =
      data &&
      data.filter((item) =>
        item.cveId.toLowerCase().includes(searchVul.toLowerCase())
      )
    console.log('filterData', filterData)
    setFilteredRow(filterData)
  }, [searchVul])

  const handleVulSort = (field) => {
    setFilteredRow([])
    if (field === sortField) {
      const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc'
      setSortOrder(newSortOrder)
      sortVulnData(field, newSortOrder)
    } else {
      setSortField(field)
      setSortOrder('asc')
      sortVulnData(field, 'asc')
    }
  }

  const sortVulnData = (field, order) => {
    const vuldata = [...data]
    const sortedData = vuldata.sort((a, b) => {
      if (
        field === 'v3Score' &&
        typeof a.cvss[field] === 'number' &&
        typeof b.cvss[field] === 'number'
      ) {
        return order === 'asc'
          ? a.cvss[field] - b.cvss[field]
          : b.cvss[field] - a.cvss[field]
      } else if (field === 'name' || field === 'version') {
        const comparison = a.component[field].localeCompare(b.component[field])
        return order === 'asc' ? comparison : -comparison
      } else {
        const comparison = a[field].localeCompare(b[field])
        return order === 'asc' ? comparison : -comparison
      }
    })
    setSortedVulnData(sortedData)
  }

  useEffect(() => {
    const vulnaData = vulnerabilitiesData.sort((a, b) =>
      b.cvss.localeCompare(a.cvss)
    )
    setVulnerabilitiesData(vulnaData)
  }, [])

  useEffect(() => {
    // If no options are selected, display all data
    if (selectedOptions.length === 0) {
      setFilterData(vulnerabilitiesData)
    }

    // Filter the data based on selected options
    const items = vulnerabilitiesData.filter((item) =>
      selectedOptions.includes(item.severity)
    )

    setFilterData(items)
  }, [selectedOptions])

  const handleScanner = (item) => {
    if (selectedScanner.includes(item.name)) {
      const filterItem = selectedScanner.filter((itm) => itm !== `${item.name}`)
      setSelectedScanner(filterItem)
    } else {
      setSelectedScanner((prev) => [...prev, item.name])
    }
  }

  useEffect(() => {
    // If no options are selected, display all data
    if (selectedScanner.length === 0) {
      setFilterData(vulnerabilitiesData)
    }

    // Filter the data based on selected options
    const items = vulnerabilitiesData.filter((item) =>
      selectedScanner.includes(item.scanner)
    )

    setFilterData(items)
  }, [selectedScanner])

  const [selectedStatus, setSelectedStatus] = useState([])
  const [selectedOptions, setSelectedOptions] = useState([])
  const [filterData, setFilterData] = useState([])

  const handleStatusSelect = (item) => {
    if (selectedStatus.includes(item)) {
      const filterItem = selectedStatus.filter((itm) => itm !== `${item}`)
      setSelectedStatus(filterItem)
    } else {
      setSelectedStatus((prev) => [...prev, item])
    }
  }

  const handleSelect = (item) => {
    if (selectedOptions.includes(item.name)) {
      const filterItem = selectedOptions.filter((itm) => itm !== `${item.name}`)
      setSelectedOptions(filterItem)
    } else {
      setSelectedOptions((prev) => [...prev, item.name])
    }
  }

  const onVulnFilter = (item) => {
    setFilteredRow([])
    if (item === 'Unresolved') {
      const filterData = data.filter(
        (item) =>
          item.vexVuln?.vexStatus?.name !== 'Fixed' &&
          item.vexVuln?.vexStatus?.name !== 'False Positive' &&
          item.vexVuln?.vexStatus?.name !== 'Not Affected'
      )
      console.log(`filter data`, filterData)
      setSortedVulnData(filterData)
    } else {
      setSortedVulnData(data)
    }
  }

  useEffect(() => {
    // If no options are selected, display all data
    if (selectedStatus.length === 0 && selectedOptions.length === 0) {
      setFilterData(vulnerabilitiesData)
    }

    if (selectedStatus.length > 0 && selectedOptions.length === 0) {
      // Filter the data based on selected options
      const items = vulnerabilitiesData.filter((item) =>
        selectedStatus.includes(item.status)
      )
      setFilterData(items)
    }

    if (selectedOptions.length > 0 && selectedStatus.length === 0) {
      // Filter the data based on selected options
      const items = vulnerabilitiesData.filter((item) =>
        selectedOptions.includes(item.severity)
      )
      setFilterData(items)
    }

    if (selectedStatus.length > 0 && selectedOptions.length > 0) {
      // Filter the data based on selected options
      const items = vulnerabilitiesData.filter(
        (item) =>
          selectedOptions.includes(item.severity) &&
          selectedStatus.includes(item.status)
      )
      setFilterData(items)
    }
  }, [selectedStatus, selectedOptions])

  return (
    <Card my='22px' overflowX={{ sm: 'scroll', xl: 'hidden' }}>
      <Tabs variant='enclosed'>
        <TabList mt='20px'>
          <Tab>Vulnerabilities</Tab>
        </TabList>
        <TabPanels>
          <TabPanel height={'8xl'}>
            <CardHeader mb={4} as={Flex} gap={2}>
              <Input
                placeholder='Search'
                width={'300px'}
                size='md'
                id='vulnerabilities'
                value={searchVul}
                onChange={(e) => setSearchVul(e.target.value)}
              />
              <Menu closeOnSelect={true}>
                <MenuButton
                  as={Button}
                  colorScheme='blue'
                  leftIcon={<BsFilterRight size={24} />}
                >
                  Filter
                </MenuButton>
                <MenuList minWidth='240px'>
                  <MenuOptionGroup
                    defaultValue='Total'
                    title='Resolution'
                    type='radio'
                  >
                    {['Unresolved', 'Total'].map((p, index) => (
                      <MenuItemOption
                        value={p}
                        key={index}
                        fontSize={'sm'}
                        onClick={() => onVulnFilter(p)}
                      >
                        {p}
                      </MenuItemOption>
                    ))}
                  </MenuOptionGroup>
                </MenuList>
              </Menu>
            </CardHeader>
            <CardBody>
              <Table variant='simple' color={textColor} size='sm'>
                <Thead>
                  <Tr my='.8rem' pl='0px'>
                    <Th
                      color='gray.400'
                      py={4}
                      position='relative'
                      onClick={() => handleVulSort('cveId')}
                      cursor={'pointer'}
                    >
                      <Flex direction={'row'} alignItems={'center'} gap={2}>
                        <Box>CVE ID</Box>
                        <Box>
                          {sortField === 'cveId' && sortOrder === 'asc' ? (
                            <TriangleUpIcon />
                          ) : (
                            <TriangleDownIcon />
                          )}
                        </Box>
                      </Flex>
                    </Th>
                    <Th
                      color='gray.400'
                      py={4}
                      position='relative'
                      onClick={() => handleVulSort('v3Score')}
                      cursor={'pointer'}
                    >
                      <Flex direction={'row'} alignItems={'center'} gap={2}>
                        <Box>CVSS</Box>
                        <Box>
                          {sortField === 'v3Score' && sortOrder === 'asc' ? (
                            <TriangleUpIcon />
                          ) : (
                            <TriangleDownIcon />
                          )}
                        </Box>
                      </Flex>
                    </Th>

                    <Th
                      color='gray.400'
                      py={4}
                      position='relative'
                      onClick={() => handleVulSort('name')}
                      cursor={'pointer'}
                    >
                      <Flex direction={'row'} alignItems={'center'} gap={2}>
                        <Box>Component</Box>
                        <Box>
                          {sortField === 'name' && sortOrder === 'asc' ? (
                            <TriangleUpIcon />
                          ) : (
                            <TriangleDownIcon />
                          )}
                        </Box>
                      </Flex>
                    </Th>
                    <Th
                      color='gray.400'
                      py={4}
                      position='relative'
                      onClick={() => handleVulSort('version')}
                      cursor={'pointer'}
                    >
                      <Flex direction={'row'} alignItems={'center'} gap={2}>
                        <Box>Version</Box>
                        <Box>
                          {sortField === 'version' && sortOrder === 'asc' ? (
                            <TriangleUpIcon />
                          ) : (
                            <TriangleDownIcon />
                          )}
                        </Box>
                      </Flex>
                    </Th>
                    <Th
                      color='gray.400'
                      py={4}
                      position='relative'
                      // onClick={() => handleVulSort('fixed_component')}
                      cursor={'pointer'}
                    >
                      <Flex direction={'row'} alignItems={'center'} gap={2}>
                        <Box>Fixed (Component)</Box>
                        <Box>
                          {sortField === 'fixed_component' &&
                          sortOrder === 'asc' ? (
                            <TriangleUpIcon />
                          ) : (
                            <TriangleDownIcon />
                          )}
                        </Box>
                      </Flex>
                    </Th>
                    <Th
                      color='gray.400'
                      py={4}
                      position='relative'
                      // onClick={() => handleVulSort('fixed_product')}
                      cursor={'pointer'}
                    >
                      <Flex direction={'row'} alignItems={'center'} gap={2}>
                        <Box>Fixed (Product)</Box>
                        <Box>
                          {sortField === 'fixed_product' &&
                          sortOrder === 'asc' ? (
                            <TriangleUpIcon />
                          ) : (
                            <TriangleDownIcon />
                          )}
                        </Box>
                      </Flex>
                    </Th>
                    <Th color='gray.400' py={4} position='relative'>
                      <Box>Scanner</Box>
                    </Th>
                    <Th
                      color='gray.400'
                      py={4}
                      position='relative'
                      // onClick={() => handleVulSort('status')}
                      cursor={'pointer'}
                    >
                      <Flex direction={'row'} alignItems={'center'} gap={2}>
                        <Box>Status</Box>
                        <Box>
                          {sortField === 'status' && sortOrder === 'asc' ? (
                            <TriangleUpIcon />
                          ) : (
                            <TriangleDownIcon />
                          )}
                        </Box>
                      </Flex>
                    </Th>
                    <Th color='gray.400' py={4} position='relative'></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredRow && filteredRow.length > 0
                    ? filteredRow.map((row, idx) => (
                        <VulnerabilityRow
                          refetch={refetch}
                          key={idx}
                          id={row.id}
                          imgVersionId={imgVersionId}
                          component={row.component.name}
                          version={row.component.version}
                          cvss={row.cvss.v3Score}
                          cve={row.cveId}
                          fixed_component={row.component.fixedInVersion}
                          fixed_product={row.fixedInImage}
                          description={row.component.name}
                          status={row.vexVuln?.vexStatus}
                          justify={row.vexVuln?.vexJustification}
                          scanner={row.scanners}
                          shared_data={row.component.name}
                          versions={row.component.name}
                          imageInfo={imageInfo}
                        />
                      ))
                    : sortedVulnData.length > 0
                    ? sortedVulnData.map((row, idx) => (
                        <VulnerabilityRow
                          refetch={refetch}
                          key={idx}
                          id={row.id}
                          imgVersionId={imgVersionId}
                          component={row.component.name}
                          version={row.component.version}
                          cvss={row.cvss.v3Score}
                          cve={row.cveId}
                          fixed_component={row.component.fixedInVersion}
                          fixed_product={row.fixedInImage}
                          description={row.component.name}
                          status={row.vexVuln?.vexStatus}
                          justify={row.vexVuln?.vexJustification}
                          scanner={row.scanners}
                          shared_data={row.component.name}
                          versions={row.component.name}
                          imageInfo={imageInfo}
                        />
                      ))
                    : filteredVul.length > 0
                    ? filteredVul.map((row, idx) => {
                        return (
                          <VulnerabilityRow
                            refetch={refetch}
                            key={idx}
                            id={row.id}
                            imgVersionId={imgVersionId}
                            component={row.component.name}
                            version={row.component.version}
                            cvss={row.cvss.v3Score}
                            cve={row.cveId}
                            fixed_component={row.component.fixedInVersion}
                            fixed_product={row.fixedInImage}
                            description={row.component.name}
                            status={row.vexVuln?.vexStatus}
                            justify={row.vexVuln?.vexJustification}
                            scanner={row.scanners}
                            shared_data={row.component.name}
                            versions={row.component.name}
                            imageInfo={imageInfo}
                          />
                        )
                      })
                    : data
                    ? data.map((row, idx) => {
                        return (
                          <VulnerabilityRow
                            refetch={refetch}
                            key={idx}
                            id={row.id}
                            imgVersionId={imgVersionId}
                            component={row.component.name}
                            version={row.component.version}
                            cvss={row.cvss.v3Score}
                            cve={row.cveId}
                            fixed_component={row.component.fixedInVersion}
                            fixed_product={row.fixedInImage}
                            description={row.component.name}
                            status={row.vexVuln?.vexStatus}
                            justify={row.vexVuln?.vexJustification}
                            scanner={row.scanners}
                            shared_data={row.component.name}
                            versions={row.component.name}
                            imageInfo={imageInfo}
                          />
                        )
                      })
                    : loading && (
                        <Tr>
                          <Td fontSize={'sm'} pl={1}>
                            <Skeleton height='20px' />
                          </Td>
                          <Td fontSize={'sm'} pl={1}>
                            <Skeleton height='20px' />
                          </Td>
                          <Td fontSize={'sm'} pl={1}>
                            <Skeleton height='20px' />
                          </Td>
                          <Td fontSize={'sm'} pl={1}>
                            <Skeleton height='20px' />
                          </Td>
                          <Td fontSize={'sm'} pl={1}>
                            <Skeleton height='20px' />
                          </Td>
                          <Td fontSize={'sm'} pl={1}>
                            <Skeleton height='20px' />
                          </Td>
                          <Td fontSize={'sm'} pl={1}>
                            <Skeleton height='20px' />
                          </Td>
                          <Td fontSize={'sm'} pl={1}>
                            <Skeleton height='20px' />
                          </Td>
                          <Td fontSize={'sm'} pl={1}>
                            <Skeleton height='20px' />
                          </Td>
                        </Tr>
                      )}
                </Tbody>
              </Table>
            </CardBody>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Card>
  )
}

export default CustomerSBOMTable
