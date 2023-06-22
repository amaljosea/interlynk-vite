// Chakra imports
import {
  Table,
  Tbody,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Tag,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  TabPanels,
  Textarea,
  Input,
  Flex,
  Button,
  Menu,
  MenuList,
  MenuItemOption,
  MenuOptionGroup,
  MenuButton,
  Box,
  Select,
  Tooltip,
  MenuDivider
} from '@chakra-ui/react'

import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import SBOMComponentRow from 'components/Tables/SBOMComponentRow.js'
import SBOMLinkRow from 'components/Tables/SBOMLinkRow.js'
import VulnerabilityRow from 'components/Tables/VulnerabilityRow.js'
import RiskRow from 'components/Tables/RiskRow.js'
import { Risks, sbom_content } from 'variables/general'
import React, { useContext, useEffect } from 'react'
import GlobalContext from 'context/GlobalContext'
import CardHeader from 'components/Card/CardHeader'
import { sbom } from 'variables/general'
import { useState, useRef } from 'react'
import {
  ChevronDownIcon,
  TriangleDownIcon,
  TriangleUpIcon
} from '@chakra-ui/icons'
import { productVersionsData } from 'variables/general'
import { BiImport, BiExport, BiFilter } from 'react-icons/bi'
import { BsFilterRight } from 'react-icons/bs'
import { FaFilter } from 'react-icons/fa'

const SBOMTable = ({
  title,
  captions,
  data,
  filteredVul,
  setFilteredVulItems
}) => {
  const {
    SBOMLinksData,
    vulnerabilitiesData,
    setVulnerabilitiesData,
    selectedRows,
    tabIndex,
    setTabIndex
  } = useContext(GlobalContext)
  const textColor = useColorModeValue('gray.700', 'white')
  const [searchInput, setSearchInput] = useState('')
  const [searchVul, setSearchVul] = useState('')
  const [riskInput, setRiskInput] = useState('')
  const [selectVersion, setSelectVersion] = useState('')
  const [selectStatus, setSelectStatus] = useState('')
  const [severity] = useState([
    { id: 1, name: 'Critical' },
    { id: 2, name: 'High' },
    { id: 3, name: 'Medium' },
    { id: 4, name: 'Low' }
  ])
  const [scanner] = useState([
    { id: 1, name: 'Grype' },
    { id: 2, name: 'Scout' },
    { id: 3, name: 'Snyk' },
    { id: 4, name: 'Trivy' },
    { id: 5, name: 'Custom' }
  ])
  const [status] = useState([
    'Affected',
    'False Positive',
    'Fixed',
    'In Triage',
    'Not Affected'
  ])
  const [selectedOptions, setSelectedOptions] = useState([])
  const [selectedScanner, setSelectedScanner] = useState([])
  const [selectedStatus, setSelectedStatus] = useState([])
  const [filterData, setFilterData] = useState([])

  const componentRef = useRef()

  const link_captions = [
    'Active',
    'Contains',
    'Shared With',
    'Visits',
    'Created',
    'Link',
    ''
  ]
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
  const risk_captions = [
    'score',
    'type',
    'description',
    'component',
    'version',
    'recommendation',
    ''
  ]

  const uniqVersions = []
  productVersionsData.map((project) => {
    project.versions.map((version) => {
      if (uniqVersions.indexOf(version.version) === -1) {
        uniqVersions.push(version.version)
      }
    })
  })
  // var sbom_content
  // fetch(
  //   'https://raw.githubusercontent.com/interlynk-io/sbomqs/main/samples/sbomqs-cdx-cgomod.json'
  // )
  //   .then((response) => response.text())
  //   .then((text) => {
  //     sbom_content = text
  //   })
  // console.log(sbom_content)

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

  const filteredRiskItems = Risks.filter((item) =>
    item.component.toLowerCase().includes(riskInput.toLowerCase())
  )

  const handleSelect = (item) => {
    setFilteredVulItems([])
    if (selectedOptions.includes(item.name)) {
      const filterItem = selectedOptions.filter((itm) => itm !== `${item.name}`)
      setSelectedOptions(filterItem)
    } else {
      setSelectedOptions((prev) => [...prev, item.name])
    }
  }

  const handleStatusSelect = (item) => {
    setFilteredVulItems([])
    if (selectedStatus.includes(item)) {
      const filterItem = selectedStatus.filter((itm) => itm !== `${item}`)
      setSelectedStatus(filterItem)
    } else {
      setSelectedStatus((prev) => [...prev, item])
    }
  }

  // useEffect(() => {
  //   // If no options are selected, display all data
  //   if (selectedOptions.length === 0 && selectedStatus.length === 0) {
  //     setFilterData(vulnerabilitiesData)
  //   }

  //   if (selectedOptions.length > 0 && selectedStatus.length === 0) {
  //     // Filter the data based on selected options
  //     const items = vulnerabilitiesData.filter((item) =>
  //       selectedOptions.includes(item.severity)
  //     )
  //     setFilterData(items)
  //   }

  //   if (selectedOptions.length > 0 && selectedStatus.length > 0) {
  //     // Filter the data based on selected options
  //     const items = vulnerabilitiesData.filter(
  //       (item) =>
  //         selectedOptions.includes(item.severity) &&
  //         selectedStatus.includes(item.status)
  //     )
  //     setFilterData(items)
  //   }
  // }, [selectedOptions])

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

  const handleScanner = (item) => {
    if (selectedScanner.includes(item.name)) {
      const filterItem = selectedScanner.filter((itm) => itm !== `${item.name}`)
      setSelectedScanner(filterItem)
    } else {
      setSelectedScanner((prev) => [...prev, item.name])
    }
  }

  const filterObjectsByScanner = (selectedScanner) => {
    return vulnerabilitiesData.filter((obj) => {
      return selectedScanner.some((scanner) => obj.scanner.includes(scanner))
    })
  }

  useEffect(() => {
    // If no options are selected, display all data
    if (selectedScanner.length === 0) {
      setFilterData(vulnerabilitiesData)
    }

    // Filter the data based on selected options
    const items = filterObjectsByScanner(selectedScanner)
    setFilterData(items)

    // console.log('filter', filterObjectsByScanner(selectedScanner))
  }, [selectedScanner])

  useEffect(() => {
    const vulnaData = vulnerabilitiesData.sort((a, b) =>
      b.cvss.localeCompare(a.cvss)
    )
    setVulnerabilitiesData(vulnaData)
  }, [])

  useEffect(() => {
    const scoreData = Risks.sort((a, b) => a.score - b.score)
    setDefaultRiskScore(scoreData)
  }, [])

  const [sortField, setSortField] = useState('')
  const [sortOrder, setSortOrder] = useState('asc')
  const [sortComponentData, setSortComponentData] = useState([])
  const [defaultRiskScore, setDefaultRiskScore] = useState([])
  const [sortRiskScoreData, setSortRiskScoreData] = useState([])

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

  const handleRiskSort = (field) => {
    if (field === sortField) {
      const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc'
      setSortOrder(newSortOrder)
      sortRiskData(field, newSortOrder)
    } else {
      setSortField(field)
      setSortOrder('asc')
      sortRiskData(field, 'asc')
    }
  }

  const sortRiskData = (field, order) => {
    const sortedData = Risks.sort((a, b) => {
      if (typeof a[field] === 'number' && typeof b[field] === 'number') {
        return order === 'asc' ? a[field] - b[field] : b[field] - a[field]
      } else {
        const comparison = a[field].localeCompare(b[field])
        return order === 'asc' ? comparison : -comparison
      }
    })
    setSortRiskScoreData(sortedData)
  }

  const handleUpdateClick = () => {
    const updatedData = vulnerabilitiesData.map((row) => {
      if (selectedRows.includes(row.id)) {
        return {
          ...row,
          status: selectStatus,
          version: selectVersion !== '' ? selectVersion : row.version
        } // Change the value of "Column 1"
      }
      return row
    })

    // Perform any other necessary logic with the updated data

    console.log('Updated data:', updatedData)
    setVulnerabilitiesData(updatedData)
  }

  return (
    <Card my='22px' overflowX={{ sm: 'scroll', xl: 'hidden' }}>
      <Tabs
        variant='enclosed'
        index={tabIndex}
        onChange={(index) => setTabIndex(index)}
      >
        <TabList mt='20px'>
          <Tab>SBOM Links</Tab>
          <Tab>Vulnerabilities</Tab>
          <Tab>Components</Tab>
          <Tab>Risks</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <CardBody>
              <Table variant='simple' color={textColor} size='sm'>
                <Thead>
                  <Tr my='.8rem' pl='0px'>
                    {link_captions.map((caption, idx) => {
                      return (
                        <Th
                          color='gray.400'
                          key={idx}
                          ps={idx === 0 ? '0px' : null}
                        >
                          {caption}
                        </Th>
                      )
                    })}
                  </Tr>
                </Thead>
                <Tbody>
                  {SBOMLinksData.map((row, idx) => {
                    return (
                      <SBOMLinkRow
                        key={idx}
                        id={row.id}
                        link={row.link}
                        visits={row.visits}
                        created={row.created}
                        shared_with={row.shared_with}
                        conf_email={row.conf_email}
                        conf_terms={row.conf_terms}
                        redactions={row.redactions}
                        components={row.components}
                        licenses={row.licenses}
                        vulnerabilities={row.vulnerabilities}
                        cyclonedx={row.cyclonedx}
                        spdx={row.spdx}
                        active={row.active}
                        project={row.project}
                      />
                    )
                  })}
                </Tbody>
              </Table>
            </CardBody>
          </TabPanel>
          <TabPanel height={'8xl'}>
            <CardHeader mb={4}>
              <Flex
                width={'100%'}
                gap={2}
                direction={'row'}
                alignItems={'center'}
                justifyContent={'space-between'}
              >
                <Flex gap={2} direction={'row'} alignItems={'center'}>
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
                  {/* <Menu>
                    <MenuButton
                      as={Button}
                      rightIcon={<ChevronDownIcon />}
                      maxW='150px'
                      px={4}
                      py={2}
                      me={2}
                      transition='all 0.2s'
                      borderRadius='md'
                      borderWidth='1px'
                      fontSize='sm'
                      fontWeight='none'
                    >
                      Severity
                    </MenuButton>
                    <MenuList fontWeight='none' fontSize='sm'>
                      <MenuOptionGroup type='checkbox'>
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
                  </Menu> */}
                  {/* <Menu>
                    <MenuButton
                      as={Button}
                      rightIcon={<ChevronDownIcon />}
                      maxW='150px'
                      px={4}
                      py={2}
                      me={2}
                      transition='all 0.2s'
                      borderRadius='md'
                      borderWidth='1px'
                      fontSize='sm'
                      fontWeight='none'
                    >
                      Scanner
                    </MenuButton>
                    <MenuList fontWeight='none' fontSize='sm'>
                      <MenuOptionGroup type='checkbox'>
                        {scanner.map((item) => (
                          <MenuItemOption
                            key={item.id}
                            value={`${item.name}`}
                            onClick={() => handleScanner(item)}
                          >
                            {item.name}
                          </MenuItemOption>
                        ))}
                      </MenuOptionGroup>
                    </MenuList>
                  </Menu> */}
                </Flex>
                <Flex gap={2} direction={'row'}>
                  {/* <Select
                    id='version'
                    value={selectVersion}
                    placeholder='Select version'
                    onChange={(e) => setSelectVersion(e.target.value)}
                    size='md'
                    color='gray.500'
                  >
                    {uniqVersions.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </Select>
                  <Select
                    id='status'
                    size='md'
                    value={selectStatus}
                    placeholder='Select status'
                    onChange={(e) => setSelectStatus(e.target.value)}
                    color='gray.500'
                  >
                    {status.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </Select>
                  <Button
                    colorScheme='blue'
                    size='md'
                    w={48}
                    onClick={handleUpdateClick}
                  >
                    Apply
                  </Button> */}
                  <Box as={Flex} direction={'row'} gap={2}>
                    <Tooltip label='Import'>
                      <Button colorScheme='blue' size='md'>
                        <BiImport />
                      </Button>
                    </Tooltip>
                    <Tooltip label='Export'>
                      <Button colorScheme='blue' size='md'>
                        <BiExport />
                      </Button>
                    </Tooltip>
                  </Box>
                </Flex>
              </Flex>
            </CardHeader>
            <CardBody>
              <Table variant='simple' color={textColor} size='sm'>
                <Thead>
                  <Tr my='.8rem' pl='0px'>
                    <Th></Th>
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
                      Shared Data
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
                  {filteredVul.length > 0
                    ? filteredVul.map((row, idx) => {
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
                    : filterData.length > 0
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
          <TabPanel>
            <CardHeader mb={4} as={Flex}>
              <Flex
                width={'100%'}
                gap={2}
                direction={'row'}
                alignItems={'center'}
                justifyContent={'space-between'}
              >
                <Input
                  placeholder='Search'
                  width={'300px'}
                  size='md'
                  id='components'
                  value={searchInput}
                  onChange={handleSearch}
                />
                <Flex direction={'row'} gap={2}>
                  <Tooltip label='Import'>
                    <Button colorScheme='blue'>
                      <BiImport />
                    </Button>
                  </Tooltip>
                  <Tooltip label='Export'>
                    <Button colorScheme='blue'>
                      <BiExport />
                    </Button>
                  </Tooltip>
                </Flex>
              </Flex>
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
                    <Th
                      color='gray.400'
                      py={4}
                      position='relative'
                      onClick={() => handleSort('risk_score')}
                      cursor={'pointer'}
                    >
                      <Flex direction={'row'} alignItems={'center'} gap={2}>
                        <Box>Risk Score</Box>
                        <Box>
                          {sortField === 'risk_score' && sortOrder === 'asc' ? (
                            <TriangleUpIcon />
                          ) : (
                            <TriangleDownIcon />
                          )}
                        </Box>
                      </Flex>
                    </Th>
                    <Th color='gray.400' py={4} position='relative'>
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
                    </Th>
                    <Th color='gray.400' py={4} position='relative'></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {sortComponentData.length > 0
                    ? sortComponentData.map((row) => {
                        return (
                          <SBOMComponentRow
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
                          <SBOMComponentRow
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
                          <SBOMComponentRow
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
          <TabPanel>
            <CardHeader mb={4} as={Flex}>
              <Input
                placeholder='Search'
                width={'300px'}
                size='md'
                id='risk'
                value={riskInput}
                onChange={(e) => setRiskInput(e.target.value)}
              />
            </CardHeader>
            <CardBody>
              <Table variant='simple' color={textColor} size='sm'>
                <Thead>
                  <Tr my='.8rem' pl='0px'>
                    {risk_captions.map((caption, idx) => {
                      return (
                        <Th
                          color='gray.400'
                          key={idx}
                          ps={idx === 0 ? '0px' : null}
                          cursor={'pointer'}
                          onClick={() => handleRiskSort(caption)}
                        >
                          {caption !== '' && (
                            <Flex
                              direction={'row'}
                              alignItems={'center'}
                              gap={2}
                            >
                              <Box>{caption}</Box>
                              <Box>
                                {sortField === `${caption}` &&
                                sortOrder === 'asc' ? (
                                  <TriangleUpIcon />
                                ) : (
                                  <TriangleDownIcon />
                                )}
                              </Box>
                            </Flex>
                          )}
                        </Th>
                      )
                    })}
                  </Tr>
                </Thead>
                <Tbody>
                  {sortRiskScoreData.length > 0
                    ? sortRiskScoreData.map((row, idx) => {
                        return (
                          <RiskRow
                            key={idx}
                            component={row.component}
                            version={row.version}
                            description={row.description}
                            type={row.type}
                            recommendation={row.recommendation}
                            score={row.score}
                          />
                        )
                      })
                    : filteredRiskItems.length > 0
                    ? filteredRiskItems.map((row, idx) => {
                        return (
                          <RiskRow
                            key={idx}
                            component={row.component}
                            version={row.version}
                            description={row.description}
                            type={row.type}
                            recommendation={row.recommendation}
                            score={row.score}
                          />
                        )
                      })
                    : defaultRiskScore.map((row, idx) => {
                        return (
                          <RiskRow
                            key={idx}
                            component={row.component}
                            version={row.version}
                            description={row.description}
                            type={row.type}
                            recommendation={row.recommendation}
                            score={row.score}
                          />
                        )
                      })}
                </Tbody>
              </Table>
            </CardBody>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Card>
  )
}

export default SBOMTable
