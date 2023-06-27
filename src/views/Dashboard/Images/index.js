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
import { useQuery } from '@apollo/client'
import { GetAllImages } from 'graphQL/Queries'

const Index = () => {
  const toast = useToast()
  const { setProductVersionExploded, images, setImages } = useContext(
    GlobalContext
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
        return 'https://user-images.githubusercontent.com/5199289/136855393-d0a9eef9-ccf1-4e2b-9d7c-7aad16a567e5.png'
        break
      case 'Trivy':
        return 'https://raw.githubusercontent.com/aquasecurity/trivy/main/docs/imgs/logo.png'
        break
      case 'Scout':
        return 'https://www.docker.com/wp-content/uploads/2023/02/analyze-vulnerabilities_icon.png'
        break
      case 'Snyk':
        return 'https://w7.pngwing.com/pngs/314/10/png-transparent-snyk-full-logo-tech-companies-thumbnail.png'
        break
      case 'Custom':
        return 'https://seeklogo.com/images/A/azure-container-apps-logo-2CCDCF7E10-seeklogo.com.png'
        break
    }
  }

  const handleScanAdd = () => {
    const selectedItem = images.find((item) => item.id === activeImageId)
    console.log('selectedItem', selectedItem)
    if (selectedItem && selectedScanner) {
      const updatedSubArray = [...selectedItem.scanResult, selectedScanner]
      if (selectedItem.scanResult.includes(`${selectedScanner}`)) {
        setImages([...images])
      } else {
        selectedItem.scanResult = updatedSubArray
        setImages([...images])
        setIsLoading(true)
      }
      setSelectedImage('')
    }
    onScanClose()
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
    setTimeout(() => {
      setIsLoading(false)
    }, 10000)
  }, [isLoading])

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
          {/* <TableContainer width={'100%'}>
            <Table variant='simple'>
              <Thead>
                <Tr>
                  <Th>Select Image</Th>
                  <Th>Select Scanner</Th>
                  <Th>Vulnerability</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td>
                    <Select
                      id='images'
                      placeholder='Select an image to analyze'
                      value={selectedImage}
                      onChange={(e) => setSelectedImage(e.target.value)}
                    >
                      <option value='dependencytrack/apisever:latest'>
                        dependencytrack/apisever:latest
                      </option>
                      <option value='dependencytrack/frontend:latest'>
                        dependencytrack/frontend:latest
                      </option>
                      <option value='ghcr.io/interlynk-io/sbomqs:latest'>
                        ghcr.io/interlynk-io/sbomqs:latest
                      </option>
                      <option value='k8s.gcr.io/coredns/coredns:v1.8.4'>
                        k8s.gcr.io/coredns/coredns:v1.8.4
                      </option>
                      <option value='k8s.gcr.io/etcd:3.5.0-0'>
                        k8s.gcr.io/etcd:3.5.0-0
                      </option>
                      <option value='k8s.gcr.io/kube-apiserver:v1.22.5'>
                        k8s.gcr.io/kube-apiserver:v1.22.5
                      </option>
                      <option value='k8s.gcr.io/kube-controller-manager:v1.22.5'>
                        k8s.gcr.io/kube-controller-manager:v1.22.5
                      </option>
                      <option value='k8s.gcr.io/kube-proxy:v1.22.5'>
                        k8s.gcr.io/kube-proxy:v1.22.5
                      </option>
                      <option value='k8s.gcr.io/kube-scheduler:v1.22.5'>
                        k8s.gcr.io/kube-scheduler:v1.22.5
                      </option>
                    </Select>
                  </Td>
                  <Td>
                    <Select
                      id='scanner'
                      placeholder='Select an scanner to analyze'
                      value={selectedScanner}
                      onChange={(e) => setSelectedScanner(e.target.value)}
                    >
                      <option value='Trivy'>Trivy</option>
                      <option value='Syft'>Syft</option>
                      <option value='Docker Scout'>Docker Scout</option>
                      <option value='Snyk'>Snyk</option>
                    </Select>
                  </Td>
                  <Td>
                    {isActive ? (
                      <Flex direction='row' gap='2'>
                        <Flex
                          alignItems={'center'}
                          gap={0.5}
                          px={4}
                          py={1}
                          rounded={'md'}
                          bg='red.500'
                          color={'white'}
                        >
                          <Text>3</Text>
                          <Text>C</Text>
                        </Flex>
                        <Flex
                          alignItems={'center'}
                          gap={0.5}
                          px={4}
                          py={1}
                          rounded={'md'}
                          bg='red.300'
                        >
                          <Text>2</Text>
                          <Text>H</Text>
                        </Flex>
                        <Flex
                          alignItems={'center'}
                          gap={0.5}
                          px={4}
                          py={1}
                          rounded={'md'}
                          bg='orange'
                        >
                          <Text>5</Text>
                          <Text>M</Text>
                        </Flex>
                      </Flex>
                    ) : (
                      <Text>Not analysed</Text>
                    )}
                  </Td>
                  <Td>
                    {isActive ? (
                      <Button colorScheme='blue' onClick={handleAddProduct}>
                        Add as Product
                      </Button>
                    ) : (
                      <Button
                        isLoading={hasAnalyzed}
                        colorScheme='blue'
                        onClick={handleAnalyze}
                      >
                        Analyze Image
                      </Button>
                    )}
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer> */}

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
                            _hover={{
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
                                setActiveImageId(item.id)
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
          <ModalHeader>Add Scanner</ModalHeader>
          <ModalCloseButton />
          <ModalBody mb={6}>
            <Select
              id='scanner'
              placeholder='Select a scanner'
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
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(e.target.value)}
              mt={4}
            >
              {allScanners && selectedScanner !== ''
                ? allScanners.scanners
                    .filter((scanner) => selectedScanner === `${scanner.name}`)
                    .map((item) => (
                      <option key={item.id} value={item.version}>
                        {item.version}
                      </option>
                    ))
                : allScanners &&
                  allScanners.scanners.map((item) => (
                    <option key={item.id} value={item.version}>
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
            <Button colorScheme='blue' onClick={handleScanAdd}>
              Add
            </Button>
          </ModalFooter>
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
