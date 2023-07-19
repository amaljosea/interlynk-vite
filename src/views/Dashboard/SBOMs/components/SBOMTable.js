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
  Input,
  Flex,
  Button,
  Menu,
  MenuList,
  MenuItemOption,
  MenuOptionGroup,
  MenuButton,
  Box,
  Tooltip,
  useDisclosure,
  Skeleton,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Text,
  chakra
} from '@chakra-ui/react'

import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import SBOMLinkRow from 'components/Tables/SBOMLinkRow.js'
import VulnerabilityRow from 'components/Tables/VulnerabilityRow.js'
import { Risks } from 'variables/general'
import React, { useContext, useEffect } from 'react'
import GlobalContext from 'context/GlobalContext'
import CardHeader from 'components/Card/CardHeader'
import { useState, useRef } from 'react'
import { AddIcon, TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons'
import { BiImport, BiExport } from 'react-icons/bi'
import { BsFilterRight } from 'react-icons/bs'
import SBOMDrawer from 'components/Drawer/SBOMDrawer'
import { CSVLink } from 'react-csv'
import { useMutation } from '@apollo/client'
import { UpdateImageVersion } from 'graphQL/Mutation'
import { ImageUpdate } from 'graphQL/Mutation'

const SBOMTable = ({
  scan,
  imageId,
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
  shareLynkLoading
}) => {
  const {
    vulnerabilitiesData,
    setVulnerabilitiesData,
    selectedRows,
    tabIndex,
    setTabIndex,
    productVersionsData,
    setScanEnabled,
    scanEnabled
  } = useContext(GlobalContext)

  const vulnData = [...vulData]

  const [imageVersionUpdate] = useMutation(UpdateImageVersion)

  const textColor = useColorModeValue('gray.700', 'white')
  const [searchInput, setSearchInput] = useState('')
  const [selectVersion, setSelectVersion] = useState('')
  const [selectStatus, setSelectStatus] = useState('')

  const [selectedOptions, setSelectedOptions] = useState([])
  const [selectedScanner, setSelectedScanner] = useState([])
  const [selectedStatus, setSelectedStatus] = useState([])
  const [filterData, setFilterData] = useState([])

  const [isLoading, setIsLoading] = useState(false)

  const pageSize = 8 // Number of rows to display per page
  const [currentPage, setCurrentPage] = useState(1)

  // Calculate the index range for the current page
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize

  const visibleData = vulnData.slice(startIndex, endIndex)

  const totalPages = Math.ceil(vulnData.length / pageSize)

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const {
    isOpen: isSBMOpen,
    onOpen: setSBMOpen,
    onClose: setSBMClose
  } = useDisclosure()

  const {
    isOpen: isRefreshOpen,
    onOpen: setRefreshOpen,
    onClose: setRefreshClose
  } = useDisclosure()

  const flattenedData = vulData.map((item, index) => {
    const allVulData = {
      ID: index + 1,
      CVEID: item.cveId,
      SEVERITY: item.severity[0],
      CVSS: item.cvss?.v3Score,
      COMPONENT: item.component?.name,
      VERSION: item.component?.version,
      FIXED_COMPONENT: item.component?.fixedInVersion[0],
      FIXED_PRODUCT: item.fixedInImage,
      SCANNER: item.scanners?.map((scanner) => scanner.name),
      VEX_JUSTIFICATION: item.vexVuln?.vexJustification?.name,
      VEX_STATUS: item.vexVuln?.vexStatus?.name
    }

    return allVulData
  })

  const [imageUpdate] = useMutation(ImageUpdate)

  const refreshImage = async () => {
    try {
      setIsLoading(true)
      await imageVersionUpdate({
        variables: {
          id: imgVersionId,
          scanRefresh: true
        }
      })
      setRefreshClose()
      setTimeout(() => {
        setIsLoading(false)
      }, 2000)
    } catch (error) {
      console.error('Mutation error:', error)
    }
  }

  const handleYes = async () => {
    try {
      await imageUpdate({
        variables: {
          id: imageId,
          scanEnabled: true
        }
      }).then(() => {
        refreshImage()
      })
      setTimeout(() => {
        setScanEnabled(true)
      }, 2000)
    } catch (error) {
      console.error('Mutation error:', error)
    }
  }

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

  const onVulnFilter = (item) => {
    setFilteredRow([])
    if (item === 'Unresolved') {
      const filterData = vulnData.filter(
        (item) =>
          item.vexVuln?.vexStatus?.name !== 'Fixed' &&
          item.vexVuln?.vexStatus?.name !== 'False Positive' &&
          item.vexVuln?.vexStatus?.name !== 'Not Affected'
      )
      console.log(`filter data`, filterData)
      setVulnerabilitiesData(filterData)
    } else {
      setVulnerabilitiesData(vulnData)
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
      } else if (field === 'severity') {
        const comparison = a[field][0].localeCompare(b[field][0])
        return order === 'asc' ? comparison : -comparison
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
                    {shareLynks.length > 0
                      ? shareLynks.map((row, idx) => (
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
                      : shareLynkLoading && (
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
                  </Flex>
                  <Flex gap={2} direction={'row'}>
                    <Box as={Flex} direction={'row'} gap={2}>
                      <Tooltip label='Import'>
                        <Button colorScheme='blue' size='md' disabled>
                          <BiImport />
                        </Button>
                      </Tooltip>
                      <Tooltip label='Export'>
                        <Button colorScheme='blue' size='md'>
                          <CSVLink
                            data={flattenedData.length > 0 ? flattenedData : ''}
                            filename='vulnerabilities.csv'
                          >
                            <BiExport />
                          </CSVLink>
                        </Button>
                      </Tooltip>
                      <Button
                        colorScheme='blue'
                        size='md'
                        onClick={scanEnabled ? refreshImage : setRefreshOpen}
                      >
                        Refresh
                      </Button>
                    </Box>
                  </Flex>
                </Flex>
              </CardHeader>
              <CardBody>
                {/* <BasicTable data={vulData} columns={columns} /> */}
                {vulData !== [] ? (
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
                          onClick={() => handleVulSort('severity')}
                          cursor={'pointer'}
                        >
                          <Flex direction={'row'} alignItems={'center'} gap={2}>
                            <Box>Severity</Box>
                            <Box>
                              {sortField === 'severity' &&
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
                          onClick={() => handleVulSort('v3Score')}
                          cursor={'pointer'}
                        >
                          <Flex direction={'row'} alignItems={'center'} gap={2}>
                            <Box>CVSS</Box>
                            <Box>
                              {sortField === 'v3Score' &&
                              sortOrder === 'asc' ? (
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
                              {sortField === 'version' &&
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
                        <Th
                          color='gray.400'
                          py={4}
                          position='relative'
                          // onClick={() => handleVulSort('fixed_product')}
                          cursor={'pointer'}
                        >
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
                              isRefresh={isLoading}
                              severity={row.severity[0]}
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
                              isRefresh={isLoading}
                              severity={row.severity[0]}
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
                                isRefresh={isLoading}
                                imgVersionId={imgVersionId}
                                severity={row.severity[0]}
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
                        : visibleData.length > 0
                        ? visibleData.map((row, idx) => {
                            return (
                              <VulnerabilityRow
                                refetch={refetch}
                                key={idx}
                                id={row.id}
                                isRefresh={isLoading}
                                severity={row.severity[0]}
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
                ) : (
                  <Flex
                    width={'100%'}
                    flexDirection={'row'}
                    alignItems={'center'}
                    justifyContent={'center'}
                    mt={24}
                  >
                    <Text>No vulnerability discovered on this tag</Text>
                  </Flex>
                )}
              </CardBody>

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
              </Flex>
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

      <Modal isOpen={isRefreshOpen} onClose={setRefreshClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Enable Scan</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize='lg'>
              Refreshing this will enable scan for this image
            </Text>
            <Text fontSize='sm' mt={5}>
              Are you sure you want to continue refreshing this page ?
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant='outline' mr={3} onClick={refreshImage}>
              No
            </Button>
            <Button colorScheme='blue' onClick={handleYes}>
              Yes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default SBOMTable
