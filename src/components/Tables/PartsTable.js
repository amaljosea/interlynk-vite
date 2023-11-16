import { useLazyQuery, useQuery } from '@apollo/client'
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
  Tag
} from '@chakra-ui/react'
import GlobalContext from 'context/GlobalContext'
import { GetProject } from 'graphQL/Queries'
import { GetProjectData } from 'graphQL/Queries'
import { useContext, useMemo, useRef, useState } from 'react'
import DataTable from 'react-data-table-component'
import { FaEllipsisV, FaFilter } from 'react-icons/fa'
import { useLocation, Link } from 'react-router-dom'
import { useParams } from 'react-router-dom';

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

const PartsTable = () => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const sbomId = queryParams.get('sbom')

  const { isOpen, onOpen, onClose } = useDisclosure()
  const addBtn = useRef()

  const { totalProducts, setActiveProdTab } = useContext(GlobalContext)

  const [selectedProd, setSelectedProd] = useState('')
  const [selectedVersion, setSelectedVersion] = useState('')
  const [uniqVersions, setUniqVersions] = useState([])

  const { data: allProducts } = useQuery(GetProjectData, {
    variables: {
      first: totalProducts
    }
  })

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

    const searchParams = new URLSearchParams(location.search);
    const product_id = searchParams.get('p');
    console.log('product:', product_id)

  // COLUMNS
  const columns = [
    {
      id: 'NAME',
      name: 'NAME',
      selector: (row) => {
        const { sboms, name, id } = row
        return (
          <>
            {sboms.length > 0 ? (
              <Link
                to={`/vendor/products?&p=${id}&sbom=${sboms[0].id}&parts=true`}
              >
                <Text
                  color={'blue.500'}
                  minWidth='100%'
                  onClick={() => {
                    window.localStorage.setItem('subProduct', name)
                    setActiveProdTab(0)
                  }}
                >
                  {name}
                </Text>
              </Link>
            ) : (
              <Text>{name}</Text>
            )}
          </>
        )
      }
    },
    {
      id: 'VERSION',
      name: 'VERSION',
      selector: (row) => {
        const { sboms } = row
        return (
          <Text>{sboms?.length > 0 && sboms[0]?.primaryComponent?.version}</Text>
        )
      }
    },
    {
      id: 'SUPPLIER',
      name: 'SUPPLIER',
      selector: (row) => {
        const suppliers = ['Interlynk', 'Biotronik', 'Oracle']
        const getRandomSupplier = () => {
          const randomIndex = Math.floor(Math.random() * suppliers.length)
          return suppliers[Math.ceil(randomIndex)]
        }

        return <Text>{getRandomSupplier()}</Text>
      }
    },
    {
      id: 'STATUS',
      name: 'STATUS',
      selector: (row) => {
        const statuses = ['Draft', 'Released', 'Pending']
        const getRandomStatus = () => {
          const randomIndex = Math.floor(Math.random() * statuses.length)
          return statuses[Math.ceil(randomIndex)]
        }

        return (
          <Tag size='sm' colorScheme='blue'>
            {getRandomStatus()}
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
                <MenuItem>Remove</MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        )
      },
      right: 'true'
    }
  ]

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
          justifyContent={'space-between'}
        >
          <HStack spacing={4}>
            <Input
              width={'300px'}
              name='parts'
              id='parts'
              placeholder='Search'
            />
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
  }, [])

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={allProducts && allProducts.projects.nodes.filter(product => product.id !== product_id).slice(0, 3)}
          customStyles={customStyles}
          persistTableHead
          subHeader
          subHeaderComponent={subHeaderComponent}
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
                      {productList.map((item, index) => (
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
              <Button variant='solid' colorScheme='blue'>
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
