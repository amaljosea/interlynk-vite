import { CopyIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Switch,
  FormControl,
  FormLabel,
  Input,
  Table,
  Thead,
  Tr,
  Tbody,
  Th,
  Td,
  Text
} from '@chakra-ui/react'
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import GlobalContext from 'context/GlobalContext'
import React, { useEffect, useState } from 'react'
import { useContext } from 'react'

const Index = () => {
  const { registryList, setRegistryList } = useContext(GlobalContext)
  const registry = [
    {
      id: 1,
      icon: 'https://img.icons8.com/fluency/48/docker.png',
      title: 'Docker Hub',
      alt: 'docker'
    },
    {
      id: 2,
      icon: 'https://img.icons8.com/color/48/amazon-web-services.png',
      title: 'Amazon ECR',
      alt: 'aws'
    },
    {
      id: 3,
      icon: 'https://img.icons8.com/fluency/48/azure-1.png',
      title: 'Azure Container Registry (ACR)',
      alt: 'azure'
    },
    {
      id: 4,
      icon: 'https://img.icons8.com/glyph-neue/64/github.png',
      title: 'Github',
      alt: 'github'
    },
    {
      id: 5,
      icon: 'https://img.icons8.com/color/48/gitlab.png',
      title: 'GitLab',
      alt: 'gitlab'
    }
  ]

  const { isOpen, onOpen, onClose } = useDisclosure()

  const [connectorName, setConnectorName] = useState('Interlynk-Prod')
  const [dockerAccountId, setDockerAccountId] = useState('Interlynk-io')
  const [accessToken, setAccessToken] = useState(
    'Fee7ea3a-979b-47c7-92bb-9d9d0419fe80'
  )
  const [orgAccountId, setOrgAccountId] = useState('327914055')

  const [gitConnectorName, setGitConnectorName] = useState('Interlynk-GH')
  const [gitUsername, setGitUsername] = useState('surendrapathak')
  const [gitAccessToken, setGitAccessToken] = useState(
    'Fee7ea3a-979b-47c7-92bb-9d9d0419fe80'
  )
  const [gitConnectorId, setGitConnectorId] = useState(
    'sdvdffd979bdfdd234dZHfab21'
  )

  const [isSelected, setIsSelected] = useState('')

  const handleOpen = (registry) => {
    if (registry === 'docker' || registry === 'github') {
      onOpen()
    }

    if (registry === 'docker') {
      setIsSelected('docker')
    } else {
      setIsSelected('github')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = {
      readOnly: true,
      registry: isSelected,
      connector: connectorName,
      service:
        isSelected === 'docker'
          ? 'Docker Hub Registry'
          : 'Github Container Registry',
      endpoint: isSelected === 'docker' ? 'ghcr.io' : 'docker.io'
    }
    setRegistryList((prev) => [data, ...prev])
    onClose()
  }

  useEffect(() => {
    console.log('registryList', registryList)
  }, [registryList])

  return (
    <>
      <Flex direction='column' pt={{ base: '120px', md: '0px' }}>
        <Flex direction='column' pt={{ base: '200px', md: '75px' }}>
          <Box px={6}>
            <Heading size='md' px={2}>
              Connect a registry to get started with Interlynk
            </Heading>
          </Box>
          <Box px={6}>
            <Grid
              width={'100%'}
              height={'100%'}
              mt={10}
              px={2}
              templateColumns='repeat(5, 1fr)'
              gap={6}
            >
              {registry.map((item) => (
                <GridItem
                  w='100%'
                  h='250px'
                  bg='whiteAlpha.200'
                  shadow={'lg'}
                  rounded={'lg'}
                  key={item.id}
                >
                  <Flex
                    w='100%'
                    h='100%'
                    direction={'column'}
                    alignItems={'center'}
                    justifyContent={'space-between'}
                    p={6}
                    textAlign={'center'}
                  >
                    <Flex
                      direction={'column'}
                      alignItems={'center'}
                      justifyContent={'center'}
                      gap={2}
                    >
                      <Image
                        width='16'
                        height='16'
                        src={`${item.icon}`}
                        alt={`${item.alt}`}
                      />
                      <Heading size='md'>{item.title}</Heading>
                    </Flex>
                    <Flex>
                      <Button
                        colorScheme='blue'
                        variant='ghost'
                        onClick={() => handleOpen(item.alt)}
                      >
                        Connect
                      </Button>
                    </Flex>
                  </Flex>
                </GridItem>
              ))}
            </Grid>
            <Modal isOpen={isOpen} onClose={onClose}>
              <ModalOverlay />
              <ModalContent>
                {isSelected === 'docker' ? (
                  <form onSubmit={handleSubmit}>
                    <ModalHeader>Docker Hub (Authenticated)</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                      <Flex
                        width={'100%'}
                        direction='column'
                        gap={6}
                        alignItems={'flex-start'}
                      >
                        <Flex width={'100%'} direction={'row'} gap={2}>
                          <FormControl
                            display='flex'
                            gap={2}
                            alignItems='flex-start'
                          >
                            <Switch id='disabled' />
                            <FormLabel htmlFor='disabled' mb='0'>
                              Disabled
                            </FormLabel>
                          </FormControl>
                          {/* <FormControl
                            display='flex'
                            gap={2}
                            alignItems='flex-start'
                          >
                            <Switch id='readOnly' checked />
                            <FormLabel htmlFor='readOnly' mb='0'>
                              Read Only
                            </FormLabel>
                          </FormControl> */}
                        </Flex>
                        <Flex width={'100%'} direction={'column'} gap={4}>
                          <FormControl isRequired>
                            <FormLabel>Connector name</FormLabel>
                            <Input
                              type='text'
                              value={connectorName}
                              onChange={(e) => setConnectorName(e.target.value)}
                              placeholder={'Connector Name'}
                            />
                          </FormControl>
                          <FormControl isRequired>
                            <FormLabel>Docker Account ID</FormLabel>
                            <Input
                              type='text'
                              value={dockerAccountId}
                              onChange={(e) =>
                                setDockerAccountId(e.target.value)
                              }
                              placeholder={'Docker Account ID'}
                            />
                          </FormControl>
                          <FormControl isRequired>
                            <FormLabel>Access Token</FormLabel>
                            <Input
                              type='password'
                              value={accessToken}
                              onChange={(e) => setAccessToken(e.target.value)}
                              placeholder={'Access Token'}
                            />
                          </FormControl>
                          {/* <FormControl isRequired>
                            <FormLabel>Organization Account ID</FormLabel>
                            <Input
                              type='text'
                              value={orgAccountId}
                              onChange={(e) => setOrgAccountId(e.target.value)}
                              placeholder={'Organization Account ID'}
                            />
                          </FormControl> */}
                        </Flex>
                      </Flex>
                    </ModalBody>
                    <ModalFooter>
                      <Button
                        colorScheme='blue'
                        variant='outline'
                        onClick={onClose}
                        mr={4}
                      >
                        Cancel
                      </Button>
                      <Button colorScheme='blue' type='submit'>
                        Save
                      </Button>
                    </ModalFooter>
                  </form>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <ModalHeader>Github (Authenticated)</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                      <Flex
                        width={'100%'}
                        direction='column'
                        gap={6}
                        alignItems={'flex-start'}
                      >
                        <Flex width={'100%'} direction={'row'} gap={2}>
                          <FormControl
                            display='flex'
                            gap={2}
                            alignItems='flex-start'
                          >
                            <Switch id='disabled' />
                            <FormLabel htmlFor='disabled' mb='0'>
                              Disabled
                            </FormLabel>
                          </FormControl>
                          {/* <FormControl
                            display='flex'
                            gap={2}
                            alignItems='flex-start'
                          >
                            <Switch id='readOnly' checked />
                            <FormLabel htmlFor='readOnly' mb='0'>
                              Read Only
                            </FormLabel>
                          </FormControl> */}
                        </Flex>
                        <Flex width={'100%'} direction={'column'} gap={4}>
                          <FormControl isRequired>
                            <FormLabel>Connector name</FormLabel>
                            <Input
                              type='text'
                              value={gitConnectorName}
                              onChange={(e) =>
                                setGitConnectorName(e.target.value)
                              }
                            />
                          </FormControl>
                          <FormControl isRequired>
                            <FormLabel>Github username</FormLabel>
                            <Input
                              type='text'
                              value={gitUsername}
                              onChange={(e) => setGitUsername(e.target.value)}
                            />
                          </FormControl>
                          <FormControl isRequired>
                            <FormLabel>Github Access Token</FormLabel>
                            <Input
                              type='password'
                              value={gitAccessToken}
                              onChange={(e) =>
                                setGitAccessToken(e.target.value)
                              }
                            />
                          </FormControl>
                          <Box>
                            <Text>Connector ID - {gitConnectorId}</Text>
                          </Box>
                        </Flex>
                      </Flex>
                    </ModalBody>
                    <ModalFooter>
                      <Button
                        colorScheme='blue'
                        variant='outline'
                        onClick={onClose}
                        mr={4}
                      >
                        Cancel
                      </Button>
                      <Button colorScheme='blue' type='submit'>
                        Save
                      </Button>
                    </ModalFooter>
                  </form>
                )}
              </ModalContent>
            </Modal>
          </Box>
          <Flex direction={'column'} gap={4} mt={12}>
            <Box px={6}>
              <Heading size='md' px={2}>
                Authenticated Connections
              </Heading>
            </Box>
            <Card my='22px' overflowX={{ sm: 'scroll', xl: 'hidden' }}>
              <CardBody>
                <Table>
                  <Thead>
                    <Tr>
                      <Th px={8}>Connector</Th>
                      <Th px={8}>Service</Th>
                      <Th px={8}>Endpoint</Th>
                      <Th px={8}>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {registryList.length > 0 &&
                      registryList.map((item, index) => (
                        <Tr key={index}>
                          <Td mt={2} px={8}>
                            <Flex
                              direction={'row'}
                              gap={4}
                              alignItems={'start'}
                            >
                              {item.registry === 'docker' ? (
                                <Image
                                  src='https://img.icons8.com/fluency/48/docker.png'
                                  width={8}
                                  height={8}
                                />
                              ) : (
                                <Image
                                  src='https://img.icons8.com/glyph-neue/64/github.png'
                                  width={8}
                                  height={8}
                                />
                              )}
                              <Flex
                                direction={'column'}
                                gap={1}
                                alignItems={'start'}
                              >
                                <Heading size='base'>{item.connector}</Heading>
                              </Flex>
                            </Flex>
                          </Td>
                          <Td mt={2} px={8}>
                            {item.service}
                          </Td>
                          <Td mt={2} px={8}>
                            {item.endpoint}
                          </Td>
                          <Td mt={2} px={8}>
                            <Flex
                              direction={'row'}
                              gap={4}
                              alignItems={'start'}
                            >
                              <EditIcon color={'blue.500'} cursor={'pointer'} />
                              <CopyIcon color={'blue.500'} cursor={'pointer'} />
                              <DeleteIcon
                                color={'blue.500'}
                                cursor={'pointer'}
                              />
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
      </Flex>
    </>
  )
}

export default Index
