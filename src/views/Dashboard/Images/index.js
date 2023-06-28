import {
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Select,
  Button,
  Text,
  Image,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Spinner,
  Link,
  Input,
  Spacer
} from '@chakra-ui/react'
import GlobalContext from 'context/GlobalContext'
import React, { useContext } from 'react'
import { useState } from 'react'
import { FaGithub, FaSprayCan } from 'react-icons/fa'
import { useToast } from '@chakra-ui/react'
import { useEffect } from 'react'
import ImagesDrawer from 'components/Drawer/ImagesDrawer'
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import { AddIcon } from '@chakra-ui/icons'
import { getAllScanners } from 'graphQL/Queries'
import { useMutation, useQuery } from '@apollo/client'
import { GetAllImages } from 'graphQL/Queries'

import grype from 'assets/img/grype.png'
import trivy from 'assets/img/trivy.png'
import scout from 'assets/img/scout.png'
import snyk from 'assets/img/snyk.png'
import custom from 'assets/img/custom.png'
import { imgScannerCreate } from 'graphQL/Mutation'

const Index = () => {
  const toast = useToast()
  const { setProductVersionExploded, images, setImages } = useContext(
    GlobalContext
  )

  const [imageScannerCreate, { data: scanResult }] = useMutation(
    imgScannerCreate
  )

  const {
    isOpen: isScanOpen,
    onOpen: onScanOpen,
    onClose: onScanClose
  } = useDisclosure()

  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = React.useRef()

  const [selectedImage, setSelectedImage] = useState('')
  const [selectedScanner, setSelectedScanner] = useState('')
  const [selectedVersion, setSelectedVersion] = useState('')
  const [hasAnalyzed, setHasAnalyzed] = useState(false)
  const [isActive, setIsActive] = useState(false)

  const [activeImageId, setActiveImageId] = useState(null)
  const [activeScannerId, setActiveScannerId] = useState(null)
  const [selectedImgVersions, setSelectedImgVersions] = useState([])

  const [isLoading, setIsLoading] = useState(false)

  const handleAnalyze = () => {
    if (selectedImage !== '' && selectedScanner !== '') {
      setHasAnalyzed(true)
      setTimeout(() => {
        setHasAnalyzed(false)
        setIsActive(true)
      }, 4000)
    } else {
      toast({
        title: `Input fields required`,
        status: 'error',
        position: 'top-right',
        isClosable: true
      })
    }
  }

  const handleAddProduct = () => {
    setProductVersionExploded((prev) => [
      {
        logo: FaGithub,
        name: selectedImage.split(':')[0],
        description: 'A tool to compose your various sboms into a single sbom',
        version: selectedImage.split(':')[1],
        vendor: 'Interlynk',
        quality_score: 0,
        sbom_links: 0,
        risk_score: 'Not Defined',
        updated_at: new Date().toISOString(),
        active: true,
        source: 'Assembled'
      },
      ...prev
    ])

    toast({
      title: `Product added successfully`,
      status: 'success',
      position: 'top-right',
      isClosable: true
    })

    setSelectedImage('')
    setSelectedScanner('')
  }

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

  const handleScanAdd = (e) => {
    e.preventDefault()
    if (selectedImgVersions.length > 0) {
      try {
        selectedImgVersions.map((version) => {
          imageScannerCreate({
            variables: {
              imgVersionId: `${version.id}`,
              scannerId: `${selectedVersion}`
            }
          })
        })
        window.location.reload()
      } catch (error) {
        if (error.networkError && error.networkError.statusCode === 500) {
          // Handle the specific error
          alert('Invalid entry')
          window.location.reload()
        } else {
          // Handle other errors
          console.error(error.message)
        }
      }
    }
  }

  const handleOpen = (item) => {
    onOpen()
  }

  const orgID = process.env.REACT_APP_ORGID

  const { data: allScanners } = useQuery(getAllScanners, {
    variables: {}
  })

  const { data: allImages } = useQuery(GetAllImages, {
    variables: { id: orgID }
  })

  useEffect(() => {
    if (allImages) {
      console.log('allImages', allImages)
    }
  }, [allImages])

  // useEffect(() => {
  //   setTimeout(() => {
  //     setIsLoading(false)
  //   }, 10000)
  // }, [isLoading])

  return (
    <>
      <Flex width={'100%'} direction='column' mt={{ base: '120px', md: '0px' }}>
        <Flex
          dir='row'
          width={'100%'}
          alignItems={'center'}
          px={2}
          justifyContent={'space-between'}
          mt={{ base: '200px', md: '75px' }}
        >
          <Card my='22px' overflowX={{ sm: 'scroll', xl: 'hidden' }}>
            {/* <CardHeader>
              <Input placeholder='Search' maxW='300px' mb={4} />
            </CardHeader> */}
            <CardBody>
              <Table variant='simple'>
                <Thead>
                  <Tr>
                    <Th>Images</Th>
                    <Th>Connection</Th>
                    <Th>Scan Result</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {allImages &&
                    allImages.images.map((item) => (
                      <Tr key={item.id}>
                        <Td>
                          <Link
                            href={`#/admin/sboms?p=${item.name}&v=${item.imageVersions[0].name}`}
                            style={{
                              color: '#3182CE',
                              textDecoration: 'underline'
                            }}
                          >
                            {item.name}
                          </Link>
                        </Td>
                        <Td>{item.organizationConnector.name}</Td>
                        <Td>
                          <Flex direction={'row'} gap={2} alignItems={'center'}>
                            {isLoading && activeImageId === item.id ? (
                              <Spinner mx={2} />
                            ) : (
                              item.imageScanners.map((result) => (
                                <Image
                                  width={8}
                                  objectFit={'contain'}
                                  key={result}
                                  src={`${scanImage(result.name)}`}
                                  alt={result}
                                />
                              ))
                            )}
                          </Flex>
                        </Td>
                        <Td>
                          <Flex direction={'row'} alignItems={'center'} gap={4}>
                            <Button
                              colorScheme='blue'
                              leftIcon={<AddIcon />}
                              variant='outline'
                              size='sm'
                              fontWeight={400}
                              onClick={() => {
                                setSelectedImgVersions(item.imageVersions)
                                onScanOpen()
                              }}
                            >
                              Scanner
                            </Button>

                            <Button
                              colorScheme='blue'
                              size='sm'
                              leftIcon={<AddIcon />}
                              fontWeight={400}
                              ref={btnRef}
                              onClick={onOpen}
                            >
                              SBOM Link
                            </Button>
                          </Flex>
                        </Td>
                      </Tr>
                    ))}
                </Tbody>
              </Table>
            </CardBody>
          </Card>
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
                onChange={(e) => setSelectedScanner(e.target.value)}
              >
                {allScanners &&
                  allScanners.scanners.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.company} - {item.name}
                    </option>
                  ))}
              </Select>
              <Select
                id='version'
                placeholder='Select a version'
                isRequired
                value={selectedVersion}
                onChange={(e) => setSelectedVersion(e.target.value)}
                mt={4}
              >
                {allScanners && selectedScanner !== ''
                  ? allScanners.scanners
                      .filter(
                        (scanner) => selectedScanner === `${scanner.name}`
                      )
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.version}
                        </option>
                      ))
                  : allScanners &&
                    allScanners.scanners.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.version}
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
              <Button type='submit' colorScheme='blue'>
                Add
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
