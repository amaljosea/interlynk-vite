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
  Icon
} from '@chakra-ui/react'

import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import SBOMLinkRow from 'components/Tables/SBOMLinkRow.js'
import VulnerabilityRow from 'components/Tables/VulnerabilityRow.js'
import React, { useContext, useEffect } from 'react'
import GlobalContext from 'context/GlobalContext'
import CardHeader from 'components/Card/CardHeader'
import { useState, useRef } from 'react'
import { AddIcon } from '@chakra-ui/icons'
import { BiImport, BiExport } from 'react-icons/bi'
import { BsFilterRight } from 'react-icons/bs'
import SBOMDrawer from 'components/Drawer/SBOMDrawer'
import { CSVLink } from 'react-csv'
import { useMutation } from '@apollo/client'
import { UpdateImageVersion } from 'graphQL/Mutation'
import { ImageUpdate } from 'graphQL/Mutation'
import { vuln_captions } from 'utils'
import { FaEllipsisV } from 'react-icons/fa'
import MultiStatusDrawer from 'components/Drawer/MultiStatusDrawer'

const SBOMTable = ({
  imageId,
  setFilteredVulItems,
  imageVersionData,
  imgVersionId,
  refetch,
  imageInfo,
  loading,
  handlePreviousPage,
  handleNextPage
}) => {
  const {
    vulnerabilitiesData,
    setVulnerabilitiesData,
    setScanEnabled,
    scanEnabled
  } = useContext(GlobalContext)

  const [allVulResult, setAllVulResult] = useState([])

  useEffect(() => {
    if (imageVersionData) {
      // console.log('Vuln Data', imageVersionData.imageVulns.nodes)
      setAllVulResult(imageVersionData.imageVulns.nodes)
    }
  }, [imageVersionData])

  const vulnData = allVulResult

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

  const {
    isOpen: isStatusOpen,
    onOpen: setStatusOpen,
    onClose: setStatusClose
  } = useDisclosure()

  const flattenedData = allVulResult.map((item, index) => {
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
        .then(() => {
          window.location.reload()
        })
        .finally(() => {
          setTimeout(() => {
            setIsLoading(false)
          }, 2000)
        })
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
      })
        .then(() => {
          refreshImage()
        })
        .finally(() => {
          setTimeout(() => {
            setScanEnabled(true)
          }, 1000)
        })
    } catch (error) {
      console.error('Mutation error:', error)
    }
  }

  const [filteredRow, setFilteredRow] = useState([])

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

  // useEffect(() => {
  //   setVulnerabilitiesData([])
  //   const data = vulnData.filter(
  //     (item) =>
  //       item.cveId &&
  //       item.cveId.toLowerCase().includes(searchInput.toLowerCase())
  //   )
  //   setFilteredRow(data)
  // }, [searchInput])

  const [checkedRows, setCheckedRows] = useState([])

  return (
    <>
      <Card my='22px' overflowX={{ sm: 'scroll', xl: 'hidden' }}>
        <Tabs variant='enclosed'>
          <TabList mt='20px'>
            <Tab _focus={{ outline: 'none' }}>Vulnerabilities</Tab>
          </TabList>
          <TabPanels>
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
                      {checkedRows.length > 0 && (
                        <Button
                          colorScheme='blue'
                          size='md'
                          onClick={setStatusOpen}
                        >
                          <Icon
                            as={FaEllipsisV}
                            color='gray.100'
                            cursor='pointer'
                          />
                        </Button>
                      )}
                    </Box>
                  </Flex>
                </Flex>
              </CardHeader>
              {imageVersionData && (
                <>
                  <CardBody>
                    {imageVersionData.imageVulns.nodes.length > 0 ? (
                      <Table variant='simple' color={textColor} size='sm'>
                        <Thead>
                          <Tr my='.8rem' pl='0px'>
                            {vuln_captions.map((item, index) => (
                              <Th key={index} py={4}>
                                <Box>{item}</Box>
                              </Th>
                            ))}
                          </Tr>
                        </Thead>
                        <Tbody>
                          {imageVersionData.imageVulns.nodes.length > 0
                            ? imageVersionData.imageVulns.nodes.map(
                                (row, idx) => {
                                  return (
                                    <VulnerabilityRow
                                      refetch={refetch}
                                      key={idx}
                                      id={idx}
                                      isRefresh={isLoading}
                                      imgVersionId={imgVersionId}
                                      severity={row.severity[0]}
                                      component={row.component.name}
                                      version={row.component.version}
                                      cvss={row.cvss.v3Score}
                                      cve={row.cveId}
                                      fixed_component={
                                        row.component.fixedInVersion
                                      }
                                      fixed_product={
                                        row.vexVuln?.fixedByImageVersion?.name
                                      }
                                      description={row.component.name}
                                      status={row.vexVuln?.vexStatus}
                                      justify={row.vexVuln?.vexJustification}
                                      scanner={row.scanners}
                                      shared_data={row.component.name}
                                      versions={row.component.name}
                                      imageInfo={imageInfo}
                                      checkedRows={checkedRows}
                                      setCheckedRows={setCheckedRows}
                                    />
                                  )
                                }
                              )
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
                        mt={14}
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
                      isDisabled={
                        !imageVersionData.imageVulns.pageInfo.hasPreviousPage
                      }
                    >
                      Previous
                    </Button>
                    <Button
                      colorScheme='blue'
                      onClick={handleNextPage}
                      isDisabled={
                        !imageVersionData.imageVulns.pageInfo.hasNextPage
                      }
                    >
                      Next
                    </Button>
                  </Flex>
                </>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>

      {isStatusOpen && (
        <MultiStatusDrawer
          isOpen={isStatusOpen}
          onClose={setStatusClose}
          imgVersionId={imgVersionId}
          vulnRefetch={refetch}
          imageInfo={imageInfo}
          checkedRows={checkedRows}
          setCheckedRows={setCheckedRows}
        />
      )}

      {isRefreshOpen && (
        <Modal isOpen={isRefreshOpen} onClose={setRefreshClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Scan</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text fontSize='lg'>
                Refreshing this will enable scan for this image
              </Text>
              {/* <Text mt={5}>This image is disabled.</Text> */}
              <Text fontSize='sm' mt={5}>
                Are you sure you want to continue refresh this page ?
              </Text>
              {/* <Text fontSize='sm' mt={4}>
              ** Please enable it from image page
            </Text> */}
            </ModalBody>
            <ModalFooter>
              <Button variant='outline' mr={3} onClick={setRefreshClose}>
                No
              </Button>
              <Button colorScheme='blue' onClick={handleYes}>
                Yes
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  )
}

export default SBOMTable
