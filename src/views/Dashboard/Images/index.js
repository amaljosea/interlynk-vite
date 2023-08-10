import {
  Flex,
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
  useToast
} from '@chakra-ui/react'
import React, { useState, useEffect, useContext } from 'react'
import ImagesDrawer from 'components/Drawer/ImagesDrawer'
import Card from 'components/Card/Card'
import CardHeader from 'components/Card/CardHeader'
import { useMutation, useQuery } from '@apollo/client'
import SBOM from 'views/Dashboard/SBOMs'
import {
  GetAllOrgConnectors,
  ImagePagination,
  getAllScanners
} from 'graphQL/Queries'
import {
  AddScannerImage,
  RemoveScannerImage,
  OrgConnectorRefresh
} from 'graphQL/Mutation'
import { Link, useLocation } from 'react-router-dom'
import GlobalContext from 'context/GlobalContext'
import ImageTable from './ImageTable'

const Index = () => {
  const toast = useToast()

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const versionId = queryParams.get('v')
  const imageId = queryParams.get('id')

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

  const { data: allImages, refetch } = useQuery(ImagePagination, {
    variables: { first: 10 }
  })

  const handlePreviousPage = () => {
    refetch({
      first: undefined,
      last: 10,
      before: allImages.images.pageInfo.startCursor,
      after: ''
    })
  }

  const handleNextPage = () => {
    refetch({
      first: 10,
      last: undefined,
      after: allImages.images.pageInfo.endCursor,
      before: ''
    })
  }

  // useEffect(() => {
  //   if (allImages) {
  //     console.log(`all Images`, allImages)
  //   }
  // }, [allImages])

  // const filteredImages =
  //   allImages &&
  //   allImages.images.filter((item) =>
  //     item.name.toLowerCase().includes(searchInput.toLowerCase())
  //   )

  const [imageScannerAdd] = useMutation(AddScannerImage, {
    onCompleted: refetch
  })
  const [imageScannerRemove] = useMutation(RemoveScannerImage, {
    onCompleted: refetch
  })

  const [organizationConnectorRefresh] = useMutation(OrgConnectorRefresh, {
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
          imageID: selectedImage,
          scannerID: selectedScanner
        }
      }).then(() => {
        refetch({ first: 10 })
        onScanClose()
      })
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
      }).then(() => {
        refetch({ first: 10 })
        onDeleteClose()
      })
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

  const onImageRefresh = async () => {
    try {
      setIsLoading(true)
      await organizationConnectorRefresh().then(() => {
        setTimeout(() => {
          setIsLoading(false)
        }, 2000)
      })
    } catch (error) {
      if (error.networkError && error.networkError.statusCode === 500) {
        // Handle the specific error
        alert('Something went wrong')
      } else {
        // Handle other errors
        alert(error.message)
      }
    }
  }

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
      localStorage.setItem('sortField', field)
      localStorage.setItem('sortOrder', 'asc')
    }
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
                justifyContent={'flex-end'}
              >
                <Input
                  placeholder='Search'
                  maxW='300px'
                  mb={4}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  fontSize={'sm'}
                  display={'none'}
                />
                <Button colorScheme='blue' onClick={onImageRefresh}>
                  Refresh
                </Button>
              </Flex>
            </CardHeader>

            <ImageTable
              refetch={refetch}
              imageList={allImages}
              isLoading={isLoading}
              onScanOpen={onScanOpen}
              onDeleteOpen={onDeleteOpen}
              setSelectedImage={setSelectedImage}
              setActiveScanners={setActiveScanners}
              handleNextPage={handleNextPage}
              handlePreviousPage={handlePreviousPage}
            />
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
            allImages.images.nodes.length === 0 && (
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
