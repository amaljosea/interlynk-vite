import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { AddIcon } from '@chakra-ui/icons'
import {
  Button,
  Flex,
  HStack,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Portal,
  Stack,
  Text,
  Tooltip,
  useDisclosure,
  FormControl,
  FormLabel,
  Select,
  Tag,
  TagLabel,
  UnorderedList,
  ListItem,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react'
import CustomLoader from 'components/CustomLoader'
import VulnBadge from 'components/Misc/VulnBadge'
import { SbomPartDelete } from 'graphQL/Mutation'
import { SbomPartCreate } from 'graphQL/Mutation'
import { GetProject } from 'graphQL/Queries'
import { GetProjectData } from 'graphQL/Queries'
import { useGlobalState } from 'hooks/useGlobalState'
import { useMemo, useRef, useState } from 'react'
import DataTable from 'react-data-table-component'
import { FaEllipsisV, FaFilter } from 'react-icons/fa'
import { useLocation, Link, useParams } from 'react-router-dom'
import { getFullDateAndTime } from 'utils'
import { removeDuplicates } from 'utils'
import SearchFilter from 'views/Sbom/components/SearchFilter'

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

const PartsTable = ({ data, refetch, getVulnData, getCompData }) => {
  const location = useLocation()
  const params = useParams()
  const queryParams = new URLSearchParams(location.search)
  const sbomId = queryParams.get('sbom')
  const prodId = queryParams.get('id')

  const {
    setActiveSbomTab,
    setActiveProdTab,
    totalRows,
    prodState,
    prodCompState,
    prodVulnState,
    dispatch
  } = useGlobalState()
  const { prodVulnDispatch } = dispatch

  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose
  } = useDisclosure()

  const addBtn = useRef()

  const [selectedProd, setSelectedProd] = useState('')
  const [selectedVersion, setSelectedVersion] = useState('')
  const [uniqVersions, setUniqVersions] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [activeRow, setActiveRow] = useState(null)
  const { data: allProducts } = useQuery(GetProjectData, {
    variables: {
      first: 50,
      field: prodState.field,
      direction: prodState.direction
    }
  })

  const [createSbomPart] = useMutation(SbomPartCreate)
  const [deleteSbomPart] = useMutation(SbomPartDelete)

  const handleCreatePart = async () => {
    await createSbomPart({
      variables: {
        parentSbomId: sbomId,
        partSbomId: selectedVersion
      }
    })
      .then((res) => {
        if (res.data) {
          refetch({
            variables: {
              projectId: prodId,
              sbomId: sbomId
            }
          })
        }
      })
      .finally(() => {
        setSelectedProd('')
        setSelectedVersion('')
        onClose()
      })
  }

  const handleRemove = async () => {
    await deleteSbomPart({
      variables: {
        id: activeRow.id
      }
    })
      .then((res) => {
        if (res.data) {
          refetch({
            variables: {
              projectId: prodId,
              sbomId: sbomId
            }
          })
        }
      })
      .finally(() => onDeleteClose())
  }

  const productList =
    allProducts &&
    [...allProducts.projects.nodes]
      .filter((item) => item.enabled === true)
      .map((option) => ({
        value: option.id,
        label: option.name
      }))

  const [getProduct] = useLazyQuery(GetProject)

  const handleSelectProduct = (e) => {
    const { value } = e.target
    setSelectedProd(value)
    if (value === '') {
      setSelectedVersion('')
    } else {
      getProduct({
        variables: {
          id: value
        }
      })
    }
  }

  const product =
    allProducts &&
    allProducts.projects.nodes.find((item) => item.id === selectedProd)

  const existingVersions = []

  data?.map((item) => existingVersions.push(item?.part?.primaryComponent.id))

  const sbomVersions = []

  const filteredDuplicated = product ? removeDuplicates(product.sboms) : []

  filteredDuplicated &&
    filteredDuplicated.map((project) => {
      if (!existingVersions?.includes(project.primaryComponent.id)) {
        sbomVersions.push({
          label: project.primaryComponent
            ? project.primaryComponent.version
            : `Uploaded ${getFullDateAndTime(project.creationAt)}`,
          value: project.id,
          creationAt: project.creationAt
        })
      }
    })

  const getComponents = () => {
    setActiveSbomTab(2)
    getCompData({
      variables: {
        projectId: prodId,
        sbomId: sbomId,
        first: totalRows,
        field: prodCompState.field,
        direction: prodCompState.direction
      }
    })
  }

  const onFilterSev = async (value) => {
    await getVulnData({
      variables: {
        projectId: prodId,
        sbomId: sbomId,
        severity: value,
        first: totalRows,
        field: prodVulnState.field,
        direction: prodVulnState.direction
      }
    }).then((res) => {
      if (res.data) {
        prodVulnDispatch({ type: 'FILTER_SEVERITY', payload: value })
        setActiveSbomTab(3)
      }
    })
  }

  // COLUMNS
  const columns = [
    {
      id: 'NAME',
      name: 'NAME',
      selector: (row) => {
        const { part } = row
        return (
          <Link
            to={`/vendor/products/${params.name}?id=${part.project.id}&sbom=${part.id}&parts=true`}
          >
            <Text
              color={'blue.500'}
              minWidth='100%'
              fontSize={14}
              onClick={() => {
                localStorage.setItem('activeSbomTab', 0)
                setActiveProdTab(0)
              }}
            >
              {part.project.name}
            </Text>
          </Link>
        )
      },
      wrap: true,
      width: '200px'
    },
    {
      id: 'VERSION',
      name: 'VERSION',
      selector: (row) => {
        const { part } = row
        return (
          <Text fontSize={14}>
            {part.primaryComponent
              ? part.primaryComponent.version
              : `Uploaded at ${getFullDateAndTime(part.creationAt)}`}
          </Text>
        )
      },
      wrap: true
    },
    {
      id: 'SUPPLIER',
      name: 'SUPPLIER',
      selector: (row) => {
        const { part } = row
        return (
          <>
            {part.suppliers.length > 0 &&
              part.suppliers.map((item, index) => (
                <Tag
                  size={'md'}
                  key={index}
                  fontSize={14}
                  variant='subtle'
                  colorScheme='orange'
                >
                  <TagLabel>
                    {item.name}
                    {item.contactEmail && ` - ${item.contactEmail}`}
                  </TagLabel>
                </Tag>
              ))}
          </>
        )
      }
    },
    {
      id: 'COMPONENTS',
      name: 'COMPONENTS',
      selector: (row) => {
        const { part } = row
        return (
          <Tag
            size='md'
            variant='subtle'
            width={16}
            colorScheme={'blue'}
            onClick={getComponents}
            cursor={'pointer'}
          >
            <TagLabel mx={'auto'}>{part.stats.compCount}</TagLabel>
          </Tag>
        )
      },
      width: '150px'
    },
    {
      id: 'LICENSES',
      name: 'LICENSES',
      selector: (row) => {
        const { part } = row
        return (
          <Tag size='md' variant='subtle' width={16} colorScheme={'blue'}>
            <TagLabel mx={'auto'}> {part.stats.compLicenseCount}</TagLabel>
          </Tag>
        )
      },
      width: '150px'
    },
    {
      id: 'VULNERABILITIES',
      name: 'VULNERABILITIES',
      selector: (row) => {
        const { part } = row
        // const link = `/vendor/products/${params.name}?id=${part.project.id}&sbom=${part.id}&parts=true`
        return (
          <Stack fontWeight={'medium'} direction={'row'}>
            <VulnBadge
              color='red'
              label='Critical'
              onClick={() => onFilterSev(['critical'])}
            >
              {part.stats.vulnStats.critical
                ? part.stats.vulnStats.critical
                : 0}
            </VulnBadge>
            <VulnBadge
              color='orange'
              label='High'
              onClick={() => onFilterSev(['high'])}
            >
              {part.stats.vulnStats.high ? part.stats.vulnStats.high : 0}
            </VulnBadge>
            <VulnBadge
              color='yellow'
              label='Medium'
              onClick={() => onFilterSev(['medium'])}
            >
              {part.stats.vulnStats.medium ? part.stats.vulnStats.medium : 0}
            </VulnBadge>
            <VulnBadge
              color='green'
              label='Low'
              onClick={() => onFilterSev(['low'])}
            >
              {part.stats.vulnStats.low ? part.stats.vulnStats.low : 0}
            </VulnBadge>
          </Stack>
        )
      },
      width: '250px'
    },
    {
      id: 'STATUS',
      name: 'STATUS',
      selector: (row) => {
        const { part } = row
        return (
          <Tag width={24} colorScheme='cyan' textTransform={'capitalize'}>
            <TagLabel mx={'auto'}>{part.lifecycle}</TagLabel>
          </Tag>
        )
      }
    },
    {
      id: 'ACTION',
      name: 'ACTION',
      selector: (row) => {
        return (
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FaEllipsisV />}
              variant='none'
              color='gray.400'
            />
            <Portal>
              <MenuList size='sm'>
                <MenuItem
                  onClick={() => {
                    setActiveRow(row)
                    onDeleteOpen()
                  }}
                >
                  Remove
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        )
      },
      right: 'true'
    }
  ]

  // SEARCH COMPONENT
  const handleSearch = () => console.log('hello')

  // CLEAR SERACH
  const handleClear = () => setSearchInput('')

  // SUB HEADER
  const subHeaderComponent = useMemo(() => {
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
          justifyContent={'flex-end'}
        >
          <HStack spacing={4} display={'none'}>
            {/* SEARCH COMPONENTS */}
            <SearchFilter
              id='team'
              filterText={searchInput}
              setFilterText={setSearchInput}
              onFilter={handleSearch}
              onClear={handleClear}
            />
            {/* FILTER */}
            <Menu closeOnSelect={true}>
              <MenuButton
                as={Button}
                colorScheme='blue'
                fontWeight='normal'
                fontSize={'sm'}
                leftIcon={<FaFilter size={14} />}
              >
                Supplier
              </MenuButton>
              <MenuList>
                <MenuOptionGroup type='checkbox'>
                  {['Interlynk', 'Biotronik', 'Oracle'].map((item, index) => (
                    <MenuItemOption key={index} value={item} fontSize={'sm'}>
                      {item}
                    </MenuItemOption>
                  ))}
                </MenuOptionGroup>
              </MenuList>
            </Menu>
          </HStack>

          <Tooltip label='Add Part' placement='top'>
            <IconButton
              ref={addBtn}
              onClick={onOpen}
              icon={<AddIcon />}
              colorScheme='blue'
              variant='solid'
              fontWeight='normal'
              fontSize={'sm'}
            />
          </Tooltip>
        </Stack>
      </Flex>
    )
  }, [searchInput, handleSearch, handleClear])

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={data}
          customStyles={customStyles}
          persistTableHead
          subHeader
          progressPending={data ? false : true}
          subHeaderComponent={subHeaderComponent}
          progressComponent={<CustomLoader />}
          responsive={true}
        />
      </Flex>

      {isOpen && (
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add Parts</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {productList ? (
                <Stack spacing={4} direction={'column'} gap={2}>
                  {/* Project */}
                  <FormControl fontSize={'sm'}>
                    <FormLabel htmlFor='product' fontSize='md' color='gray.600'>
                      Project
                    </FormLabel>
                    <Select
                      fontSize={'sm'}
                      name='product'
                      id='product'
                      value={selectedProd}
                      onChange={handleSelectProduct}
                    >
                      <option value={''}>-- Select --</option>
                      {productList &&
                        [...productList]
                          .filter((item) => item.value !== prodId)
                          .map((item, index) => (
                            <option key={index} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                    </Select>
                  </FormControl>
                  {/* Version */}
                  <FormControl fontSize={'sm'}>
                    <FormLabel
                      htmlFor='versions'
                      fontSize='md'
                      color='gray.600'
                    >
                      Version
                    </FormLabel>
                    {sbomVersions?.length === 0 ? (
                      <Alert borderRadius={'md'} py={'8px'} status='info'>
                        <AlertIcon />
                        No version available
                      </Alert>
                    ) : (
                      <Select
                        fontSize={'sm'}
                        name='versions'
                        id='versions'
                        value={selectedVersion}
                        onChange={(e) => setSelectedVersion(e.target.value)}
                      >
                        <option value={''}>-- Select --</option>
                        {sbomVersions.map((item, index) => (
                          <option key={index} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </Select>
                    )}
                  </FormControl>
                </Stack>
              ) : (
                <Alert
                  status='info'
                  variant='subtle'
                  flexDirection='column'
                  alignItems='center'
                  justifyContent='center'
                  textAlign='center'
                  height='150px'
                  borderRadius={5}
                >
                  <AlertIcon boxSize='30px' mr={0} />
                  <AlertTitle
                    mt={4}
                    mb={1}
                    fontSize='lg'
                    fontWeight={'semibold'}
                  >
                    There is no SBOM in this project
                  </AlertTitle>
                  <AlertDescription maxWidth='sm'>
                    Please upload and try again
                  </AlertDescription>
                </Alert>
              )}
            </ModalBody>

            <ModalFooter>
              <Button mr={3} fontSize={'sm'} onClick={onClose}>
                Close
              </Button>
              <Button
                fontSize={'sm'}
                variant='solid'
                colorScheme='blue'
                onClick={handleCreatePart}
                disabled={selectedVersion === ''}
              >
                Add
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* DISABLED */}
      {isDeleteOpen && (
        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Delete Part</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>Deleting this version will: </Text>
              <UnorderedList>
                <Flex flexDir={'column'} gap={1} mt={4}>
                  {[
                    'remove this versions and its SBOM',
                    'remove access to this version for all users'
                  ].map((item, index) => (
                    <ListItem key={index}>{item}</ListItem>
                  ))}
                </Flex>
              </UnorderedList>

              <Text mt={6}>Are you sure you wish to continue ?</Text>
            </ModalBody>
            <ModalFooter>
              <Button mr={3} onClick={onDeleteClose}>
                No
              </Button>
              <Button onClick={handleRemove} colorScheme='red'>
                Yes
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  )
}

export default PartsTable
