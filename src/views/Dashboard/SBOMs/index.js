// Chakra imports
import {
  Flex,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  Heading,
  Spacer,
  Icon,
  Modal,
  ModalBody,
  FormLabel,
  ModalFooter,
  Button,
  Radio,
  RadioGroup,
  Stack,
  Grid,
  GridItem,
  Text,
  IconButton,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuOptionGroup,
  MenuItemOption,
  Box,
  Select,
  Checkbox,
  chakra,
  Image,
  Skeleton,
  TagLeftIcon
} from '@chakra-ui/react'
import React, { useContext, useEffect, useState } from 'react'
import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import SBOMTable from './components/SBOMTable'
import SBOMStatistics from './components/SBOMStatistics'

import { sbom } from 'variables/general'
import { ChevronDownIcon, AddIcon } from '@chakra-ui/icons'
import {
  FaCubes,
  FaBug,
  FaUnlock,
  FaFileDownload,
  FaTag,
  FaMicroscope
} from 'react-icons/fa'
import { useLocation } from 'react-router-dom'
import GlobalContext from 'context/GlobalContext'
import SBOMDrawer from 'components/Drawer/SBOMDrawer'
import Tooltip from 'components/Tooltip'
import { useQuery } from '@apollo/client'

import { scanImage } from 'utils'
import { getImageVersion, getImage } from 'graphQL/Queries'

function SBOMs() {
  const [scanResults, setScanResults] = useState([])

  const columns = [
    {
      Header: 'CVE',
      Footer: 'CVE',
      accessor: 'cveId',
      Cell: (row) => (
        <chakra.span fontSize={'sm'}>{row?.cell?.value}</chakra.span>
      )
    },
    {
      Header: 'SEVERITY',
      Footer: 'SEVERITY',
      accessor: 'severity',
      Cell: (row) => (
        <Flex>
          {row?.cell?.value.map((item, index) => (
            <chakra.span
              fontSize={'sm'}
              textTransform={'capitalize'}
              key={index}
            >
              {item}
            </chakra.span>
          ))}
        </Flex>
      )
    },
    {
      Header: 'CVSS',
      Footer: 'CVSS',
      accessor: ({ cvss }) => {
        if (cvss.v3Score) {
          return cvss.v3Score
        } else {
          return cvss.v2Score
        }
      },
      Cell: (row) => (
        <chakra.span fontSize={'sm'}>{row?.cell?.value}</chakra.span>
      )
    },
    {
      Header: 'COMPONENT',
      Footer: 'COMPONENT',
      accessor: 'component.name',
      Cell: (row) => (
        <chakra.span fontSize={'sm'}>{row?.cell?.value}</chakra.span>
      )
    },
    {
      Header: 'VERSION',
      Footer: 'VERSION',
      accessor: 'component.version',
      Cell: (row) => (
        <chakra.span fontSize={'sm'}>{row?.cell?.value}</chakra.span>
      )
    },
    {
      Header: 'FIXED (COMPONENT)',
      Footer: 'FIXED (COMPONENT)',
      accessor: 'component.fixedInVersion',
      Cell: (row) => (
        <Flex>
          {row?.cell?.value?.length > 0 &&
            row?.cell?.value?.map((item, index) => (
              <chakra.span fontSize={'sm'} key={index}>
                {item}
              </chakra.span>
            ))}
        </Flex>
      )
    },
    {
      Header: 'FIXED (IMAGE)',
      Footer: 'FIXED (IMAGE)',
      accessor: 'fixedInImage',
      Cell: (row) => (
        <chakra.span fontSize={'sm'}>{row?.cell?.value}</chakra.span>
      )
    },
    {
      Header: 'SCANNER',
      Footer: 'SCANNER',
      accessor: 'scanners',
      Cell: (row) => (
        <chakra.span>
          {row?.cell?.value.map((item, index) => (
            <Image
              src={scanImage(item.name)}
              key={index}
              height={8}
              width={8}
              objectFit={'contain'}
            />
          ))}
        </chakra.span>
      )
    }
  ]

  const [jsonData] = useState({
    id: 74,
    parentId: null,
    value: '',
    children: [
      {
        id: 62,
        parentId: 74,
        value: 'Task 7',
        children: [
          {
            id: 56,
            parentId: 62,
            value: 'Task 1'
          },
          {
            id: 63,
            parentId: 62,
            value: 'Task 4'
          }
        ]
      },
      {
        id: 86,
        parentId: 74,
        value: 'Task 8',
        children: [
          {
            id: 80,
            parentId: 86,
            value: 'Task 5',
            children: [
              {
                id: 81,
                parentId: 80,
                value: 'Task 2'
              },
              {
                id: 76,
                parentId: 80,
                value: 'Task 3'
              }
            ]
          },
          {
            id: 87,
            parentId: 86,
            value: 'Task 6'
          }
        ]
      }
    ]
  })

  const [scanner] = useState([
    { id: 0, name: 'All' },
    { id: 1, name: 'Grype' },
    { id: 2, name: 'Scout' },
    { id: 3, name: 'Snyk' },
    { id: 4, name: 'Trivy' }
  ])

  const [sharedWith] = useState([
    { id: 0, name: 'All' },
    { id: 1, name: 'IBM' },
    { id: 2, name: 'Oracle' },
    { id: 3, name: 'Redhat' },
    { id: 4, name: 'Uber' }
  ])

  const sbomqsVersions = ['v0.0.3', 'v0.0.2', 'v0.0.1']
  const sbomasmVersion = ['v1.2', 'v1.1', 'v1.0']
  const sbomgrVersion = ['v0.3', 'v0.2', 'v0.1']

  const {
    productVersionsData,
    setTabIndex,
    vulnerabilitiesData,
    componentsVal,
    setComponentsVal,
    VulnerabilitiesVal,
    setVulnerabilitiesVal,
    activeVulnVal,
    setActiveVulnVal,
    riskScoreVal,
    setRiskScoreVal,
    imageDetails,
    setImageDetails
  } = useContext(GlobalContext)

  // useEffect(() => {
  //   if (vulnData) {
  //     console.log('vulnData', vulnData.images[0].scanResults)
  //   }
  // }, [])

  const {
    isOpen: isSBMOpen,
    onOpen: setSBMOpen,
    onClose: setSBMClose
  } = useDisclosure()

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const versionId = queryParams.get('v')
  const imageId = queryParams.get('id')
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { data: imageData } = useQuery(getImage, {
    variables: { id: imageId }
  })

  const { data: imageVersionData, refetch } = useQuery(getImageVersion, {
    variables: {
      id: versionId,
      imageId: imageId
    },
    onCompleted: refetch
  })

  useEffect(() => {
    if (imageVersionData) {
      // console.log('imageVersionData', imageVersionData)
      setScanResults(imageVersionData.imageVersion.imageVulns)
    }
  }, [imageVersionData])

  useEffect(() => {
    if (imageData) {
      // console.log('imageData', imageData.image)
      setImageDetails(imageData.image)
    }
  }, [imageData])

  const cloudVersion = window.localStorage.getItem('version')
  const cloudScanner = window.localStorage.getItem('scanner')

  const [selectedVersion, setSelectedVersion] = useState('')
  const [selectedScanner, setSelectedScanner] = useState('')

  useEffect(() => {
    if (imageData) {
      setSelectedVersion(
        imageData.image.imageVersions[imageData.image.imageVersions.length - 1]
      )
    }
  }, [imageData])

  const initialRef = React.useRef(null)
  const finalRef = React.useRef(null)

  const exportData = () => {
    const fileData = JSON.stringify(jsonData)
    const blob = new Blob([fileData])
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = 'user-info44444.json'
    link.href = url
    link.click()
  }

  const uniqProjects = []
  const btnRef = React.useRef()

  productVersionsData.map((project) => {
    if (uniqProjects.indexOf(project.name) === -1) {
      uniqProjects.push(project.name)
    }
  })
  const uniqVersions = []
  productVersionsData.map((project) => {
    project.versions.map((version) => {
      if (uniqVersions.indexOf(version.version) === -1) {
        uniqVersions.push(version.version)
      }
    })
  })

  const sortSBOM = sbom.sort((a, b) => a.component.localeCompare(b.component))

  const handleVersionUpdate = (e) => {
    const { value } = e.target
    setSelectedVersion(value)
    window.localStorage.setItem('version', value)
    // window.location.reload()

    if (value === 'v0.1') {
      setComponentsVal(131)
    } else if (value === 'v0.2') {
      setComponentsVal(142)
    } else if (value === 'v0.3') {
      setComponentsVal(126)
    }

    if (value === 'v0.1') {
      setVulnerabilitiesVal('2C, 10H, 5M, 4L')
    } else if (value === 'v0.2') {
      setVulnerabilitiesVal('2C, 9H, 6M, 4L')
    } else if (value === 'v0.3') {
      setVulnerabilitiesVal('2C, 9H, 5M, 4L')
    }

    if (value === 'v0.1') {
      setActiveVulnVal('2C, 3H, 3M, 4L')
    } else if (value === 'v0.2') {
      setActiveVulnVal('1C, 3H, 3M, 4L')
    } else if (value === 'v0.3') {
      setActiveVulnVal('1C, 1H, 3M, 4L')
    }

    if (value === 'v0.1') {
      setRiskScoreVal(26)
    } else if (value === 'v0.2') {
      setRiskScoreVal(25)
    } else if (value === 'v0.3') {
      setRiskScoreVal(22)
    }
  }

  const [selectedScannerItem, setSelectedScannerItem] = useState([])
  const [filteredVulItems, setFilteredVulItems] = useState([])

  const handleScanner = (e) => {
    const { value } = e.target
    setSelectedScanner(value)
    setSelectedScannerItem(value)
    window.localStorage.setItem('scanner', value)
    if (selectedScannerItem.includes(value)) {
      const filterItem = selectedScannerItem.filter((itm) => itm !== `${value}`)
      setSelectedScannerItem(filterItem)
    } else {
      setSelectedScannerItem((prev) => [...prev, value])
    }
  }

  const filteredByCompany = (com) => {
    const company = vulnerabilitiesData.filter((item) =>
      item.shared_data.includes(com.name)
    )
    setFilteredVulItems(company)
    console.log('company', company)
  }

  const filterObjectsByScanner = (selectedScanner) => {
    return vulnerabilitiesData.filter((obj) => {
      return selectedScanner.some((scanner) => obj.scanner.includes(scanner))
    })
  }

  useEffect(() => {
    // If no options are selected, display all data
    if (selectedScannerItem.length === 0) {
      setFilteredVulItems(vulnerabilitiesData)
    }

    // Filter the data based on selected options
    const items = filterObjectsByScanner(selectedScannerItem)
    setFilteredVulItems(items)

    // console.log('filter', filterObjectsByScanner(selectedScanner))
  }, [selectedScannerItem])

  useEffect(() => {
    // console.log(cloudVersion)
    // console.log(cloudScanner)
    cloudVersion !== null
      ? setSelectedVersion(`${cloudVersion}`)
      : setSelectedVersion('v0.0.3')

    cloudScanner !== null
      ? setSelectedScanner(cloudScanner)
      : setSelectedScanner('All')
  }, [cloudVersion, cloudScanner])

  useEffect(() => {
    setTabIndex(1)
    setSelectedScanner('All')
  }, [])

  return (
    <Flex direction='column' pt={{ base: '120px', md: '75px' }}>
      <Card mb='6'>
        <CardBody>
          <Grid width={'100%'} templateColumns='repeat(5, 1fr)'>
            <GridItem colSpan={2}>
              <Flex
                direction={'row'}
                alignItems={'center'}
                gap={5}
                width={'100%'}
              >
                <Icon as={FaCubes} h={'64px'} w={'64px'} color='blue.300' />
                <Box>
                  <Heading as='h3' size='md' noOfLines={1} color='gray.600'>
                    {imageDetails
                      ? `${imageDetails.name}:${
                          imageDetails.imageVersions[
                            imageDetails.imageVersions.length - 1
                          ].name
                        }`
                      : 'Loading....'}
                  </Heading>
                  <Text fontSize='sm'>linux/amd64</Text>
                  <Text fontSize='sm' mb={2}>
                    Last Pushed:{' '}
                    {imageDetails
                      ? new Date(imageDetails.updatedAt)
                          .toISOString()
                          .slice(0, 10)
                      : 'Loading..'}
                  </Text>
                  {imageDetails ? (
                    imageDetails.imageScanners.map((result, index) => (
                      <Flex
                        key={index}
                        flexDirection={'row'}
                        alignItems={'center'}
                        gap={2}
                        mb={2}
                      >
                        <Tooltip text={`${result.name}`}>
                          <Image
                            width={4}
                            objectFit={'contain'}
                            src={`${scanImage(result.name)}`}
                            alt={result}
                          />
                        </Tooltip>
                        <Text fontSize={'xs'}>2023-07-01</Text>
                      </Flex>
                    ))
                  ) : (
                    <Skeleton height={'2'} />
                  )}
                </Box>
              </Flex>
            </GridItem>
            <GridItem colSpan={3}>
              <Flex
                direction={'row'}
                gap={4}
                justifyContent='flex-end'
                ml={'auto'}
              >
                <Flex flexDirection={'row'} alignItems={'center'} gap={2}>
                  <FaTag size={18} color='darkgray' />
                  <Select
                    id='version'
                    value={selectedVersion.name}
                    onChange={handleVersionUpdate}
                    size='md'
                    width={'150px'}
                    color='gray.500'
                  >
                    {imageDetails &&
                      imageDetails.imageVersions &&
                      imageDetails.imageVersions.map((img, index) => (
                        <option key={index} value={img.id}>
                          {img.name}
                        </option>
                      ))}
                  </Select>
                </Flex>
                <Flex flexDirection={'row'} alignItems={'center'} gap={2}>
                  <FaMicroscope size={20} color='darkgray' />
                  <Select
                    id='scanner'
                    value={selectedScanner}
                    onChange={handleScanner}
                    size='md'
                    width={'150px'}
                    color='gray.500'
                  >
                    {scanner.map((item) => (
                      <option key={item.id} value={item.name}>
                        {item.name}
                      </option>
                    ))}

                    {/* {imageDetails &&
                    imageDetails.imageScanners &&
                    imageDetails.imageScanners.map((item) => (
                      <option key={item.id} value={item.name}>
                        {item.name}
                      </option>
                    ))} */}
                  </Select>
                </Flex>
                {/* <Menu>
                  <MenuButton
                    as={Button}
                    rightIcon={<ChevronDownIcon />}
                    px={4}
                    py={2}
                    me={2}
                    width={'150px'}
                    transition='all 0.2s'
                    borderRadius='md'
                    borderWidth='1px'
                    fontSize='sm'
                    fontWeight='none'
                  >
                    Shared with
                  </MenuButton>
                  <MenuList fontWeight='none' fontSize='sm'>
                    <MenuOptionGroup>
                      {sharedWith.map((item) => (
                        <MenuItemOption
                          key={item.id}
                          value={item.name}
                          onClick={() => filteredByCompany(item)}
                        >
                          {item.name}
                        </MenuItemOption>
                      ))}
                    </MenuOptionGroup>
                  </MenuList>
                </Menu> */}
                {/* <Button
                  width={'120px'}
                  colorScheme='blue'
                  fontSize={'sm'}
                  leftIcon={<AddIcon />}
                  onClick={setSBMOpen}
                >
                  Share Link
                </Button>
                <SBOMDrawer
                  isOpen={isSBMOpen}
                  onClose={setSBMClose}
                  btnRef={btnRef}
                  uniqProjects={uniqProjects}
                  uniqVersions={uniqVersions}
                /> */}
                {/* <IconButton
                  aria-label='Download SBOM'
                  icon={<FaFileDownload />}
                  onClick={onOpen}
                  colorScheme='blue'
                /> */}
                {/* <Modal
                  initialFocusRef={initialRef}
                  finalFocusRef={finalRef}
                  isOpen={isOpen}
                  onClose={onClose}
                >
                  <ModalOverlay />
                  <ModalContent>
                    <ModalHeader>SBOM Download</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                      <FormLabel align='center'>SBOM Specification</FormLabel>
                      <Stack direction='column' gap='20px'>
                        <RadioGroup defaultValue='1'>
                          <Stack spacing={4} direction='row'>
                            <Radio value='1'>CycloneDX</Radio>
                            <Radio value='2'>SPDX</Radio>
                          </Stack>
                        </RadioGroup>
                      </Stack>

                      <FormLabel align='center' pt='30px'>
                        File Format
                      </FormLabel>
                      <Stack direction='column' gap='20px'>
                        <RadioGroup defaultValue='1'>
                          <Stack spacing={4} direction='row'>
                            <Radio value='1'>JSON</Radio>
                            <Radio value='2'>XML</Radio>
                          </Stack>
                        </RadioGroup>

                        <Stack direction='column' gap='5px'>
                          <Checkbox defaultChecked>
                            Include Vulnerabilities
                          </Checkbox>
                          <Checkbox defaultChecked>
                            Include Vulnerability Status (VEX)
                          </Checkbox>
                        </Stack>
                      </Stack>
                    </ModalBody>

                    <ModalFooter>
                      <Button colorScheme='blue' mr={3} onClick={exportData}>
                        Download
                      </Button>

                      <Button onClick={onClose}>Cancel</Button>
                    </ModalFooter>
                  </ModalContent>
                </Modal> */}
              </Flex>
            </GridItem>
          </Grid>
        </CardBody>
      </Card>
      <Flex direction='row' gap='2'>
        <SBOMStatistics
          icon={<Icon h={'24px'} w={'24px'} color='white' as={FaCubes} />}
          title={'Components'}
          description={'Components included in SBOM'}
          amount={componentsVal !== '' ? componentsVal : 126}
        />
        <Spacer />
        <SBOMStatistics
          icon={<Icon h={'24px'} w={'24px'} color='white' as={FaBug} />}
          title={'Total Vulnerabilities'}
          description={'Vulnerabilities included in SBOM'}
          amount={
            VulnerabilitiesVal !== '' ? VulnerabilitiesVal : '2C, 9H, 5M, 4L'
          }
        />
        <Spacer />
        <SBOMStatistics
          icon={<Icon h={'24px'} w={'24px'} color='white' as={FaBug} />}
          title={'Active Vulnerabilities'}
          description={'Vulnerabilities included in SBOM'}
          amount={activeVulnVal !== '' ? activeVulnVal : '1C, 1H, 3M, 4L'}
        />
        <Spacer />
        <SBOMStatistics
          icon={<Icon h={'24px'} w={'24px'} color='white' as={FaUnlock} />}
          title={'Risk Score'}
          description={'Aggregage Risk Score of SBOM'}
          amount={riskScoreVal !== '' ? riskScoreVal : 22}
        />
      </Flex>
      <SBOMTable
        title={'SBOM'}
        captions={[
          'component',
          'version',
          'relates to',
          'license',
          'risk_score',
          'vulnerabilities',
          'last_updated',
          ''
        ]}
        vulData={scanResults}
        data={sortSBOM}
        columns={columns}
        filteredVul={filteredVulItems}
        setFilteredVulItems={setFilteredVulItems}
      />
    </Flex>
  )
}

export default SBOMs
