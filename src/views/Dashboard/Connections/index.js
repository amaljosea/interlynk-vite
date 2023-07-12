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
  Td,
  Select,
  Text,
  useToast
} from '@chakra-ui/react'
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import { GetAllConnectors, GetAllOrgConnectors } from 'graphQL/Queries'
import React, { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { OrgConnectorCreate } from 'graphQL/Mutation'
import { OrgConnectorUpdate } from 'graphQL/Mutation'
import { OrgConnectorDelete } from 'graphQL/Mutation'

import { getConImg, regions } from 'utils'
import { timeSince } from 'utils'
import { OrgConnectorRefresh } from 'graphQL/Mutation'

const Index = () => {
  const toast = useToast()

  const [connectors, setConnectors] = useState([])

  const { data: allConnectors } = useQuery(GetAllConnectors, {
    variables: {}
  })

  const { data: orgConnectors, refetch } = useQuery(GetAllOrgConnectors, {
    variables: {}
  })

  const [organizationConnectorRefresh] = useMutation(OrgConnectorRefresh, {
    onCompleted: refetch
  })

  const [organizationConnectorCreate] = useMutation(OrgConnectorCreate, {
    onCompleted: refetch
  })

  const [organizationConnectorUpdate] = useMutation(OrgConnectorUpdate, {
    onCompleted: refetch
  })

  const [organizationConnectorDelete] = useMutation(OrgConnectorDelete, {
    onCompleted: refetch
  })

  useEffect(() => {
    if (allConnectors) {
      const con = [...allConnectors.connectors]
      const result = con.sort((a, b) => {
        const nameA = a.name.toUpperCase()
        const nameB = b.name.toUpperCase()

        if (nameA < nameB) {
          return -1
        }
        if (nameA > nameB) {
          return 1
        }
        return 0
      })
      setConnectors(result)
      // console.log('connectors', result)
    }
  }, [allConnectors])

  const { isOpen, onOpen, onClose } = useDisclosure()

  const [registryName, setRegistryName] = useState('')
  const [activeConnection, setActiveConnection] = useState('')
  const [selectedConnection, setSelectedConnection] = useState(null)

  const [conStatus, setConStatus] = useState(false)
  const [connectorName, setConnectorName] = useState('')
  const [username, setUsername] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [region, setRegion] = useState()

  const [connectorResults, setConnectorResults] = useState([])

  useEffect(() => {
    if (orgConnectors) {
      const sortedData = [...orgConnectors.organizationConnectors].sort(
        (a, b) => {
          const dateA = new Date(a.updatedAt).getTime()
          const dateB = new Date(b.updatedAt).getTime()
          return dateB - dateA
        }
      )
      setConnectorResults(sortedData)
    }
  }, [orgConnectors])

  const handleRefresh = async () => {
    try {
      await organizationConnectorRefresh().then(() =>
        toast({
          description: 'Connections updated successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top'
        })
      )
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

  const handleOpen = (item) => {
    setSelectedConnection(null)
    setConnectorName('')
    setUsername('')
    setAccessToken('')
    setRegion('us-east-1')
    setActiveConnection(item.id)
    setRegistryName(item.name)
    onOpen()
  }

  const handleEdit = async (item) => {
    console.log('item', item)
    setRegistryName(item.connector.name)
    setSelectedConnection(item)
    setConnectorName(item.name)
    setUsername(item.username)
    setAccessToken(item.token)
    onOpen()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (selectedConnection) {
      try {
        await organizationConnectorUpdate({
          variables: {
            id: selectedConnection.id,
            name: connectorName,
            enabled: conStatus
          }
        })
        onClose()
      } catch (error) {
        console.error('Mutation error:', error)
      }
    } else {
      try {
        await organizationConnectorCreate({
          variables: {
            connId: activeConnection,
            name: connectorName,
            user: username,
            token: accessToken,
            readOnly: true,
            enabled: conStatus,
            region: region ? region : ''
          }
        })
        onClose()
      } catch (error) {
        if (error.networkError && error.networkError.statusCode === 500) {
          // Handle the specific error
          alert(
            'Duplicate connector is being created for Dockerhub with the same account ID.'
          )
          onClose()
        } else {
          // Handle other errors
          alert(error.message)
        }
      }
      setSelectedConnection(null)
    }
  }

  const handleDelete = async (id) => {
    try {
      await organizationConnectorDelete({
        variables: {
          id
        }
      })
      onClose()
    } catch (error) {
      if (error.networkError && error.networkError.statusCode === 500) {
        // Handle the specific error
        alert('Multiple connection not allowed from single organization.')
      } else {
        // Handle other errors
        alert(error.message)
      }
    }
  }

  useEffect(() => {
    // console.log('selectedConnection', selectedConnection)
    selectedConnection
      ? setConStatus(selectedConnection.enabled)
      : setConStatus(true)
  }, [selectedConnection])

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
                    bg={'whiteAlpha.900'}
                    rounded={'md'}
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
                        src={getConImg(item.name)}
                        alt={`${item.name}`}
                      />
                      <Heading size='md'>{item.name}</Heading>
                    </Flex>
                    <Flex>
                      <Button
                        colorScheme='blue'
                        variant='ghost'
                        onClick={() => handleOpen(item)}
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
                          <Switch
                            id='connStatus'
                            isChecked={conStatus}
                            onChange={() => setConStatus(!conStatus)}
                          />
                          <FormLabel htmlFor='connStatus' mb='0'>
                            {conStatus === true ? 'Enabled' : 'Disabled'}
                          </FormLabel>
                        </FormControl>
                        <FormControl
                          display='flex'
                          gap={2}
                          alignItems='flex-start'
                        ></FormControl>
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
                        <FormControl
                          isRequired
                          isDisabled={
                            selectedConnection === null ? false : true
                          }
                        >
                          <FormLabel>
                            {registryName === 'Amazon ECR'
                              ? 'AWS Access Key ID'
                              : 'Account ID'}
                          </FormLabel>
                          <Input
                            type='text'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder={'Enter your username'}
                          />
                        </FormControl>
                        {selectedConnection === null && (
                          <FormControl isRequired>
                            <FormLabel>
                              {registryName === 'Amazon ECR'
                                ? 'AWS Secret Access Key'
                                : 'Access Token'}
                            </FormLabel>
                            <Input
                              type='text'
                              value={accessToken}
                              onChange={(e) => setAccessToken(e.target.value)}
                              placeholder={'Enter access token'}
                            />
                          </FormControl>
                        )}
                        {selectedConnection === null &&
                          registryName === 'Amazon ECR' && (
                            <FormControl isRequired>
                              <FormLabel>AWS Region</FormLabel>
                              <Select
                                defaultValue={'us-east-1'}
                                value={region}
                                onChange={(e) => setRegion(e.target.value)}
                              >
                                {regions.map((item, index) => (
                                  <option key={index} value={item.id}>
                                    {item.name}
                                  </option>
                                ))}
                              </Select>
                            </FormControl>
                          )}
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
            <Flex
              px={6}
              width={'100%'}
              justifyContent={'space-between'}
              alignItems={'center'}
            >
              <Heading size='md' px={2}>
                Authenticated Connections
              </Heading>
              <Button colorScheme='blue' onClick={handleRefresh}>
                Refresh
              </Button>
            </Flex>
            <Card my='22px' overflowX={{ sm: 'scroll', xl: 'hidden' }}>
              <CardBody>
                <Table>
                  <Thead>
                    <Tr>
                      <Th px={8}>Status</Th>
                      <Th px={8}>Connector Name</Th>
                      <Th px={8}>Account ID</Th>
                      <Th px={8}>Updated At</Th>
                      <Th px={8}>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {connectorResults &&
                      connectorResults.map((item, index) => (
                        <Tr key={index}>
                          <Td>
                            <Switch
                              id='status'
                              isChecked={item.enabled}
                              readOnly
                            />
                          </Td>
                          <Td mt={2} px={8}>
                            <Flex
                              direction={'row'}
                              gap={4}
                              alignItems={'center'}
                            >
                              <Image
                                src={getConImg(item.connector.name)}
                                width={7}
                                height={7}
                              />
                              <Flex
                                direction={'column'}
                                gap={1}
                                alignItems={'start'}
                              >
                                <Text fontSize='sm' fontWeight={600}>
                                  {item.name}
                                </Text>
                              </Flex>
                            </Flex>
                          </Td>
                          <Td mt={2} px={8} fontSize={'sm'}>
                            {item.username}
                          </Td>
                          <Td mt={2} px={8} fontSize={'sm'}>
                            {timeSince(item.updatedAt)}
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
                                onClick={() => handleDelete(item.id)}
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
