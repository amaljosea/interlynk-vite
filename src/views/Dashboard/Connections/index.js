import { DeleteIcon, EditIcon } from '@chakra-ui/icons'
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
  Td
} from '@chakra-ui/react'
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import { GetAllConnectors, GetAllOrgConnectors } from 'graphQL/Queries'
import React, { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { OrgConnectorCreate } from 'graphQL/Mutation'
import { OrgConnectorUpdate } from 'graphQL/Mutation'

const Index = () => {
  const getConImg = (id) => {
    switch (id) {
      case 'd2d3eb63-3378-4f14-92a6-41eb46c7b39c':
        return 'https://img.icons8.com/fluency/48/docker.png'
        break
      case '6fd06afe-1b4b-4c94-a56a-c77a9495b690':
        return 'https://img.icons8.com/color/48/amazon-web-services.png'
        break
      case 'ccf97810-5576-421f-989a-eb800ac4b6e3':
        return 'https://img.icons8.com/fluency/48/azure-1.png'
        break
      case '2ab9d03a-c856-466f-96ca-ad8c0512bc3f':
        return 'https://img.icons8.com/glyph-neue/64/github.png'
        break
      case '37149b5d-3ab2-41e1-b829-e09db05165fb':
        return 'https://img.icons8.com/color/48/gitlab.png'
        break
      default:
        break
    }
  }

  const orgID = process.env.REACT_APP_ORGID

  useEffect(() => {
    console.log('orgID', orgID)
  }, [])

  const [connectors, setConnectors] = useState([])

  const { data: allConnectors } = useQuery(GetAllConnectors, {
    variables: {}
  })

  const { data: orgConnectors } = useQuery(GetAllOrgConnectors, {
    variables: { id: orgID }
  })

  // sofueled id : 'f0b30788-3fa6-417f-b372-0c580f5ed876'

  const [organizationConnectorCreate] = useMutation(OrgConnectorCreate)

  const [organizationConnectorUpdate] = useMutation(OrgConnectorUpdate)

  useEffect(() => {
    if (allConnectors) {
      setConnectors(allConnectors.connectors)
    }
  }, [allConnectors])

  const { isOpen, onOpen, onClose } = useDisclosure()

  const [registryName, setRegistryName] = useState('')
  const [activeConnection, setActiveConnection] = useState('')
  const [selectedConnection, setSelectedConnection] = useState(null)

  const [connectorName, setConnectorName] = useState('')
  const [username, setUsername] = useState('')
  const [accessToken, setAccessToken] = useState('')

  const handleOpen = (id) => {
    setConnectorName('')
    setUsername('')
    setAccessToken('')
    setActiveConnection(id)
    switch (id) {
      case 'd2d3eb63-3378-4f14-92a6-41eb46c7b39c':
        setRegistryName('Docker Hub')
        break
      case '6fd06afe-1b4b-4c94-a56a-c77a9495b690':
        setRegistryName('Amazon ECR')
        break
      case 'ccf97810-5576-421f-989a-eb800ac4b6e3':
        setRegistryName('Azure Container Registry')
        break
      case '2ab9d03a-c856-466f-96ca-ad8c0512bc3f':
        setRegistryName('Github (ghcr.io)')
        break
      case '37149b5d-3ab2-41e1-b829-e09db05165fb':
        setRegistryName('Gitlab')
        break
      default:
        break
    }

    onOpen()
  }

  const handleEdit = async (item) => {
    onOpen()
    setSelectedConnection(item)
    setConnectorName(item.name)
    setUsername(item.username)
    setAccessToken(item.token)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (selectedConnection) {
      try {
        await organizationConnectorUpdate({
          variables: {
            id: selectedConnection.id,
            orgId: selectedConnection.organizationId,
            connId: selectedConnection.connectorId,
            name: connectorName,
            user: username,
            token: accessToken,
            readOnly: true,
            enabled: true
          }
        })
        window.location.reload()
      } catch (error) {
        console.error('Mutation error:', error)
      }
    } else {
      try {
        await organizationConnectorCreate({
          variables: {
            orgId: orgID,
            connId: activeConnection,
            name: connectorName,
            user: username,
            token: accessToken,
            readOnly: true,
            enabled: true
          }
        })
        window.location.reload()
      } catch (error) {
        if (error.networkError && error.networkError.statusCode === 500) {
          // Handle the specific error
          alert('Multiple connection not allowed from single organization.')
          window.location.reload()
        } else {
          // Handle other errors
          console.error(error.message)
        }
      }
      setSelectedConnection(null)
    }
  }

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
              {connectors.map((item) => (
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
                        src={getConImg(item.id)}
                        alt={`${item.name}`}
                      />
                      <Heading size='md'>{item.name}</Heading>
                    </Flex>
                    <Flex>
                      <Button
                        colorScheme='blue'
                        variant='ghost'
                        onClick={() => handleOpen(item.id)}
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
                <form onSubmit={handleSubmit}>
                  <ModalHeader>{registryName}</ModalHeader>
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
                        <FormControl
                          display='flex'
                          gap={2}
                          alignItems='flex-start'
                        >
                          {/* <Switch id='readOnly' checked /> */}
                          {/* <FormLabel htmlFor='readOnly' mb='0'>
                              Read Only
                            </FormLabel> */}
                        </FormControl>
                      </Flex>
                      <Flex width={'100%'} direction={'column'} gap={4}>
                        <FormControl isRequired>
                          <FormLabel>Connector Name</FormLabel>
                          <Input
                            type='text'
                            value={connectorName}
                            onChange={(e) => setConnectorName(e.target.value)}
                            placeholder={'Enter connector name'}
                          />
                        </FormControl>
                        <FormControl isRequired>
                          <FormLabel>Username</FormLabel>
                          <Input
                            type='text'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder={'Enter your username'}
                          />
                        </FormControl>
                        <FormControl isRequired>
                          <FormLabel>Access Token</FormLabel>
                          <Input
                            type='text'
                            value={accessToken}
                            onChange={(e) => setAccessToken(e.target.value)}
                            placeholder={'Enter access token'}
                          />
                        </FormControl>
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
                      <Th px={8}>Username</Th>
                      <Th px={8}>Token</Th>
                      <Th px={8}>Updated at</Th>
                      <Th px={8}>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {orgConnectors &&
                      orgConnectors.organizationConnectors.length > 0 &&
                      orgConnectors.organizationConnectors.map(
                        (item, index) => (
                          <Tr key={index}>
                            <Td mt={2} px={8}>
                              <Flex
                                direction={'row'}
                                gap={4}
                                alignItems={'center'}
                              >
                                <Image
                                  src={getConImg(item.connectorId)}
                                  width={8}
                                  height={8}
                                />
                                <Flex
                                  direction={'column'}
                                  gap={1}
                                  alignItems={'start'}
                                >
                                  <Heading size='base'>{item.name}</Heading>
                                  {/* <Text size='xs'>Read only</Text> */}
                                </Flex>
                              </Flex>
                            </Td>
                            <Td mt={2} px={8}>
                              {item.username}
                            </Td>
                            <Td mt={2} px={8}>
                              {item.token}
                            </Td>
                            <Td mt={2} px={8}>
                              {new Date(item.updatedAt).toLocaleDateString()}
                            </Td>
                            <Td mt={2} px={8}>
                              <Flex
                                direction={'row'}
                                gap={4}
                                alignItems={'start'}
                              >
                                <EditIcon
                                  color={'blue.500'}
                                  cursor={'pointer'}
                                  onClick={() => handleEdit(item)}
                                />

                                <DeleteIcon
                                  color={'red.400'}
                                  cursor={'pointer'}
                                />
                              </Flex>
                            </Td>
                          </Tr>
                        )
                      )}
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
