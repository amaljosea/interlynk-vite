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
  TagLabel
} from '@chakra-ui/react'
import CustomLoader from 'components/CustomLoader'
import GlobalContext from 'context/GlobalContext'
import { SbomPartDelete } from 'graphQL/Mutation'
import { SbomPartCreate } from 'graphQL/Mutation'
import { GetProject } from 'graphQL/Queries'
import { GetProjectData } from 'graphQL/Queries'
import { useContext, useMemo, useRef, useState } from 'react'
import DataTable from 'react-data-table-component'
import { FaEllipsisV, FaFilter } from 'react-icons/fa'
import { useLocation, Link } from 'react-router-dom'
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

const PartsTable = ({ data, refetch }) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const sbomId = queryParams.get('sbom')
  const prodId = queryParams.get('p')

  const { isOpen, onOpen, onClose } = useDisclosure()
  const addBtn = useRef()

  const { totalProducts, setActiveProdTab, prodField, prodDirection } =
    useContext(GlobalContext)

  const [selectedProd, setSelectedProd] = useState('')
  const [selectedVersion, setSelectedVersion] = useState('')
  const [uniqVersions, setUniqVersions] = useState([])
  const [searchInput, setSearchInput] = useState('')

  const { data: allProducts } = useQuery(GetProjectData, {
    variables: {
      first: totalProducts,
      field: prodField,
      direction: prodDirection
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
          setSelectedProd('')
          setSelectedVersion('')
        }
      })
      .finally(() => onClose())
  }

  const handleRemove = async (id) => {
    await deleteSbomPart({
      variables: {
        id: id
      }
    }).then((res) => {
      if (res.data) {
        refetch({
          variables: {
            projectId: prodId,
            sbomId: sbomId
          }
        })
      }
    })
  }

  const productList =
    allProducts &&
    allProducts.projects.nodes.map((option) => ({
      value: option.id,
      label: option.name
    }))

  const [getProduct] = useLazyQuery(GetProject)

  const handleSelectProduct = (e) => {
    setSelectedProd(e.target.value)
    getProduct({
      variables: {
        id: e.target.value
      }
    }).then((res) => {
      if (res.data) {
        let versions = []
        res.data.project.sboms.map((project) => {
          if (project.primaryComponent) {
            versions.push({
              version: project.primaryComponent.version,
              id: project.id,
              updatedAt: project.updatedAt
            })
          }
        })
        setUniqVersions(versions)
      }
    })
  }

  const filterVersions =
    uniqVersions.length > 0 &&
    uniqVersions.filter((version) => version.id !== sbomId)

  // remove duplicates
  const removeDuplicatesAndLatest = (arr) => {
    const uniqueVersions = {}

    for (const item of arr) {
      if (
        !uniqueVersions[item.version] ||
        item.updatedAt > uniqueVersions[item.version].updatedAt
      ) {
        uniqueVersions[item.version] = item
      }
    }

    return Object.values(uniqueVersions)
  }

  const filteredData = filterVersions
    ? removeDuplicatesAndLatest(filterVersions)
    : []

  const searchParams = new URLSearchParams(location.search)
  const product_id = searchParams.get('p')

  // COLUMNS
  const columns = [
    {
      id: 'NAME',
      name: 'NAME',
      selector: (row) => {
        const { part } = row
        return (
          <Link
            to={`/vendor/products?&p=${part.project.id}&sbom=${part.id}&parts=true`}
          >
            <Text
              color={'blue.500'}
              minWidth='100%'
              onClick={() => {
                window.localStorage.setItem('subProduct', part.project.name)
                window.localStorage.setItem(
                  'subProductVersion',
                  part.project.name
                )
                setActiveProdTab(0)
              }}
            >
              {part.project.name}
            </Text>
          </Link>
        )
      }
    },
    {
      id: 'VERSION',
      name: 'VERSION',
      selector: (row) => {
        const { part } = row
        return <Text>{part.primaryComponent.version}</Text>
      }
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
      id: 'STATUS',
      name: 'STATUS',
      selector: (row) => {
        const { part } = row

        return (
          <Tag size='sm' colorScheme='blue'>
            {part.lifecycle}
          </Tag>
        )
      }
    },
    {
      id: 'ACTION',
      name: 'ACTION',
      selector: (row) => {
        const { partId } = row
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
                <MenuItem onClick={() => handleRemove(partId)}>
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
              {productList && (
                <Stack spacing={4} direction={'column'} gap={2}>
                  {/* Project */}
                  <FormControl fontSize={'sm'}>
                    <FormLabel htmlFor='product' fontSize='md' color='gray.600'>
                      Project
                    </FormLabel>
                    <Select
                      name='product'
                      id='product'
                      value={selectedProd}
                      onChange={handleSelectProduct}
                    >
                      <option value={''}>-- Select --</option>
                      {[...productList]
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
                    <Select
                      name='versions'
                      id='versions'
                      value={selectedVersion}
                      onChange={(e) => setSelectedVersion(e.target.value)}
                    >
                      <option value={''}>-- Select --</option>
                      {filteredData.length > 0 &&
                        filteredData.map((item, index) => (
                          <option key={index} value={item.id}>
                            {item.version}
                          </option>
                        ))}
                    </Select>
                  </FormControl>
                </Stack>
              )}
            </ModalBody>

            <ModalFooter>
              <Button mr={3} onClick={onClose}>
                Close
              </Button>
              <Button
                variant='solid'
                colorScheme='blue'
                onClick={handleCreatePart}
                disabled={selectedVersion === ''}
              >
                Submit
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  )
}

export default PartsTable
