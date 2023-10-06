// Chakra imports
import {
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon
} from '@chakra-ui/icons'
import {
  Flex,
  Text,
  useDisclosure,
  Tag,
  TagLabel,
  Icon,
  useColorModeValue,
  Button,
  Link,
  Input,
  Box,
  Grid,
  GridItem,
  Tooltip,
  Stack,
  Menu,
  MenuButton,
  MenuList,
  MenuItemOption,
  MenuOptionGroup,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Badge,
  Select,
  FormControl,
  FormLabel,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useToast,
  IconButton,
  ButtonGroup
} from '@chakra-ui/react'
import DataTable from 'react-data-table-component'
import { FaEllipsisV, FaFilter } from 'react-icons/fa'
import { FaCopy } from 'react-icons/fa6'
import { useState, useRef, useMemo, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { sevColor } from 'utils'
import StatusDrawer from 'components/Drawer/StatusDrawer'
import styled from '@emotion/styled'
import CopyTable from './CopyTable'
import Multistep from 'views/Sbom/components/Multistep'

const customStyles = {
  headCells: {
    style: {
      fontWeight: 'bold',
      color: '#2D3748',
      fontSize: '12px',
      letterSpacing: '1px'
    }
  },
  subHeader: {
    style: {
      padding: 0,
      margin: 0
    }
  }
}

const statusColor = (status) => {
  if (status && status === 'Fixed') {
    return 'blue'
  } else if (status && status === 'Not Affected') {
    return 'green'
  } else if (status && status === 'Affected') {
    return 'red'
  } else if (status && status === 'False Positive') {
    return 'gray'
  } else {
    return 'cyan'
  }
}

const FilterComponent = ({ filterText, onFilter, onClear }) => {
  const searchInputRef = useRef()

  const focusSearchInput = () => {
    if (searchInputRef?.current) {
      searchInputRef?.current.focus()
    }
  }

  const handleKeyPress = (e) => {
    if (e.ctrlKey && e.key === '/') {
      focusSearchInput()
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)

    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [])

  return (
    <>
      <Input
        width={'400px'}
        id='search'
        type='text'
        placeholder='Search'
        aria-label='Search Input'
        ref={searchInputRef}
      />
    </>
  )
}

const VulnTable = ({ data }) => {
  const location = useLocation()
  const toast = useToast()
  const customerView = location.pathname.startsWith('/customer')

  const textColor = useColorModeValue('gray.700', 'white')

  const [activeRow, setActiveRow] = useState(null)
  const [vulData, setVulData] = useState([])
  const [version, setVersion] = useState('')

  // STEPS
  const [step, setStep] = useState(1)
  const [progress, setProgress] = useState(20)

  const [stepTitle, setStepTitle] = useState('')

  const [filterBySev, setFilterBySev] = useState([])
  const [filterByStatus, setFilterByStatus] = useState([])

  const activeSevCount = filterBySev.length
  const activeStatusCount = filterByStatus.length

  const [filterText, setFilterText] = useState('')
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false)

  const [filteredItems, setFilteredItems] = useState([])

  useEffect(() => {
    const filterData = data.filter(
      (item) =>
        (item.cve &&
          item.cve.toLowerCase().includes(filterText.toLowerCase())) ||
        (item.component &&
          item.component.toLowerCase().includes(filterText.toLowerCase()))
    )

    setFilteredItems(filterData)
  }, [filterText])

  const btnRef = useRef(null)
  const tableRef = useRef()

  const { isOpen, onOpen, onClose } = useDisclosure()

  const {
    isOpen: isCopyOpen,
    onOpen: onCopyOpen,
    onClose: onCopyClose
  } = useDisclosure()

  const {
    isOpen: isTableOpen,
    onOpen: onTableOpen,
    onClose: onTableClose
  } = useDisclosure()

  const columns = [
    // CVE ID
    {
      id: 'cve',
      name: 'CVE ID',
      selector: (row) => {
        const { cve } = row
        return (
          <Link
            href={`https://nvd.nist.gov/vuln/detail/${cve}`}
            target={'_blank'}
          >
            <Flex direction='row' alignItems={'center'} gap={2}>
              <Icon as={ExternalLinkIcon} h={'16px'} w={'16px'} />
              <Text fontSize='sm' color={textColor}>
                {cve}
              </Text>
            </Flex>
          </Link>
        )
      },
      width: '200px'
    },
    // SEVERITY
    {
      id: 'serverity',
      name: 'SEVERITY',
      selector: (row) => (
        <Tag
          size='md'
          key='md'
          variant='subtle'
          colorScheme={sevColor(row.severity)}
          textTransform={'capitalize'}
          width={'100%'}
          alignItems={'center'}
          justifyContent={'center'}
        >
          <TagLabel>{row.severity}</TagLabel>
        </Tag>
      ),
      width: '150px'
    },
    // CVSS
    {
      id: 'cvss',
      name: 'CVSS',
      selector: (row) => {
        const { cvss, severity } = row
        return (
          <Flex minWidth='max-content' alignItems='center' gap='2'>
            <Tag
              size='md'
              key='md'
              variant='subtle'
              colorScheme={sevColor(`${severity}`)}
            >
              <TagLabel>{cvss}</TagLabel>
            </Tag>
          </Flex>
        )
      },
      width: '100px'
    },
    // COMPONENT
    {
      id: 'component',
      name: 'COMPONENT',
      selector: (row) => {
        const { component } = row
        return (
          <Tooltip label={component} placement='top'>
            <Text textTransform={'capitalize'}>
              {component !== null
                ? `${component?.substring(0, 20)}${
                    component.length > 20 ? '...' : ''
                  }`
                : ''}
            </Text>
          </Tooltip>
        )
      },
      width: '200px'
    },
    // VERSION
    {
      id: 'version',
      name: 'VERSION',
      selector: (row) => row.version,
      width: '200px'
    },
    {
      id: 'source',
      name: 'SOURCE',
      selector: (row) => (
        <Tag size='sm' variant='outline' colorScheme='blue'>
          {row.source}
        </Tag>
      )
    },
    {
      id: 'status',
      name: 'STATUS',
      selector: (row) => {
        const { status } = row
        return (
          <Tag
            fontWeight={'normal'}
            variant='solid'
            size='sm'
            colorScheme={statusColor(status)}
          >
            {status}
          </Tag>
        )
      }
    },
    // ACTION
    {
      id: 'action',
      name: 'ACTION',
      selector: (row) => {
        return (
          <>
            {!customerView && (
              <Button
                p='0px'
                bg='transparent'
                ref={btnRef}
                onClick={() => {
                  setActiveRow(row)
                  onOpen()
                }}
              >
                <Icon as={FaEllipsisV} color='gray.400' cursor='pointer' />
              </Button>
            )}
          </>
        )
      },
      omit: customerView
    }
  ]

  const handleCopy = () => {
    if (version !== '') {
      onCopyClose()
      onTableOpen()
    } else {
      toast({
        description: 'Please select any version',
        position: 'top',
        duration: 2000,
        status: 'error'
      })
    }
  }

  const subHeaderComponentMemo = useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle)
        setFilterText('')
      }
    }

    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Stack
          width={'100%'}
          direction={'row'}
          spacing={4}
          alignItems={'flex-start'}
        >
          <FilterComponent
            onFilter={(e) => setFilterText(e.target.value)}
            onClear={handleClear}
            filterText={filterText}
          />

          <Box width={'fit-content'} position={'relative'}>
            {/* Severity */}
            <Menu closeOnSelect={true}>
              {activeSevCount > 0 && (
                <Badge
                  variant='solid'
                  colorScheme='teal'
                  position={'absolute'}
                  right={-2}
                  top={-1.5}
                  zIndex={11}
                >
                  {activeSevCount}
                </Badge>
              )}
              <MenuButton
                as={Button}
                colorScheme='blue'
                fontWeight='normal'
                fontSize={'sm'}
                leftIcon={<FaFilter size={14} />}
              >
                Severity
              </MenuButton>
              <MenuList>
                <MenuOptionGroup
                  type='radio'
                  onChange={() => window.location.reload()}
                >
                  <MenuItemOption value={'All'} fontSize={'sm'}>
                    All
                  </MenuItemOption>
                </MenuOptionGroup>
                <MenuOptionGroup
                  type='checkbox'
                  onChange={(value) => setFilterBySev(value)}
                >
                  <MenuItemOption value={'Critical'} fontSize={'sm'}>
                    Critical
                  </MenuItemOption>
                  <MenuItemOption value={'High'} fontSize={'sm'}>
                    High
                  </MenuItemOption>
                  <MenuItemOption value={'Medium'} fontSize={'sm'}>
                    Medium
                  </MenuItemOption>
                  <MenuItemOption value={'Low'} fontSize={'sm'}>
                    Low
                  </MenuItemOption>
                </MenuOptionGroup>
              </MenuList>
            </Menu>
          </Box>

          <Box width={'fit-content'} position={'relative'}>
            {/* Status */}
            <Menu closeOnSelect={true}>
              {activeStatusCount > 0 && (
                <Badge
                  variant='solid'
                  colorScheme='teal'
                  position={'absolute'}
                  right={-2}
                  top={-1.5}
                  zIndex={11}
                >
                  {activeStatusCount}
                </Badge>
              )}
              <MenuButton
                as={Button}
                colorScheme='blue'
                fontWeight='normal'
                fontSize={'sm'}
                leftIcon={<FaFilter size={14} />}
              >
                Status
              </MenuButton>
              <MenuList>
                <MenuOptionGroup
                  type='radio'
                  onChange={() => window.location.reload()}
                >
                  <MenuItemOption value={'All'} fontSize={'sm'}>
                    All
                  </MenuItemOption>
                </MenuOptionGroup>
                <MenuOptionGroup
                  type='checkbox'
                  onChange={(value) => setFilterByStatus(value)}
                >
                  {[
                    'In Triage',
                    'False Positive',
                    'Affected',
                    'Not Affected',
                    'Fixed'
                  ].map((option, index) => (
                    <MenuItemOption
                      key={index}
                      value={option}
                      textTransform='capitalize'
                      fontSize={'sm'}
                    >
                      {option}
                    </MenuItemOption>
                  ))}
                </MenuOptionGroup>
              </MenuList>
            </Menu>
          </Box>
        </Stack>

        <Tooltip label='Import Statuses'>
          <IconButton
            variant='solid'
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            onClick={onCopyOpen}
            icon={<FaCopy size={18} />}
          />
        </Tooltip>
      </Flex>
    )
  }, [
    filterText,
    resetPaginationToggle,
    filterBySev,
    filterByStatus,
    activeSevCount,
    activeStatusCount
  ])

  const ExpandedComponent = () => {
    const CustomText = styled(Text)`
      font-size: 13px;
      font-weight: bold;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 0.6px;
    `

    return (
      <Box
        width={'100%'}
        p={5}
        boxShadow='inset 0px -5px 5px rgba(0, 0, 0, 0.08), inset 0px 5px 5px rgba(0, 0, 0, 0.08)'
      >
        <Grid
          templateColumns='repeat(2, 1fr)'
          gap={6}
          width={'80%'}
          margin={'0 auto'}
        >
          <GridItem w='100%'>
            <CustomText>Description :</CustomText>
            <Text mt={1} fontSize={14}>
              {
                'Heap buffer overflow in libwebp in Google Chrome prior to 116.0.5845.187 and libwebp 1.3.2 allowed a remote attacker to perform an out of bounds memory write via a crafted HTML page. (Chromium security severity: Critical)'
              }
            </Text>
          </GridItem>
          <GridItem w='100%'></GridItem>
        </Grid>
      </Box>
    )
  }

  const handleSubmit = () => {
    setStep(1)
    setProgress(20)
    onTableClose()
    toast({
      description: 'Data Imported successsfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top'
    })
  }

  useEffect(() => {
    if (step === 1) {
      setStepTitle('Import from page')
    } else if (step === 2) {
      setStepTitle('Import sources')
    } else if (step === 3) {
      setStepTitle('Components view')
    } else if (step === 4) {
      setStepTitle('Vulnerability view')
    } else if (step === 5) {
      setStepTitle('Status history')
    }
  }, [step])

  return (
    <>
      {data.length > 0 ? (
        <Flex flexDir={'column'} width={'100%'}>
          <DataTable
            columns={columns}
            data={filteredItems}
            customStyles={customStyles}
            progressPending={data.length === 0}
            subHeader
            subHeaderComponent={subHeaderComponentMemo}
            responsive={true}
            expandableRows
            expandableRowsComponent={ExpandedComponent}
          />
        </Flex>
      ) : (
        <Flex
          width={'100%'}
          mt={4}
          alignItems={'center'}
          justifyContent={'center'}
        >
          <Text>No vulnerabilities data found</Text>
        </Flex>
      )}

      {/* COPY MODAL */}
      {isCopyOpen && (
        <Modal isOpen={isCopyOpen} onClose={onCopyClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalCloseButton />
            <ModalHeader>Import Vulnerability Statuses</ModalHeader>
            <ModalBody mt={2}>
              <FormControl>
                <FormLabel>Import From:</FormLabel>
                <Select
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                >
                  <option value=''>-- Select --</option>
                  <option value='v.1'>v0.1.0</option>
                  <option value='v1.0'>v1.0.0</option>
                  <option value='v2.0'>v2.0.0</option>
                  <option value='v3.0'>v3.0.0</option>
                </Select>
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button mr={3} onClick={onCopyClose}>
                Cancel
              </Button>
              <Button variant='solid' colorScheme='blue' onClick={handleCopy}>
                Apply
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* COPY DATA TABLE */}
      {isTableOpen && (
        <Drawer
          isOpen={isTableOpen}
          placement='right'
          size='full'
          onClose={onTableClose}
          finalFocusRef={tableRef}
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>
              <Text fontSize={20} fontWeight={'medium'}>
                {stepTitle}
              </Text>
            </DrawerHeader>

            <DrawerBody mt={2}>
              {/* <CopyTable
                data={[
                  {
                    cve: 'CVE-2023-24532',
                    component: 'dropwizard-core',
                    version: '1.2.4',
                    status: 'In Triage',
                    newStatus: 'False Positive',
                    notes: 'In Triage'
                  },
                  {
                    cve: 'CVE-2017-16921',
                    component: 'samza-pre',
                    version: '0.7.3',
                    status: 'In Triage',
                    newStatus: 'Fixed',
                    notes: 'In Triage'
                  },
                  {
                    cve: 'CVE-2021-14922',
                    component: 'samza-core',
                    version: '0.7.3',
                    status: 'Fixed',
                    newStatus: 'Affected',
                    notes: 'In Triage'
                  }
                ]}
              /> */}

              {/* IMPORT WIZARD */}
              <Multistep step={step} progress={progress} />
            </DrawerBody>

            <DrawerFooter>
              <Stack
                width={'100%'}
                justifyContent={'space-between'}
                direction={'row'}
                spacing={4}
              >
                <ButtonGroup>
                  {step > 1 && (
                    <Button
                      leftIcon={<ChevronLeftIcon w={6} h={6} />}
                      onClick={() => {
                        setStep(step - 1)
                        setProgress(progress - 20)
                      }}
                      isDisabled={step === 1}
                      colorScheme='blue'
                      variant='solid'
                    >
                      Back
                    </Button>
                  )}

                  <Button onClick={onTableClose}>Cancel</Button>
                </ButtonGroup>
                {step === 5 ? (
                  <Button
                    colorScheme='red'
                    variant='solid'
                    onClick={handleSubmit}
                  >
                    Submit
                  </Button>
                ) : (
                  <Button
                    isDisabled={step === 5}
                    rightIcon={<ChevronRightIcon w={6} h={6} />}
                    onClick={() => {
                      setStep(step + 1)
                      if (step === 5) {
                        setProgress(100)
                      } else {
                        setProgress(progress + 20)
                      }
                    }}
                    colorScheme='blue'
                    variant='solid'
                  >
                    Next
                  </Button>
                )}
              </Stack>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}

      {/* ACTIONS */}
      {activeRow !== null && (
        <>
          {isOpen && (
            <StatusDrawer
              isOpen={isOpen}
              onClose={onClose}
              btnRef={btnRef}
              id={activeRow.id}
              component={activeRow.component}
              version={activeRow.version}
              imageInfo={null}
              imgVersionId={null}
              cve={activeRow.cve}
              textColor={textColor}
              setSelectVersion={null}
              vulnRefetch={null}
              status={activeRow.status}
              setVulData={setVulData}
            />
          )}
        </>
      )}
    </>
  )
}

export default VulnTable
