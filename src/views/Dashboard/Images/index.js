import {
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Button,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  Skeleton,
  useToast,
  Box
} from '@chakra-ui/react'
import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react'
import ImagesDrawer from 'components/Drawer/ImagesDrawer'
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import { getAllScanners } from 'graphQL/Queries'
import { useMutation, useQuery } from '@apollo/client'
import { GetAllImages } from 'graphQL/Queries'
import SBOM from 'views/Dashboard/SBOMs'
import { GetAllOrgConnectors } from 'graphQL/Queries'
import { AddScannerImage } from 'graphQL/Mutation'
import { RemoveScannerImage } from 'graphQL/Mutation'
import { Link, useLocation } from 'react-router-dom'
import { useContext } from 'react'
import GlobalContext from 'context/GlobalContext'
import ImageRow from 'components/Tables/ImageRow'
import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons'

const Index = () => {
  const toast = useToast()

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const versionId = queryParams.get('v')
  const imageId = queryParams.get('id')

  // console.log('versionId', versionId)

  const { setVulnerabilitiesData, setScannerItems } = useContext(GlobalContext)

  const [searchInput, setSearchInput] = useState('')

  const path = location.pathname

  useEffect(() => {
    if (path === '/vendor/images') {
      setVulnerabilitiesData([])
    }
  }, [path])

  const { data: orgConnectors } = useQuery(GetAllOrgConnectors, {
    variables: {}
  })

  const { data: allScanners } = useQuery(getAllScanners, {
    variables: {}
  })

  useEffect(() => {
    if (allScanners) {
      window.localStorage.setItem(
        'scanners',
        JSON.stringify(allScanners.scanners)
      )
    }
  }, [allScanners])

  const { data: allImages, refetch } = useQuery(GetAllImages, {
    variables: {}
  })

  // useEffect(() => {
  //   if (allImages) {
  //     console.log(`all Images`, allImages)
  //   }
  // }, [allImages])

  const filteredImages =
    allImages &&
    allImages.images.filter((item) =>
      item.name.toLowerCase().includes(searchInput.toLowerCase())
    )

  const [imageScannerAdd] = useMutation(AddScannerImage, {
    onCompleted: refetch
  })
  const [imageScannerRemove] = useMutation(RemoveScannerImage, {
    onCompleted: refetch
  })

  const { isOpen, onOpen, onClose } = useDisclosure()

  const {
    isOpen: isScanOpen,
    onOpen: onScanOpen,
    onClose: onScanClose
  } = useDisclosure()

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose
  } = useDisclosure()

  const btnRef = React.useRef()

  const [selectedImage, setSelectedImage] = useState('')
  const [selectedScanner, setSelectedScanner] = useState('')
  const [activeImageId, setActiveImageId] = useState(null)

  const [activeScanners, setActiveScanners] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const [sortField, setSortField] = useState('lastPushedAt')
  const [sortOrder, setSortOrder] = useState('asc')
  const [imageData, setImageData] = useState([])

  const handleScanAdd = async (e) => {
    e.preventDefault()
    try {
      await imageScannerAdd({
        variables: {
          imageID: `${selectedImage}`,
          scannerID: `${selectedScanner}`
        }
      })
      onScanClose()
    } catch (error) {
      if (error.networkError && error.networkError.statusCode === 500) {
        // Handle the specific error
        alert('Invalid entry')
        onScanClose()
      } else {
        // Handle other errors
        alert('Invalid entry')
        onScanClose()
      }
    }

    setSelectedScanner('')
  }

  const handleDelete = async (e) => {
    e.preventDefault()
    try {
      await imageScannerRemove({
        variables: {
          imageID: `${selectedImage}`,
          scannerID: `${selectedScanner}`
        }
      })
      onDeleteClose()
    } catch (error) {
      if (error.networkError && error.networkError.statusCode === 500) {
        // Handle the specific error
        alert('Invalid request')
        onDeleteClose()
      } else {
        // Handle other errors
        alert('Invalid request')
        onDeleteClose()
      }
    }

    setSelectedScanner('')
  }

  const existingScanners =
    activeScanners && activeScanners.map((item) => item.id)

  // console.log('existingScanners', existingScanners)

  const filteredScanners =
    allScanners &&
    allScanners.scanners.filter(
      (scanner) => !existingScanners.includes(scanner.id)
    )

  // const filteredScanners =
  //   existingScanners && !existingScanners.includes(selectedScanner)

  // console.log('filteredScanners', filteredScanners)

  const handleScannerChange = (e) => {
    const { value } = e.target
    setSelectedScanner(value)
    if (existingScanners.includes(value)) {
      toast({
        description: 'This scanner is already being used on the image',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top-right'
      })
    }
  }

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false)
    }, 5000)
  }, [isLoading])

  const handleImgSort = (field) => {
    if (field === sortField) {
      const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc'
      setSortOrder(newSortOrder)
      sortImgData(field, newSortOrder)
      localStorage.setItem('sortField', field)
      localStorage.setItem('sortOrder', newSortOrder)
    } else {
      setSortField(field)
      setSortOrder('asc')
      sortImgData(field, 'asc')
    }
  }

  useEffect(() => {
    const field = localStorage.getItem('sortField')
    const order = localStorage.getItem('sortOrder')
    if (field) setSortField(field)
    if (order) setSortOrder(order)
    if (allImages && field && order) {
      const data = allImages && allImages.images
      const sortedData = [...data].sort((a, b) => {
        if (
          field === 'imageVersions' &&
          typeof a[field].length === 'number' &&
          typeof b[field].length === 'number'
        ) {
          return order === 'asc'
            ? a[field].length - b[field].length
            : b[field].length - a[field].length
        } else if (field === 'lastPushedAt') {
          const comparison = a[field].localeCompare(b[field])
          return order === 'asc' ? comparison : -comparison
        } else if (field === 'scanEnabled') {
          const aValue = a[field]
          const bValue = b[field]
          if (order === 'asc') {
            return aValue > bValue ? 1 : -1
          } else {
            return aValue < bValue ? 1 : -1
          }
        } else if (field === 'organizationConnector') {
          const comparison = a[field].name.localeCompare(b[field].name)
          return order === 'asc' ? comparison : -comparison
        } else {
          const comparison = a[field].localeCompare(b[field])
          return order === 'asc' ? comparison : -comparison
        }
      })
      // console.log('sortedData', sortedData)
      setImageData(sortedData)
    }
  }, [allImages])

  const sortImgData = (field, order) => {
    const data = allImages && allImages.images
    const sortedData = [...data].sort((a, b) => {
      if (
        field === 'imageVersions' &&
        typeof a[field].length === 'number' &&
        typeof b[field].length === 'number'
      ) {
        return order === 'asc'
          ? a[field].length - b[field].length
          : b[field].length - a[field].length
      } else if (field === 'lastPushedAt') {
        const comparison = a[field].localeCompare(b[field])
        return order === 'asc' ? comparison : -comparison
      } else if (field === 'scanEnabled') {
        const aValue = a[field]
        const bValue = b[field]
        if (order === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      } else if (field === 'organizationConnector') {
        const comparison = a[field].name.localeCompare(b[field].name)
        return order === 'asc' ? comparison : -comparison
      } else {
        const comparison = a[field].localeCompare(b[field])
        return order === 'asc' ? comparison : -comparison
      }
    })
    // console.log('sortedData', sortedData)
    setImageData(sortedData)
  }

  if (versionId) {
    return <SBOM />
  }

  return (
    <>
      <Flex width={'100%'} direction='column' mt={{ base: '120px', md: '0px' }}>
        <Flex
          flexDirection='column'
          width={'100%'}
          alignItems={'center'}
          px={2}
          justifyContent={'space-between'}
          mt={{ base: '200px', md: '75px' }}
        >
          <Card my='22px' overflowX={{ sm: 'scroll', xl: 'hidden' }}>
            <CardHeader>
              <Flex
                width={'100%'}
                direction={'row'}
                alignItems={'center'}
                justifyContent={'space-between'}
              >
                <Input
                  placeholder='Search'
                  maxW='300px'
                  mb={4}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  fontSize={'sm'}
                />
                <Button colorScheme='blue' onClick={() => setIsLoading(true)}>
                  Refresh
                </Button>
              </Flex>
            </CardHeader>
            <CardBody mt={2}>
              <Table variant='simple'>
                <Thead>
                  <Tr>
                    <Th
                      color={'gray.'}
                      pl={1}
                      position='relative'
                      cursor={'pointer'}
                      onClick={() => handleImgSort('scanEnabled')}
                    >
                      <Flex direction={'row'} alignItems={'center'} gap={2}>
                        <Box>Scan</Box>
                        <Box>
                          {sortField === 'scanEnabled' &&
                            (sortOrder === 'asc' ? (
                              <TriangleUpIcon />
                            ) : (
                              <TriangleDownIcon />
                            ))}
                        </Box>
                      </Flex>
                    </Th>
                    <Th
                      color={'gray.'}
                      pl={1}
                      position='relative'
                      onClick={() => handleImgSort('name')}
                      cursor={'pointer'}
                    >
                      <Flex direction={'row'} alignItems={'center'} gap={2}>
                        <Box>Image</Box>
                        <Box>
                          {sortField === 'name' &&
                            (sortOrder === 'asc' ? (
                              <TriangleUpIcon />
                            ) : (
                              <TriangleDownIcon />
                            ))}
                        </Box>
                      </Flex>
                    </Th>
                    <Th
                      color={'gray.'}
                      pl={1}
                      position='relative'
                      onClick={() => handleImgSort('organizationConnector')}
                      cursor={'pointer'}
                    >
                      <Flex direction={'row'} alignItems={'center'} gap={2}>
                        <Box>Connector</Box>
                        <Box>
                          {sortField === 'organizationConnector' &&
                            (sortOrder === 'asc' ? (
                              <TriangleUpIcon />
                            ) : (
                              <TriangleDownIcon />
                            ))}
                        </Box>
                      </Flex>
                    </Th>
                    <Th
                      color={'gray.'}
                      pl={1}
                      position='relative'
                      onClick={() => handleImgSort('imageVersions')}
                      cursor={'pointer'}
                    >
                      <Flex direction={'row'} alignItems={'center'} gap={2}>
                        <Box>Tags</Box>
                        <Box>
                          {sortField === 'imageVersions' &&
                            (sortOrder === 'asc' ? (
                              <TriangleUpIcon />
                            ) : (
                              <TriangleDownIcon />
                            ))}
                        </Box>
                      </Flex>
                    </Th>
                    <Th
                      color={'gray.'}
                      pl={1}
                      position='relative'
                      onClick={() => handleImgSort('lastPushedAt')}
                      cursor={'pointer'}
                    >
                      <Flex direction={'row'} alignItems={'center'} gap={2}>
                        <Box>Last Pushed</Box>
                        <Box>
                          {sortField === 'lastPushedAt' &&
                            (sortOrder === 'asc' ? (
                              <TriangleUpIcon />
                            ) : (
                              <TriangleDownIcon />
                            ))}
                        </Box>
                      </Flex>
                    </Th>
                    <Th color={'gray.'} pl={1} position='relative'>
                      <Box>Scanners</Box>
                    </Th>
                    <Th color={'gray.'} pl={1} position='relative'>
                      <Box>Actions</Box>
                    </Th>
                  </Tr>
                </Thead>

                <Tbody>
                  {searchInput !== '' ? (
                    filteredImages.map((item, index) => (
                      <ImageRow
                        key={index}
                        item={item}
                        refetch={refetch}
                        isLoading={isLoading}
                        setSelectedImage={setSelectedImage}
                        setActiveScanners={setActiveScanners}
                        onScanOpen={onScanOpen}
                        onDeleteOpen={onDeleteOpen}
                        filteredScanners={filteredScanners}
                      />
                    ))
                  ) : imageData.length > 0 ? (
                    imageData.map((item, index) => (
                      <ImageRow
                        key={index}
                        item={item}
                        refetch={refetch}
                        isLoading={isLoading}
                        setSelectedImage={setSelectedImage}
                        setActiveScanners={setActiveScanners}
                        onScanOpen={onScanOpen}
                        onDeleteOpen={onDeleteOpen}
                      />
                    ))
                  ) : allImages ? (
                    allImages.images.length > 0 &&
                    allImages.images.map((item, index) => (
                      <ImageRow
                        key={index}
                        item={item}
                        refetch={refetch}
                        isLoading={isLoading}
                        setSelectedImage={setSelectedImage}
                        setActiveScanners={setActiveScanners}
                        onScanOpen={onScanOpen}
                        onDeleteOpen={onDeleteOpen}
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
          </Card>

          {orgConnectors &&
          orgConnectors.organizationConnectors.length === 0 ? (
            <Flex
              mx={'auto'}
              p={24}
              alignItems={'center'}
              justifyContent={'center'}
            >
              <Text color={'gray.500'}>
                Please connect to a container registry under
                <Link
                  href='/#/vendor/connections'
                  color={'blue.500'}
                  textDecoration={'underline'}
                  _hover={{ textDecoration: 'underline' }}
                  mx={2}
                >
                  Connections
                </Link>
                to see your images
              </Text>
            </Flex>
          ) : (
            allImages &&
            allImages.images.length === 0 && (
              <Flex
                mx={'auto'}
                p={24}
                alignItems={'center'}
                justifyContent={'center'}
              >
                <Text color={'gray.500'}>
                  No image found in connected registries. Refresh or edit
                  connections
                </Text>
              </Flex>
            )
          )}
        </Flex>
      </Flex>

      {/* add scanners */}
      <Modal isOpen={isScanOpen} onClose={onScanClose}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleScanAdd}>
            <ModalHeader>Add Scanner</ModalHeader>
            <ModalCloseButton />
            <ModalBody mb={6}>
              <Select
                id='scanner'
                placeholder='Select a scanner'
                isRequired
                value={selectedScanner}
                onChange={handleScannerChange}
              >
                {filteredScanners &&
                  filteredScanners.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.company} - {item.name}
                    </option>
                  ))}
              </Select>
            </ModalBody>
            <ModalFooter>
              <Button
                colorScheme='blue'
                variant='outline'
                mr={3}
                onClick={() => onScanClose()}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                colorScheme='blue'
                isDisabled={existingScanners.includes(selectedScanner)}
              >
                Add
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* delete scanners */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleDelete}>
            <ModalHeader>Delete Scanner</ModalHeader>
            <ModalCloseButton />
            <ModalBody mb={6}>
              <Select
                id='scanner'
                placeholder='Select a scanner'
                isRequired
                value={selectedScanner}
                onChange={(e) => setSelectedScanner(e.target.value)}
              >
                {activeScanners.length > 0 &&
                  activeScanners.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.company} - {item.name}
                    </option>
                  ))}
              </Select>
              {selectedScanner !== '' && (
                <Text mt={6} fontSize={'sm'} color={'red.500'}>
                  This scan will stop scanning new images and tags with the
                  selected scanner. Are you sure you want to remove it ?
                </Text>
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                colorScheme='blue'
                variant='outline'
                mr={3}
                onClick={() => onDeleteClose()}
                size='md'
              >
                {selectedScanner !== '' ? 'No' : 'Cancel'}
              </Button>
              <Button type='submit' size='md' colorScheme='red'>
                {selectedScanner !== '' ? 'Yes' : 'Delete'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* add sbom link  */}
      <ImagesDrawer
        isOpen={isOpen}
        onClose={onClose}
        btnRef={btnRef}
        activeImageId={activeImageId}
      />
    </>
  )
}

export default Index
