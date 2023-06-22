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
  Form,
  FormControl,
  FormLabel,
  Input,
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
  Select,
  Checkbox,
  CheckboxGroup
} from '@chakra-ui/react'
import React, { useContext, useEffect, useState } from 'react'

import { IoDocumentsSharp } from 'react-icons/io5'

import { tablesTableData, dashboardTableData, sbom } from 'variables/general'
import {
  ChevronDownIcon,
  AddIcon,
  LinkIcon,
  CopyIcon,
  PhoneIcon,
  SearchIcon
} from '@chakra-ui/icons'
import {
  FaBalanceScale,
  FaCubes,
  FaBug,
  FaUnlock,
  FaEllipsisV,
  FaFileDownload
} from 'react-icons/fa'
import { Link, useLocation } from 'react-router-dom'
import SBOMTable from '../SBOMs/components/SBOMTable'
import SBOMStatistics from '../SBOMs/components/SBOMStatistics'
import SBOMDrawer from 'components/Drawer/SBOMDrawer'
import GlobalContext from 'context/GlobalContext'
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CustomerSBOMTable from '../SBOMs/components/CustomerSBOMTable'
import CustomerModal from 'components/CustomerModal'
import FileUpload from 'components/FileUpload'

function Customer(data) {
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
  const [isConfirmed, setIsConfirmed] = useState(false)

  const { productVersionsData } = useContext(GlobalContext)

  const {
    isOpen: isSBMOpen,
    onOpen: setSBMOpen,
    onClose: setSBMClose
  } = useDisclosure()

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const [productInfo, setProductInfo] = useState(null)
  const product = queryParams.get('p')
  const version = queryParams.get('v')
  const { isOpen, onOpen, onClose } = useDisclosure()

  const initialRef = React.useRef(null)
  const finalRef = React.useRef(null)

  const exportData = () => {
    // const jsonString = "hello";
    // const link = document.createElement("a");
    // link.href = jsonString;
    // link.download = "data.json";
    // link.click();
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

  const [contains, setcontains] = useState({})

  useEffect(() => {
    const containsData = window.localStorage.getItem('contains')
    setcontains(JSON.parse(containsData))
    const path = window.localStorage.getItem('path')
    const checkURL = () => {
      if (window.location.href === path) {
        setIsConfirmed(true)
        // const email = prompt('Please enter your email address:')

        // if (email) {
        //   console.log('Email entered:', email)
        //   // Perform any further processing with the email address
        // } else {
        //   console.log('No email entered')
        //   // Handle the case where the user did not enter an email address
        // }
      }
    }

    checkURL()

    // Cleanup function
    return () => {
      // Any necessary cleanup code
    }
  }, [])

  const sbomgrVersion = ['v0.3', 'v0.2', 'v0.1']
  const [selectedVersion, setSelectedVersion] = useState('')

  const handleVersionUpdate = (e) => {
    const { value } = e.target
    setSelectedVersion(value)
  }

  return (
    <>
      <Flex direction='column' pt={{ base: '120px', md: '75px' }}>
        <Card mb='6'>
          <CardBody>
            <Grid
              h='60px'
              templateRows='repeat(2, 1fr)'
              templateColumns='repeat(10, 1fr)'
              gap={4}
              w='full'
            >
              <GridItem rowSpan={2} colSpan={1}>
                <Icon as={FaCubes} h={'64px'} w={'64px'} color='blue.300' />
              </GridItem>
              <GridItem colSpan={3}>
                <Heading as='h3' size='md' noOfLines={1} color='gray.600'>
                  interlynk/sbomqs
                </Heading>
                <Text fontSize='sm'>
                  {selectedVersion ? selectedVersion : 'v0.3'}
                </Text>
                <Text fontSize='sm'>Last Updated: 2023-03-31 06:31:25</Text>
              </GridItem>
              <GridItem
                rowSpan={2}
                colSpan={2}
                colStart={9}
                display='flex'
                gap={4}
                justifyContent='flex-end'
              >
                <Select
                  id='version'
                  value={selectedVersion}
                  onChange={handleVersionUpdate}
                  size='md'
                  width={'150px'}
                  color='gray.500'
                >
                  {sbomgrVersion.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Select>
                <FileUpload />
                <IconButton
                  aria-label='Download SBOM'
                  icon={<FaFileDownload />}
                  onClick={onOpen}
                  size='md'
                  colorScheme='blue'
                />
                <Modal
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
                            {contains.cycloneDX ? (
                              <Radio value='1'>CycloneDX</Radio>
                            ) : (
                              <Radio value='2'>SPDX</Radio>
                            )}
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
                </Modal>
              </GridItem>
            </Grid>
          </CardBody>
        </Card>
        <Flex direction='row' gap='2'>
          <SBOMStatistics
            icon={<Icon h={'24px'} w={'24px'} color='white' as={FaCubes} />}
            title={'Components'}
            description={'Components included in SBOM'}
            amount={contains.componentsVal ? contains.componentsVal : ''}
          />
          <Spacer />
          <SBOMStatistics
            icon={<Icon h={'24px'} w={'24px'} color='white' as={FaBug} />}
            title={'Total Vulnerabilities'}
            description={'Vulnerabilities included in SBOM'}
            amount={
              contains.VulnerabilitiesVal ? contains.VulnerabilitiesVal : ''
            }
          />
          <Spacer />
          <SBOMStatistics
            icon={<Icon h={'24px'} w={'24px'} color='white' as={FaBug} />}
            title={'Active Vulnerabilities'}
            description={'Vulnerabilities included in SBOM'}
            amount={contains.activeVulnVal ? contains.activeVulnVal : ''}
          />
          <Spacer />
          <SBOMStatistics
            icon={<Icon h={'24px'} w={'24px'} color='white' as={FaUnlock} />}
            title={'Risk Score'}
            description={'Aggregage Risk Score of SBOM'}
            amount={contains.riskScoreVal ? contains.riskScoreVal : ''}
          />

          <Spacer />
        </Flex>
        <CustomerSBOMTable
          title={'SBOM'}
          captions={[
            'Component',
            'Version',
            'Relates to',
            'License',
            // 'Risk Score',
            'Vulnerabilities',
            'Last Updated',
            ''
          ]}
          data={sbom}
        />
        {isConfirmed && <CustomerModal />}
      </Flex>
    </>
  ) // Return an empty fragment or any other component you may want to render
}

export default Customer
