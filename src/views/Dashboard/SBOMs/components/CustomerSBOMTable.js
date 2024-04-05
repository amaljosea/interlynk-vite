import { useMutation } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { CSVLink } from 'react-csv'

// COMPONENTS
import {
  Box,
  Button,
  Flex,
  Input,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Skeleton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Table,
  Tabs,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'

import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import CardHeader from 'components/Card/CardHeader'
// HELPERS
import VulnerabilityRow from 'components/Tables/VulnerabilityRow.js'

import { useGlobalState } from 'hooks/useGlobalState'

import { UpdateImageVersion } from 'graphQL/Mutation'

import { BiExport, BiImport } from 'react-icons/bi'
// ICONS
import { BsFilterRight } from 'react-icons/bs'

const CustomerSBOMTable = ({
  data,
  loading,
  refetch,
  imgVersionId,
  imageInfo,
  imageVersionData,
  handlePreviousPage,
  handleNextPage
}) => {
  const { vulnerabilitiesData, setVulnerabilitiesData } = useGlobalState()

  const {
    isOpen: isRefreshOpen,
    onOpen: setRefreshOpen,
    onClose: setRefreshClose
  } = useDisclosure()

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

  const flattenedData =
    imageVersionData &&
    imageVersionData.imageVulns.nodes.map((item, index) => {
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

  useEffect(() => {
    const filterData =
      imageVersionData &&
      imageVersionData.imageVulns.nodes.filter((item) =>
        item.cveId.toLowerCase().includes(searchVul.toLowerCase())
      )
    // console.log('filterData', filterData)
    setFilteredRow(filterData)
  }, [searchVul])

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
      const filterData =
        imageVersionData &&
        imageVersionData.imageVulns.nodes.filter(
          (item) =>
            item.vexVuln?.vexStatus?.name !== 'Fixed' &&
            item.vexVuln?.vexStatus?.name !== 'Not Affected'
        )
      console.log(`filter data`, filterData)
      setSortedVulnData(filterData)
    } else {
      setSortedVulnData(imageVersionData.imageVulns.nodes)
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

  // const [imageVersionUpdate] = useMutation(UpdateImageVersion)

  // const refreshImage = async () => {
  //   try {
  //     await imageVersionUpdate({
  //       variables: {
  //         id: imgVersionId,
  //         scanRefresh: true
  //       }
  //     }).then(() => {
  //       window.location.reload()
  //     })
  //   } catch (error) {
  //     console.error('Mutation error:', error)
  //   }
  // }

  return (
    <>
      <Card my='22px' overflowX={{ sm: 'scroll', xl: 'hidden' }}>
        <Tabs variant='enclosed'>
          <TabList mt='20px'>
            <Tab>Vulnerabilities</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <CardHeader mb={4} as={Flex} gap={2}>
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
                            data={flattenedData ? flattenedData : ''}
                            filename='vulnerabilities.csv'
                          >
                            <BiExport />
                          </CSVLink>
                        </Button>
                      </Tooltip>
                      <Button
                        colorScheme='blue'
                        size='md'
                        onClick={() => window.location.reload()}
                      >
                        Refresh
                      </Button>
                    </Box>
                  </Flex>
                </Flex>
              </CardHeader>
              <CardBody>
                {imageVersionData &&
                imageVersionData.imageVulns.nodes.length > 0 ? (
                  <Table variant='simple' color={textColor} size='sm'>
                    <Thead>
                      <Tr my='.8rem' pl='0px'>
                        {[
                          'CVE ID',
                          'Severity',
                          'CVSS',
                          'Component',
                          'Version',
                          'Fixed (Component)',
                          'Fixed (Product)',
                          'Scanner',
                          'Status',
                          ''
                        ].map((item, index) => (
                          <Th key={index} py={4}>
                            <Box>{item}</Box>
                          </Th>
                        ))}
                      </Tr>
                    </Thead>
                    <Tbody>
                      {imageVersionData.imageVulns.nodes.length > 0
                        ? imageVersionData.imageVulns.nodes.map((row, idx) => {
                            return (
                              <VulnerabilityRow
                                refetch={refetch}
                                key={idx}
                                id={row.id}
                                severity={row.severity[0]}
                                imgVersionId={imgVersionId}
                                component={row.component.name}
                                version={row.component.version}
                                cvss={row.cvss.v3Score}
                                cve={row.cveId}
                                fixed_component={row.component.fixedInVersion}
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
                    mt={14}
                  >
                    <Text>No vulnerability discovered on this tag</Text>
                  </Flex>
                )}
              </CardBody>
              {imageVersionData && (
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
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>

      {/* <Modal isOpen={isRefreshOpen} onClose={setRefreshClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Scan</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize='lg'>
              Refreshing this will enable scan for this image
            </Text>

            <Text fontSize='sm' mt={5}>
              Are you sure you want to continue refresh this page ?
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant='outline' mr={3} onClick={setRefreshClose}>
              No
            </Button>
            <Button colorScheme='blue' onClick={refreshImage}>
              Yes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal> */}
    </>
  )
}

export default CustomerSBOMTable
