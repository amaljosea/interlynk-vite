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
  Image,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  IconButton,
  Menu,
  Portal,
  MenuList,
  MenuItem,
  MenuButton,
  Skeleton,
  useToast
} from '@chakra-ui/react'
import React from 'react'
import { useState } from 'react'
import { FaEllipsisV } from 'react-icons/fa'
import { useEffect } from 'react'
import ImagesDrawer from 'components/Drawer/ImagesDrawer'
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import { AddIcon, DeleteIcon } from '@chakra-ui/icons'
import { getAllScanners } from 'graphQL/Queries'
import { useMutation, useQuery } from '@apollo/client'
import { GetAllImages } from 'graphQL/Queries'
import SBOM from 'views/Dashboard/SBOMs'
import grype from 'assets/img/grype.png'
import trivy from 'assets/img/trivy.png'
import scout from 'assets/img/scout.png'
import snyk from 'assets/img/snyk.png'
import custom from 'assets/img/custom.png'
import { GetAllOrgConnectors } from 'graphQL/Queries'

import { getConImg, scanImage } from 'utils'
import { AddScannerImage } from 'graphQL/Mutation'
import { RemoveScannerImage } from 'graphQL/Mutation'
import { Link, useLocation } from 'react-router-dom'
import { useContext } from 'react'
import GlobalContext from 'context/GlobalContext'
import ImageRow from 'components/Tables/ImageRow'

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
    if (path === '/admin/images') {
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
    }, 10000)
  }, [isLoading])

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
            {/* <Stack>
              <Skeleton height='20px' />
              <Skeleton height='20px' />
            </Stack> */}
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
                <Button
                  fontSize={'sm'}
                  fontWeight={'normal'}
                  colorScheme='blue'
                  onClick={() => setIsLoading(true)}
                >
                  Refresh
                </Button>
              </Flex>
            </CardHeader>
            <CardBody mt={2}>
              <Table variant='simple'>
                <Thead>
                  <Tr>
                    <Th pl={1}>Image</Th>
                    <Th pl={1}>Connection</Th>
                    <Th pl={1}>Tags</Th>
                    <Th pl={1}>Last Pushed</Th>
                    <Th pl={1}>Scanners</Th>
                    <Th pl={1}>Actions</Th>
                  </Tr>
                </Thead>

                <Tbody>
                  {filteredImages ? (
                    filteredImages.map((item, index) => (
                      <ImageRow
                        key={index}
                        item={item}
                        isLoading={isLoading}
                        setSelectedImage={setSelectedImage}
                        setActiveScanners={setActiveScanners}
                        onScanOpen={onScanOpen}
                        onDeleteOpen={onDeleteOpen}
                        filteredScanners={filteredScanners}
                      />
                    ))
                  ) : allImages ? (
                    allImages.images.length > 0 &&
                    allImages.images.map((item, index) => (
                      <ImageRow
                        key={index}
                        item={item}
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
                  href='/#/admin/connections'
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
