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
  MenuDivider,
  useDisclosure,
  chakra,
  Skeleton,
  Td,
  useQuery
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
  AddIcon,
  ChevronDownIcon,
  TriangleDownIcon,
  TriangleUpIcon
} from '@chakra-ui/icons'
import { productVersionsData } from 'variables/general'
import { BiImport, BiExport, BiFilter } from 'react-icons/bi'
import { BsFilterRight } from 'react-icons/bs'
import BasicTable from './BasicTable'
import SBOMDrawer from 'components/Drawer/SBOMDrawer'
import { getAllScanners } from 'graphQL/Queries'

const SBOMTable = ({
  title,
  captions,
  data,
  filteredVul,
  setFilteredVulItems,
  vulData,
  imgVersionId,
  refetch,
  imageInfo,
  shareLynks,
  imageDataRefetch,
  scanResults,
  loading,
  columns
}) => {
  const {
    SBOMLinksData,
    vulnerabilitiesData,
    setVulnerabilitiesData,
    selectedRows,
    tabIndex,
    setTabIndex,
    productVersionsData
  } = useContext(GlobalContext)

  const { data: allScanners } = useQuery(getAllScanners, {})

  const textColor = useColorModeValue('gray.700', 'white')
  const [searchInput, setSearchInput] = useState('')
  const [searchVul, setSearchVul] = useState('')
  const [riskInput, setRiskInput] = useState('')
  const [selectVersion, setSelectVersion] = useState('')
  const [selectStatus, setSelectStatus] = useState('')

  const [selectedOptions, setSelectedOptions] = useState([])
  const [selectedScanner, setSelectedScanner] = useState([])
  const [selectedStatus, setSelectedStatus] = useState([])
  const [filterData, setFilterData] = useState([])

  const componentRef = useRef()

  const link_captions = [
    'Active',
    // 'Contains',
    'Shared With',
    // 'Visits',
    'Created',
    'Link',
    ''
  ]

  const [filteredRow, setFilteredRow] = useState([])

  const vulnData = [...vulData]

  const uniqVersions = []
  productVersionsData.map((project) => {
    project.versions.map((version) => {
      if (uniqVersions.indexOf(version.version) === -1) {
        uniqVersions.push(version.version)
      }
    })
  })

  const handleSearch = (e) => {
    setSearchInput(e.target.value)
  }

  const filteredItems = sbom.filter(
    (item) =>
      item.component.toLowerCase().includes(searchInput.toLowerCase()) ||
      item.license.toLowerCase().includes(searchInput.toLowerCase())
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
    const scoreData = Risks.sort((a, b) => a.score - b.score)
    setDefaultRiskScore(scoreData)
  }, [])

  const [sortField, setSortField] = useState('')
  const [sortOrder, setSortOrder] = useState('asc')
  const [sortComponentData, setSortComponentData] = useState([])
  const [defaultRiskScore, setDefaultRiskScore] = useState([])
  const [sortRiskScoreData, setSortRiskScoreData] = useState([])

  const [vulSortData, setVulSortData] = useState([])

  useEffect(() => {
    setVulnerabilitiesData([])
    const data = vulnData.filter(
      (item) =>
        item.cveId &&
        item.cveId.toLowerCase().includes(searchInput.toLowerCase())
    )
    setFilteredRow(data)
  }, [searchInput])

  // useEffect(() => {
  //   console.log('filtered row', filteredRow)
  // }, [filteredRow])

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
    const data = [...vulData]
    const sortedData = data.sort((a, b) => {
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

  const uniqProjects = []
  const btnRef = useRef()

  productVersionsData.map((project) => {
    if (uniqProjects.indexOf(project.name) === -1) {
      uniqProjects.push(project.name)
    }
  })

  const {
    isOpen: isSBMOpen,
    onOpen: setSBMOpen,
    onClose: setSBMClose
  } = useDisclosure()

  const pageSize = 8 // Number of rows to display per page
  const [currentPage, setCurrentPage] = useState(1)

  // Calculate the index range for the current page
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const visibleData = vulnData.slice(startIndex, endIndex)

  const totalPages = Math.ceil(vulnData.length / pageSize)

  return (
    <>
      <Card my='22px' overflowX={{ sm: 'scroll', xl: 'hidden' }}>
        <Tabs
          variant='enclosed'
          index={tabIndex}
          onChange={(index) => setTabIndex(index)}
        >
          <TabList mt='20px'>
            <Tab>Share Lynks</Tab>
            <Tab>Vulnerabilities</Tab>
            {/* <Tab>Affected Components</Tab> */}
            {/* <Tab>Risks</Tab> */}
          </TabList>
          <TabPanels>
            {/* share lynks */}
            <TabPanel>
              <CardHeader mb={4}>
                <Flex
                  width={'100%'}
                  direction={'row'}
                  justifyContent={'flex-end'}
                  alignItems={'center'}
                >
                  <Button
                    width={'120px'}
                    colorScheme='blue'
                    fontSize={'sm'}
                    leftIcon={<AddIcon />}
                    onClick={setSBMOpen}
                  >
                    Share Lynk
                  </Button>
                </Flex>
              </CardHeader>
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
                    {shareLynks.length > 0 ? (
                      shareLynks.map((row, idx) => (
                        <SBOMLinkRow
                          key={idx}
                          id={row.id}
                          signedUrlParams={row.signedUrlParams}
                          updatedAt={row.updatedAt}
                          shareUsers={row.shareUsers}
                          shareScanners={row.shareScanners}
                          enabled={row.enabled}
                          imageDataRefetch={imageDataRefetch}
                          imgVersionId={imgVersionId}
                          scanResults={scanResults}
                        />
                      ))
                    ) : (
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
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </CardBody>
            </TabPanel>
            {/* vulnerabilities */}
            <TabPanel>
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
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
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
                          title='Vulnerability Resolution'
                          type='checkbox'
                        >
                          {['Unesolved', 'Total'].map((p, index) => (
                            <MenuItemOption
                              value={p}
                              key={index}
                              // onClick={() => handleStatusSelect(p)}
                            >
                              {p}
                            </MenuItemOption>
                          ))}
                        </MenuOptionGroup>
                      </MenuList>
                    </Menu>
                  </Flex>
                  <Flex gap={2} direction={'row'}>
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
                {/* <BasicTable data={vulData} columns={columns} /> */}
                <Table variant='simple' color={textColor} size='sm'>
                  <Thead>
                    <Tr my='.8rem' pl='0px'>
                      <Th></Th>
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
                      {/* <Th color='gray.400' py={4} position='relative'>
                      Description
                    </Th> */}
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
                    {searchInput !== ''
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
                      : vulnerabilitiesData.length > 0
                      ? vulnerabilitiesData.map((row, idx) => (
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
                      : vulData.length > 0
                      ? vulData.map((row, idx) => {
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
              {/* <Flex
                flexDir={'row'}
                gap={4}
                alignItems={'center'}
                mt={6}
                justifyContent={'flex-start'}
              >
                <Button
                  colorScheme='blue'
                  onClick={handlePreviousPage}
                  isDisabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  colorScheme='blue'
                  onClick={handleNextPage}
                  isDisabled={currentPage === totalPages}
                >
                  Next
                </Button>
                <chakra.span>Page - {currentPage}</chakra.span>
              </Flex> */}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>
      <SBOMDrawer
        isOpen={isSBMOpen}
        onClose={setSBMClose}
        btnRef={btnRef}
        uniqProjects={uniqProjects}
        uniqVersions={uniqVersions}
        imgVersionId={imgVersionId}
        imageDataRefetch={imageDataRefetch}
        scanResults={scanResults}
      />
    </>
  )
}

export default SBOMTable
