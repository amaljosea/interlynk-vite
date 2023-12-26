import { useMutation } from '@apollo/client'
import { DeleteIcon } from '@chakra-ui/icons'
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Input,
  Button,
  Flex,
  Text,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Table,
  Icon,
  useToast,
  FormControl,
  FormErrorMessage,
  Tooltip,
  FormLabel,
  Stack
} from '@chakra-ui/react'
import {
  CreateAutomation,
  toolDelete,
  supplierCreate,
  supplierDelete,
  recheckHealth,
  authorCreate,
  toolCreate
} from 'graphQL/Mutation'
import { useGlobalState } from 'hooks/useGlobalState'
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getFullDateAndTime, timeSince, validateEmail } from 'utils'

const GeneralDataDrawer = ({
  isOpen,
  onClose,
  btnRef,
  data,
  selectedKey,
  refetch,
  checkId,
  filterRefetch
}) => {
  const toast = useToast()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('id')
  const sbomId = queryParams.get('sbom')

  const { dispatch } = useGlobalState()
  const { prodCheckDispatch } = dispatch

  const [toolName, setToolName] = useState('')
  const [toolVersion, setToolVersion] = useState('')
  const [toolVendor, setToolVendor] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [authorEmail, setAuthorEmail] = useState('')

  const [supName, setSupName] = useState('')
  const [supEmail, setSupEmail] = useState('')

  const [existingTools, setExistingTools] = useState([])
  const [creationTools, setCreationTools] = useState([])
  const [existingAuthors, setExistingAuthors] = useState([])
  const [authorList, setAuthorList] = useState([])
  const [supplierList, setSupplierList] = useState([])

  const [authorError, setAuthorError] = useState('')

  const onAuthorChange = (e) => {
    const { value } = e.target
    setAuthorName(value)
    if (value.length < 4 || value.length > 256) {
      setAuthorError('Input must be between 4 and 256 characters')
    } else {
      setAuthorError('')
    }
  }

  const [createTool] = useMutation(toolCreate)
  const [deleteTool] = useMutation(toolDelete)

  const [createAuthor] = useMutation(authorCreate)

  const [createSupplier] = useMutation(supplierCreate)
  const [deleteSupplier] = useMutation(supplierDelete)

  const [healthRecheck] = useMutation(recheckHealth, {
    onCompleted: () => refetch()
  })

  const [createAutoCheck] = useMutation(CreateAutomation)

  const onFilterRefetch = () => {
    filterRefetch({
      projectId: productId,
      sbomId: sbomId
    }).then((res) =>
      prodCheckDispatch({
        type: 'ADD_FILTER_HEADS',
        payload: res.data.sbom.filters
      })
    )
  }

  useEffect(() => {
    if (data) {
      setExistingTools(data.tools ? data.tools : [])
      setSupplierList(data.suppliers ? data.suppliers : [])
      setExistingAuthors(data.authors ? data.authors : [])
    }
  }, [data])

  const handleAuthorAdd = async (e) => {
    e.preventDefault()
    setAuthorList((prev) => [
      {
        name: authorName,
        email: authorEmail,
        updatedAt: new Date().toISOString()
      },
      ...prev
    ])
    setAuthorName('')
    setAuthorEmail('')
  }

  const handleSupAdd = async (e) => {
    e.preventDefault()
    if (validateEmail(supEmail) === true) {
      await createSupplier({
        variables: {
          name: supName,
          contactEmail: supEmail,
          sbomId: sbomId
        }
      }).then((res) => {
        if (res) {
          setSupplierList((prev) => [
            res.data.sbomSupplierCreate.sbomSupplier,
            ...prev
          ])
          setSupName('')
          setSupEmail('')
        }
      })
    } else {
      toast({
        description: 'Invalid email',
        status: 'error',
        position: 'top-right',
        duration: 2000
      })
    }
  }

  const handleSupRemove = async (id) => {
    try {
      await deleteSupplier({
        variables: {
          supplierId: id,
          sbomId: sbomId
        }
      }).then((res) => {
        const updatedList = supplierList.filter((item) => item.id !== id)
        setSupplierList(updatedList)
      })
    } catch (error) {
      console.log(`Mutation error`, error)
    }
  }

  const handleToolAdd = async () => {
    setCreationTools((prev) => [
      {
        name: toolName,
        version: toolVersion,
        vendor: toolVendor,
        updatedAt: new Date().toISOString()
      },
      ...prev
    ])
    setToolName('')
    setToolVersion('')
    setToolVendor('')
  }

  const handleSave = () => {
    if (creationTools.length > 0) {
      creationTools.map((item) => {
        createTool({
          variables: {
            name: item.name,
            version: item.version,
            vendor: item.vendor,
            sbomID: sbomId
          }
        })
          .then((res) => {
            if (res) {
              refetch({
                productId: productId,
                sbomId: sbomId
              })
            }
          })
          .catch((error) => console.log(error))
      })
    }

    if (authorList.length > 0) {
      authorList.map((item) => {
        createAuthor({
          variables: {
            name: item.name,
            email: item.email,
            sbomId: sbomId
          }
        })
          .then((res) => {
            if (res) {
              refetch({
                productId: productId,
                sbomId: sbomId
              })
            }
          })
          .catch((error) => console.log(error))
      })
    }

    if (checkId && (creationTools.length > 0 || authorList.length > 0)) {
      prodCheckDispatch({ type: 'FETCH_DATA_SUCCESS' })
      healthRecheck({
        variables: {
          checkId: checkId,
          sbomId: sbomId
        }
      })
    }

    onClose()
  }

  const heading = (name) => {
    switch (name) {
      case 'tools':
        return 'Creation Tools'
      case 'author':
        return 'Authors'
      case 'supplier':
        return 'Supplier'
      case 'license':
        return 'License'
      case 'identifier':
        return 'Identifiers'
    }
  }

  const onSaveRule = async () => {
    if (authorList.length > 0) {
      try {
        await createAutoCheck({
          variables: {
            projectId: productId,
            applicable: 'document',
            condition: 'missing',
            attr: 'author',
            enabled: true,
            set: JSON.stringify(
              { name: authorList[0].name, email: authorList[0].email },
              null,
              2
            )
          }
        }).then((res) => res.data && handleSave())
      } catch (error) {
        console.log('Error', error)
      }
    } else if (creationTools.length > 0) {
      try {
        await createAutoCheck({
          variables: {
            projectId: productId,
            applicable: 'document',
            condition: 'missing',
            attr: 'tool',
            enabled: true,
            set: JSON.stringify(
              {
                name: creationTools[0].name,
                version: creationTools[0].version
              },
              null,
              2
            )
          }
        }).then((res) => res.data && handleSave())
      } catch (error) {
        console.log('Error', error)
      }
    }
  }

  return (
    <>
      <Drawer
        isOpen={isOpen}
        placement='right'
        onClose={onClose}
        closeOnOverlayClick={true}
        size='lg'
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{heading(selectedKey)}</DrawerHeader>
          <DrawerBody>
            {selectedKey === 'tools' && (
              <Flex direction={'column'} alignItems={'flex-start'} gap={3}>
                <FormControl isRequired>
                  <FormLabel htmlFor='toolVendor'>Vendor Name</FormLabel>
                  <Input
                    id='toolVendor'
                    name='toolVendor'
                    value={toolVendor}
                    onChange={(e) => setToolVendor(e.target.value)}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel htmlFor='toolName'>Tool Name</FormLabel>
                  <Input
                    id='toolName'
                    name='toolName'
                    value={toolName}
                    onChange={(e) => setToolName(e.target.value)}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel htmlFor='toolVersion'>Version</FormLabel>
                  <Input
                    id='toolVersion'
                    name='toolVersion'
                    value={toolVersion}
                    onChange={(e) => setToolVersion(e.target.value)}
                  />
                </FormControl>
                <Button
                  colorScheme='blue'
                  onClick={handleToolAdd}
                  disabled={!toolName || !toolVersion || !toolVendor}
                >
                  Add
                </Button>

                <Flex width={'100%'} flexDir={'column'}>
                  <Text size='md' my={2}>
                    Existing Tools
                  </Text>

                  {(creationTools.length > 0 || existingTools.length > 0) && (
                    <Table variant='simple' size='sm' mt={4}>
                      <Thead>
                        <Tr my='.8rem'>
                          {['Vendor Name', 'Tool Name', 'Version', 'Added'].map(
                            (item, index) => (
                              <Th key={index} pl={0}>
                                {item}
                              </Th>
                            )
                          )}
                        </Tr>
                      </Thead>
                      <Tbody>
                        {creationTools.length > 0 &&
                          [...creationTools]
                            .sort(
                              (a, b) =>
                                new Date(b.updatedAt) - new Date(a.updatedAt)
                            )
                            .map((item, index) => (
                              <Tr key={index}>
                                <Td pl={0} fontSize={'xs'}>
                                  {item.name}
                                </Td>
                                <Td pl={0} fontSize={'xs'}>
                                  {item.version}
                                </Td>
                                <Td pl={0} fontSize={'xs'}>
                                  {item.vendor}
                                </Td>
                                <Td pl={0} fontSize={'xs'}>
                                  {timeSince(item.updatedAt)}
                                </Td>
                              </Tr>
                            ))}

                        {existingTools.length > 0 &&
                          [...existingTools]
                            .sort(
                              (a, b) =>
                                new Date(b.updatedAt) - new Date(a.updatedAt)
                            )
                            .map((item, index) => (
                              <Tr key={index}>
                                <Td pl={0} fontSize={'xs'}>
                                  {item.vendor}
                                </Td>
                                <Td pl={0} fontSize={'xs'}>
                                  {item.name}
                                </Td>
                                <Td pl={0} fontSize={'xs'}>
                                  {item.version}
                                </Td>
                                <Td pl={0} fontSize={'xs'}>
                                  <Tooltip
                                    label={getFullDateAndTime(item.updatedAt)}
                                    placement='top'
                                  >
                                    {timeSince(item.updatedAt)}
                                  </Tooltip>
                                </Td>
                              </Tr>
                            ))}
                      </Tbody>
                    </Table>
                  )}

                  {existingTools.length === 0 && creationTools.length === 0 && (
                    <Text mt={4} color={'darkgrey'}>
                      No creation tool specified
                    </Text>
                  )}
                </Flex>
              </Flex>
            )}

            {selectedKey === 'author' && (
              <form onSubmit={handleAuthorAdd}>
                <Flex direction={'column'} alignItems={'flex-start'} gap={3}>
                  <FormControl isRequired isInvalid={authorError}>
                    <Input
                      type='text'
                      placeholder='Author Name*'
                      value={authorName}
                      onChange={onAuthorChange}
                    />
                    <FormErrorMessage>{authorError}</FormErrorMessage>
                  </FormControl>

                  <FormControl
                    isInvalid={
                      !validateEmail(authorEmail) && authorEmail !== ''
                    }
                  >
                    <Input
                      type='email'
                      placeholder='Author Email*'
                      value={authorEmail}
                      onChange={(e) => setAuthorEmail(e.target.value)}
                    />

                    {authorEmail !== '' && !validateEmail(authorEmail) && (
                      <FormErrorMessage>Email is invalid</FormErrorMessage>
                    )}
                  </FormControl>

                  <Button
                    colorScheme='blue'
                    type='submit'
                    disabled={
                      !authorName ||
                      !authorEmail ||
                      !validateEmail(authorEmail) ||
                      authorError !== ''
                    }
                  >
                    Add
                  </Button>

                  <Flex width={'100%'} flexDir={'column'}>
                    <Text size='md' my={2}>
                      Author History
                    </Text>
                    {(existingAuthors.length > 0 || authorList.length > 0) && (
                      <Table variant='simple' size='sm' mt={4}>
                        <Thead>
                          <Tr my='.8rem'>
                            <Th pl={0}>Name</Th>
                            <Th pl={0} width={'120px'}>
                              Updated At
                            </Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {existingAuthors.length > 0 &&
                            existingAuthors.map((item, index) => (
                              <Tr key={index}>
                                <Td pl={0} fontSize={'xs'}>
                                  {item.name} - {item.email}
                                </Td>
                                <Td pl={0} fontSize={'xs'}>
                                  <Tooltip
                                    label={getFullDateAndTime(item.updatedAt)}
                                    placement={'top'}
                                  >
                                    {timeSince(item.updatedAt)}
                                  </Tooltip>
                                </Td>
                              </Tr>
                            ))}

                          {authorList.length > 0 &&
                            authorList.map((item, index) => (
                              <Tr key={index}>
                                <Td pl={0} fontSize={'xs'}>
                                  {item.name} - {item.email}
                                </Td>
                                <Td pl={0} fontSize={'xs'}>
                                  {timeSince(item.updatedAt)}
                                </Td>
                              </Tr>
                            ))}
                        </Tbody>
                      </Table>
                    )}

                    {existingAuthors.length === 0 &&
                      authorList.length === 0 && (
                        <Text mt={4} color={'darkgrey'}>
                          No author found
                        </Text>
                      )}
                  </Flex>
                </Flex>
              </form>
            )}

            {selectedKey === 'supplier' && (
              <form onSubmit={handleSupAdd}>
                <Flex direction={'column'} alignItems={'flex-start'} gap={3}>
                  <FormControl isRequired>
                    <Input
                      placeholder='Name'
                      value={supName}
                      onChange={(e) => setSupName(e.target.value)}
                    />
                  </FormControl>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='Email'
                      value={supEmail}
                      onChange={(e) => setSupEmail(e.target.value)}
                    />
                  </FormControl>

                  <Button colorScheme='blue' type='submit'>
                    Add
                  </Button>

                  <Flex width={'100%'} flexDir={'column'}>
                    <Text size='md' my={2}>
                      Supplier History
                    </Text>
                    {supplierList.length > 0 ? (
                      <Table variant='simple' size='sm' mt={4}>
                        <Thead>
                          <Tr my='.8rem'>
                            <Th pl={0}>Name</Th>
                            <Th pl={0}>Email</Th>
                            <Th pl={0}>Updated At</Th>
                            <Th pl={0}></Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {supplierList.map((item, index) => (
                            <Tr key={index}>
                              <Td pl={0} fontSize={'xs'}>
                                {item.name}
                              </Td>
                              <Td pl={0} fontSize={'xs'}>
                                {item.contactEmail}
                              </Td>
                              <Td pl={0} fontSize={'xs'}>
                                {timeSince(item.updatedAt)}
                              </Td>
                              <Td>
                                <Icon
                                  as={DeleteIcon}
                                  color={'red'}
                                  cursor={'pointer'}
                                  onClick={() => handleSupRemove(item.id)}
                                />
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    ) : (
                      <Text mt={4} color={'darkgrey'}>
                        No author found
                      </Text>
                    )}
                  </Flex>
                </Flex>
              </form>
            )}
          </DrawerBody>

          <DrawerFooter>
            <Flex
              width={'100%'}
              justifyContent={'space-between'}
              alignItems={'center'}
            >
              {checkId ? (
                <Button
                  fontSize={'sm'}
                  colorScheme='blue'
                  onClick={onSaveRule}
                  disabled={
                    authorList.length === 0 && creationTools.length === 0
                  }
                >
                  Save Rule
                </Button>
              ) : (
                <Text></Text>
              )}
              <Stack direction={'row'} spacing={2} alignItems={'center'}>
                <Button mr={3} onClick={onClose}>
                  Cancel
                </Button>
                <Button colorScheme='blue' onClick={handleSave}>
                  Save
                </Button>
              </Stack>
            </Flex>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default GeneralDataDrawer
