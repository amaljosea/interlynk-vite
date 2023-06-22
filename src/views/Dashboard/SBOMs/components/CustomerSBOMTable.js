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
  MenuDivider
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

const CustomerSBOMTable = ({ title, captions, data }) => {
  const { vulnerabilitiesData, setVulnerabilitiesData } = useContext(
    GlobalContext
  )
  const textColor = useColorModeValue('gray.700', 'white')

  const componentRef = useRef()

  const [searchInput, setSearchInput] = useState('')
  const [searchVul, setSearchVul] = useState('')

  // const [selectedOptions, setSelectedOptions] = useState([])
  const [selectedScanner, setSelectedScanner] = useState([])
  // const [filterData, setFilterData] = useState([])

  const [sortField, setSortField] = useState('')
  const [sortOrder, setSortOrder] = useState('asc')
  const [sortComponentData, setSortComponentData] = useState([])

  const vuln_captions = [
    'CVE',
    'CVSS',
    'Description',
    'component',
    'version',
    'Fixed (Component)',
    'Fixed (Product)',
    'Status',
    ''
  ]

  const [severity] = useState([
    { id: 1, name: 'Critical' },
    { id: 2, name: 'High' },
    { id: 3, name: 'Medium' },
    { id: 4, name: 'Low' }
  ])

  const [scanner] = useState([
    { id: 1, name: 'Grype' },
    { id: 2, name: 'Scout' },
    { id: 3, name: 'Syft' },
    { id: 4, name: 'Trivy' }
  ])

  const [status] = useState([
    'Affected',
    'False Positive',
    'Fixed',
    'In Triage',
    'Not Affected'
  ])

  const [contains, setcontains] = useState({})

  const handleSearch = (e) => {
    setSearchInput(e.target.value)
  }

  const filteredItems = sbom.filter(
    (item) =>
      item.component.toLowerCase().includes(searchInput.toLowerCase()) ||
      item.license.toLowerCase().includes(searchInput.toLowerCase())
  )

  const filteredVulItems = vulnerabilitiesData.filter(
    (item) =>
      item.cve.toLowerCase().includes(searchVul.toLowerCase()) ||
      item.component.toLowerCase().includes(searchVul.toLowerCase())
  )

  // const handleSelect = (item) => {
  //   if (selectedOptions.includes(item.name)) {
  //     const filterItem = selectedOptions.filter((itm) => itm !== `${item.name}`)
  //     setSelectedOptions(filterItem)
  //   } else {
  //     setSelectedOptions((prev) => [...prev, item.name])
  //   }
  // }

  const handleSort = (field) => {
    if (field === sortField) {
      const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc'
      setSortOrder(newSortOrder)
      sortData(field, newSortOrder)
    } else {
      setSortField(field)
      setSortOrder('asc')
      sortData(field, 'asc')
    }
  }

  const sortData = (field, order) => {
    const sortedData = data.sort((a, b) => {
      if (typeof a[field] === 'number' && typeof b[field] === 'number') {
        return order === 'asc' ? a[field] - b[field] : b[field] - a[field]
      } else {
        const comparison = a[field].localeCompare(b[field])
        return order === 'asc' ? comparison : -comparison
      }
    })
    setSortComponentData(sortedData)
  }

  const handleVulSort = (field) => {
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
    const sortedData = vulnerabilitiesData.sort((a, b) => {
      const comparison = a[field].localeCompare(b[field])
      return order === 'asc' ? comparison : -comparison
    })
    setVulnerabilitiesData(sortedData)
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

  useEffect(() => {
    const containsData = window.localStorage.getItem('contains')
    setcontains(JSON.parse(containsData))
  }, [])

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
          <Tab>Components</Tab>
          {contains.vulnerabilities && <Tab>Vulnerabilities</Tab>}
        </TabList>
        <TabPanels>
          <TabPanel>
            <CardHeader mb={4} as={Flex}>
              <Input
                placeholder='Search'
                width={'300px'}
                size='md'
                id='components'
                value={searchInput}
                onChange={handleSearch}
              />
            </CardHeader>
            <CardBody>
              <Table variant='simple' color={textColor} size='sm'>
                <Thead>
                  <Tr my='.8rem' pl='0px'>
                    <Th
                      ref={componentRef}
                      color='gray.400'
                      py={4}
                      position='relative'
                      onClick={() => handleSort('component')}
                      cursor={'pointer'}
                    >
                      <Flex direction={'row'} alignItems={'center'} gap={2}>
                        <Box>Component</Box>
                        <Box>
                          {sortField === 'component' && sortOrder === 'asc' ? (
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
                      onClick={() => handleSort('version')}
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
                    <Th color='gray.400' py={4} position='relative'>
                      Relates to
                    </Th>
                    <Th
                      color='gray.400'
                      py={4}
                      position='relative'
                      onClick={() => handleSort('license')}
                      cursor={'pointer'}
                    >
                      <Flex direction={'row'} alignItems={'center'} gap={2}>
                        <Box>License</Box>
                        <Box>
                          {sortField === 'license' && sortOrder === 'asc' ? (
                            <TriangleUpIcon />
                          ) : (
                            <TriangleDownIcon />
                          )}
                        </Box>
                      </Flex>
                    </Th>
                    {/* <Th color='gray.400' py={4} position='relative'>
                      Vulnerabilities
                    </Th>
                    <Th
                      color='gray.400'
                      py={4}
                      position='relative'
                      cursor={'pointer'}
                      onClick={() => handleSort('updated')}
                    >
                      <Flex direction={'row'} alignItems={'center'} gap={2}>
                        <Box>Last Updated</Box>
                        <Box>
                          {sortField === 'updated' && sortOrder === 'asc' ? (
                            <TriangleUpIcon />
                          ) : (
                            <TriangleDownIcon />
                          )}
                        </Box>
                      </Flex>
                    </Th> */}
                    <Th color='gray.400' py={4} position='relative'></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {sortComponentData.length > 0
                    ? sortComponentData.map((row) => {
                        return (
                          <CustomerComponentRow
                            key={row.component + row.version}
                            component={row.component}
                            logo={row.logo}
                            version={row.version}
                            dependsOn={row.dependsOn}
                            license={row.license}
                            risk_score={row.risk_score}
                            critical={row.critical}
                            high={row.high}
                            medium={row.medium}
                            low={row.low}
                            updated={row.updated}
                            redacted={row.redacted}
                          />
                        )
                      })
                    : filteredItems.length > 0
                    ? filteredItems.map((row) => {
                        return (
                          <CustomerComponentRow
                            key={row.component + row.version}
                            component={row.component}
                            logo={row.logo}
                            version={row.version}
                            dependsOn={row.dependsOn}
                            license={row.license}
                            risk_score={row.risk_score}
                            critical={row.critical}
                            high={row.high}
                            medium={row.medium}
                            low={row.low}
                            updated={row.updated}
                            redacted={row.redacted}
                          />
                        )
                      })
                    : data.map((row) => {
                        return (
                          <CustomerComponentRow
                            key={row.component + row.version}
                            component={row.component}
                            logo={row.logo}
                            version={row.version}
                            dependsOn={row.dependsOn}
                            license={row.license}
                            risk_score={row.risk_score}
                            critical={row.critical}
                            high={row.high}
                            medium={row.medium}
                            low={row.low}
                            updated={row.updated}
                            redacted={row.redacted}
                          />
                        )
                      })}
                </Tbody>
              </Table>
            </CardBody>
          </TabPanel>
          {contains.vulnerabilities && (
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
                    <MenuOptionGroup title='Status' type='checkbox'>
                      {status.map((p) => (
                        <MenuItemOption
                          value={p}
                          onClick={() => handleStatusSelect(p)}
                        >
                          {p}
                        </MenuItemOption>
                      ))}
                    </MenuOptionGroup>
                    <MenuDivider />
                    <MenuOptionGroup title='Severity' type='checkbox'>
                      {severity.map((item) => (
                        <MenuItemOption
                          key={item.id}
                          value={`${item.name}`}
                          onClick={() => handleSelect(item)}
                        >
                          {item.name}
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
                        onClick={() => handleVulSort('cve')}
                        cursor={'pointer'}
                      >
                        <Flex direction={'row'} alignItems={'center'} gap={2}>
                          <Box>CVE</Box>
                          <Box>
                            {sortField === 'cve' && sortOrder === 'asc' ? (
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
                        onClick={() => handleVulSort('cvss')}
                        cursor={'pointer'}
                      >
                        <Flex direction={'row'} alignItems={'center'} gap={2}>
                          <Box>CVSS</Box>
                          <Box>
                            {sortField === 'cvss' && sortOrder === 'asc' ? (
                              <TriangleUpIcon />
                            ) : (
                              <TriangleDownIcon />
                            )}
                          </Box>
                        </Flex>
                      </Th>
                      {/* <Th color='gray.400' py={4} position='relative'>
                        Description
                      </Th> */}
                      <Th
                        color='gray.400'
                        py={4}
                        position='relative'
                        onClick={() => handleVulSort('component')}
                        cursor={'pointer'}
                      >
                        <Flex direction={'row'} alignItems={'center'} gap={2}>
                          <Box>Component</Box>
                          <Box>
                            {sortField === 'component' &&
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
                        onClick={() => handleVulSort('fixed_component')}
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
                        onClick={() => handleVulSort('fixed_product')}
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
                        Scanner
                      </Th>
                      <Th color='gray.400' py={4} position='relative'>
                        Shared data
                      </Th>
                      <Th color='gray.400' py={4} position='relative'>
                        Versions
                      </Th>
                      <Th
                        color='gray.400'
                        py={4}
                        position='relative'
                        onClick={() => handleVulSort('status')}
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
                    {filterData.length > 0
                      ? filterData.map((row, idx) => {
                          return (
                            <VulnerabilityRow
                              key={idx}
                              id={row.id}
                              component={row.component}
                              version={row.version}
                              cvss={row.cvss}
                              cve={row.cve}
                              fixed_component={row.fixed_component}
                              fixed_product={row.fixed_product}
                              description={row.description}
                              status={row.status}
                              scanner={row.scanner}
                              shared_data={row.shared_data}
                              versions={row.versions}
                            />
                          )
                        })
                      : filteredVulItems.length > 0
                      ? filteredVulItems.map((row, idx) => {
                          return (
                            <VulnerabilityRow
                              key={idx}
                              id={row.id}
                              component={row.component}
                              version={row.version}
                              cvss={row.cvss}
                              cve={row.cve}
                              fixed_component={row.fixed_component}
                              fixed_product={row.fixed_product}
                              description={row.description}
                              status={row.status}
                              scanner={row.scanner}
                              shared_data={row.shared_data}
                              versions={row.versions}
                            />
                          )
                        })
                      : vulnerabilitiesData.map((row, idx) => {
                          return (
                            <VulnerabilityRow
                              key={idx}
                              id={row.id}
                              component={row.component}
                              version={row.version}
                              cvss={row.cvss}
                              cve={row.cve}
                              fixed_component={row.fixed_component}
                              fixed_product={row.fixed_product}
                              description={row.description}
                              status={row.status}
                              scanner={row.scanner}
                              shared_data={row.shared_data}
                              versions={row.versions}
                            />
                          )
                        })}
                  </Tbody>
                </Table>
              </CardBody>
            </TabPanel>
          )}
        </TabPanels>
      </Tabs>
    </Card>
  )
}

export default CustomerSBOMTable
