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

import grype from 'assets/img/grype.png'
import trivy from 'assets/img/trivy.png'
import scout from 'assets/img/scout.png'
import snyk from 'assets/img/snyk.png'
import custom from 'assets/img/custom.png'
import { GetAllOrgConnectors } from 'graphQL/Queries'

import { getConImg } from 'utils'
import { AddScannerImage } from 'graphQL/Mutation'
import { RemoveScannerImage } from 'graphQL/Mutation'
import { Link, useLocation } from 'react-router-dom'
import { useContext } from 'react'
import GlobalContext from 'context/GlobalContext'

const Index = () => {
  const toast = useToast()

  const { setImageDetails, setVulnerabilitiesData } = useContext(GlobalContext)

  const location = useLocation()
  const path = location.pathname

  useEffect(() => {
    if (path === '/admin/images') {
      setImageDetails(null)
      setVulnerabilitiesData([])
    }
  }, [path])

  const { data: orgConnectors } = useQuery(GetAllOrgConnectors, {
    variables: {}
  })

  const { data: allScanners } = useQuery(getAllScanners, {
    variables: {}
  })

  const { data: allImages, refetch } = useQuery(GetAllImages, {
    variables: {}
  })

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

  const scanImage = (name) => {
    switch (name) {
      case 'Grype':
        return grype
        break
      case 'Trivy':
        return trivy
        break
      case 'Scout':
        return scout
        break
      case 'Snyk':
        return snyk
        break
      case 'Custom':
        return custom
        break
    }
  }

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
                  {allImages &&
                    allImages.images.length > 0 &&
                    allImages.images.map((item) => (
                      <Tr key={item.id}>
                        <Td fontSize={'sm'} pl={1}>
                          {isLoading ? (
                            <Skeleton height='20px' />
                          ) : (
                            <Link
                              to={`/admin/sboms?v=${
                                item.imageVersions[
                                  item.imageVersions.length - 1
                                ].id
                              }&id=${item.id}`}
                              style={{
                                color: '#3182CE',
                                textDecoration: 'underline'
                              }}
                            >
                              {item.name}
                            </Link>
                          )}
                        </Td>
                        <Td fontSize={'sm'} pl={1}>
                          {isLoading ? (
                            <Skeleton height='20px' />
                          ) : (
                            <Flex
                              direction={'row'}
                              alignItems={'center'}
                              justifyContent={'start'}
                              gap={2}
                            >
                              <Image
                                width='6'
                                height='6'
                                src={getConImg(
                                  item.organizationConnector.connector.name
                                )}
                                alt={`${item.organizationConnector.connector.name}`}
                              />
                              <Text size='sm'>
                                {item.organizationConnector.name}
                              </Text>
                            </Flex>
                          )}
                        </Td>
                        <Td fontSize={'sm'} pl={1}>
                          {isLoading ? (
                            <Skeleton height='20px' />
                          ) : (
                            <Text>{item.imageVersions.length}</Text>
                          )}
                        </Td>
                        <Td fontSize={'sm'} pl={1}>
                          {isLoading ? (
                            <Skeleton height='20px' />
                          ) : (
                            <Text>
                              {new Date(item.updatedAt)
                                .toISOString()
                                .slice(0, 10)}
                            </Text>
                          )}
                        </Td>
                        <Td pl={1}>
                          {isLoading ? (
                            <Skeleton height='20px' />
                          ) : (
                            <Flex
                              direction={'row'}
                              gap={3}
                              alignItems={'center'}
                            >
                              {item.imageScanners.map((result, index) => (
                                <Tooltip
                                  key={index}
                                  label={`${result.name}`}
                                  placement='top'
                                >
                                  <Image
                                    width={6}
                                    objectFit={'contain'}
                                    src={`${scanImage(result.name)}`}
                                    alt={result}
                                  />
                                </Tooltip>
                              ))}
                            </Flex>
                          )}
                        </Td>
                        <Td pl={1}>
                          {isLoading ? (
                            <Skeleton height='20px' />
                          ) : (
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                aria-label='Options'
                                icon={<FaEllipsisV />}
                                variant='none'
                                color='gray.400'
                              />
                              <Portal>
                                <MenuList style={{ width: '100px' }}>
                                  <MenuItem
                                    icon={<AddIcon />}
                                    onClick={() => {
                                      setSelectedImage(item.id)
                                      setActiveScanners(item.imageScanners)
                                      onScanOpen()
                                    }}
                                  >
                                    <Text fontSize={'sm'}>Add Scanner</Text>
                                  </MenuItem>
                                  <MenuItem
                                    icon={<DeleteIcon />}
                                    onClick={() => {
                                      setSelectedImage(item.id)
                                      setActiveScanners(item.imageScanners)
                                      onDeleteOpen()
                                    }}
                                  >
                                    <Text fontSize={'sm'}>Delete Scanner</Text>
                                  </MenuItem>
                                </MenuList>
                              </Portal>
                            </Menu>
                          )}
                        </Td>
                      </Tr>
                    ))}
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
