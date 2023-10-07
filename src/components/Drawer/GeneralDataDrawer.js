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
  FormControl,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Table,
  Icon,
  Select,
  useToast
} from '@chakra-ui/react'
import { toolDelete } from 'graphQL/Mutation'
import { authorUpdate } from 'graphQL/Mutation'
import { supplierCreate } from 'graphQL/Mutation'
import { supplierDelete } from 'graphQL/Mutation'
import { supplierUpdate } from 'graphQL/Mutation'
import { authorDelete } from 'graphQL/Mutation'
import { authorCreate } from 'graphQL/Mutation'
import { toolUpdate } from 'graphQL/Mutation'
import { toolCreate } from 'graphQL/Mutation'
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { timeSince } from 'utils'
import { licenseOptions } from 'variables/licenses'

const GeneralDataDrawer = ({
  isOpen,
  onClose,
  btnRef,
  data,
  selectedKey,
  refetch
}) => {
  const { cpes, purl, tools, authors, licenses, suppliers } = data

  // console.log(`suppliers`, suppliers)

  const toast = useToast()

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('p')
  const sbomId = queryParams.get('sbom')

  const [toolName, setToolName] = useState('')
  const [toolVersion, setToolVersion] = useState('')

  const [authorName, setAuthorName] = useState('')
  const [authorEmail, setAuthorEmail] = useState('')

  const [supName, setSupName] = useState('')
  const [supEmail, setSupEmail] = useState('')

  const [licenseName, setLicenseName] = useState('')
  const [selectedLicense, setSelectedLicense] = useState('')

  const [creationTools, setCreationTools] = useState([])
  const [authorList, setAuthorList] = useState([])
  const [supplierList, setSupplierList] = useState([])
  const [licenseList, setLicenseList] = useState([])

  const [createTool] = useMutation(toolCreate)
  const [deleteTool] = useMutation(toolDelete)

  const [createAuthor] = useMutation(authorCreate)
  const [deleteAuthor] = useMutation(authorDelete)

  const [createSupplier] = useMutation(supplierCreate)
  const [deleteSupplier] = useMutation(supplierDelete)

  useEffect(() => {
    setCreationTools(tools)
    setSupplierList(suppliers)
    setAuthorList(authors)
  }, [data])

  useEffect(() => {
    const filterData = licenseOptions.find(
      (item) => item.licenseId === licenses[0]
    )
    // console.log(`filterData`, filterData)
    if (filterData) {
      setLicenseList(filterData)
    }
  }, [licenses])

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
    return emailRegex.test(email)
  }

  const handleAuthorAdd = async (e) => {
    e.preventDefault()
    if (validateEmail(authorEmail) === true) {
      await createAuthor({
        variables: {
          name: authorName,
          email: authorEmail,
          sbomId: sbomId
        }
      }).then((res) => {
        if (res) {
          console.log(`res`, res.data.authorCreate.author)
          setAuthorList((prev) => [res.data.authorCreate.author, ...prev])
          setAuthorName('')
          setAuthorEmail('')
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

  const handleAuthorRemove = async (id) => {
    try {
      await deleteAuthor({
        variables: {
          authorId: id,
          sbomId: sbomId
        }
      }).then(() => {
        const updatedList = authorList.filter((item) => item.id !== id)
        console.log(`updatedList`, updatedList)
        setAuthorList(updatedList)
      })
    } catch (error) {
      console.log(`Mutation error`, error)
    }
  }

  const handleSupAdd = async (e) => {
    e.preventDefault()
    if (validateEmail(supEmail) === true) {
      await createSupplier({
        variables: {
          name: supName,
          email: supEmail,
          sbomId: sbomId
        }
      }).then((res) => {
        if (res) {
          setSupplierList((prev) => [res.data.supplierCreate.supplier, ...prev])
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

  // console.log(`supplierList`, supplierList)

  const handleToolAdd = async () => {
    if (toolName && toolVersion) {
      await createTool({
        variables: {
          name: toolName,
          version: toolVersion,
          sbomId: sbomId
        }
      })
        .then((res) => {
          if (res) {
            setCreationTools((prev) => [res.data.toolCreate.tool, ...prev])
            setToolName('')
            setToolVersion('')
          }
        })
        .catch((error) => console.log(error))
    } else {
      alert(`Tool Name and Tool Version are required`)
    }
  }

  const handleToolRemove = async (id) => {
    try {
      await deleteTool({
        variables: {
          toolId: id,
          sbomId: sbomId
        }
      }).then((res) => {
        const updatedList = tools.filter((item) => item.id !== id)
        setCreationTools(updatedList)
      })
    } catch (error) {
      console.log(`Mutation error`, error)
    }
  }

  const onLicenselAdd = () => {
    if (licenseName !== '' || selectedLicense !== '') {
      setLicenseList((prev) => [
        {
          name:
            selectedLicense && selectedLicense !== 'Custom'
              ? selectedLicense
              : licenseName
        },
        ...prev
      ])
      setLicenseName('')
      setSelectedLicense('')
    } else {
      toast({
        description: 'Please fill up required fields',
        status: 'warning',
        position: 'top-right',
        duration: 2000
      })
    }
  }

  const onLicenselRemove = (ls) => {
    const updatedList = licenseList.filter((item) => item.name !== ls.name)
    setLicenseList(updatedList)
  }

  const handleSave = () => {
    refetch({
      productId: productId,
      sbomId: sbomId
    })
    onClose()
  }

  const heading = (name) => {
    switch (name) {
      case 'tools':
        return 'Creation Tool(s)'
      case 'author':
        return 'Author(s)'
      case 'supplier':
        return 'Supplier(s)'
      case 'license':
        return 'License'
      case 'identifier':
        return 'Identifier(s)'
    }
  }

  return (
    <>
      <Drawer
        isOpen={isOpen}
        placement='right'
        onClose={onClose}
        finalFocusRef={btnRef}
        size='md'
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{heading(selectedKey)}</DrawerHeader>
          <DrawerBody>
            {selectedKey === 'tools' && (
              <Flex direction={'column'} alignItems={'flex-start'} gap={3}>
                <Input
                  placeholder='Tool Name*'
                  value={toolName}
                  onChange={(e) => setToolName(e.target.value)}
                />

                <Input
                  placeholder='Tool Version*'
                  value={toolVersion}
                  onChange={(e) => setToolVersion(e.target.value)}
                />
                <Button colorScheme='blue' onClick={handleToolAdd}>
                  Add
                </Button>

                <Flex width={'100%'} flexDir={'column'}>
                  <Text size='md' my={2}>
                    Tool History
                  </Text>
                  {creationTools.length > 0 ? (
                    <Table variant='simple' size='sm' mt={4}>
                      <Thead>
                        <Tr my='.8rem'>
                          <Th pl={0}>Name</Th>
                          <Th pl={0}>Version</Th>
                          <Th pl={0}>Updated At</Th>
                          <Th pl={0}></Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {creationTools.map((item, index) => (
                          <Tr key={index}>
                            <Td pl={0} fontSize={'xs'}>
                              {item.name}
                            </Td>
                            <Td pl={0} fontSize={'xs'}>
                              {item.version}
                            </Td>
                            <Td pl={0} fontSize={'xs'}>
                              {timeSince(item.updatedAt)}
                            </Td>
                            <Td>
                              <Icon
                                as={DeleteIcon}
                                color={'red'}
                                cursor={'pointer'}
                                onClick={() => handleToolRemove(item.id)}
                              />
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  ) : (
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
                  <FormControl isRequired>
                    <Input
                      type='text'
                      placeholder='Author Name*'
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <Input
                      type='email'
                      placeholder='Author Email*'
                      value={authorEmail}
                      onChange={(e) => setAuthorEmail(e.target.value)}
                    />
                  </FormControl>

                  <Button colorScheme='blue' type='submit'>
                    Add
                  </Button>

                  <Flex width={'100%'} flexDir={'column'}>
                    <Text size='md' my={2}>
                      Author History
                    </Text>
                    {authorList.length > 0 ? (
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
                          {authorList.map((item, index) => (
                            <Tr key={index}>
                              <Td pl={0} fontSize={'xs'}>
                                {item.name}
                              </Td>
                              <Td pl={0} fontSize={'xs'}>
                                {item.email}
                              </Td>
                              <Td pl={0} fontSize={'xs'}>
                                {timeSince(item.updatedAt)}
                              </Td>
                              <Td>
                                <Icon
                                  as={DeleteIcon}
                                  color={'red'}
                                  cursor={'pointer'}
                                  onClick={() => handleAuthorRemove(item.id)}
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
                  <FormControl isRequired>
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
                                {item.email}
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

            {selectedKey === 'license' && (
              <Flex direction={'column'} alignItems={'flex-start'} gap={3}>
                <FormControl>
                  <Select
                    isDisabled={licenseName !== ''}
                    name='license'
                    id='license'
                    value={selectedLicense}
                    onChange={(e) => setSelectedLicense(e.target.value)}
                  >
                    {licenseOptions.map((item) => (
                      <option key={item.licenseId} value={item.licenseId}>
                        {item.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                {selectedLicense === 'Custom' && (
                  <FormControl>
                    <Input
                      placeholder='Enter a valid SPDX license'
                      value={licenseName}
                      onChange={(e) => setLicenseName(e.target.value)}
                    />
                  </FormControl>
                )}
                <Button colorScheme='blue' onClick={onLicenselAdd}>
                  Add
                </Button>

                <Flex width={'100%'} flexDir={'column'}>
                  <Text size='md' my={2}>
                    License History
                  </Text>
                  {licenseList.length > 0 ? (
                    <Table variant='simple' size='sm' mt={4}>
                      <Thead>
                        <Tr my='.8rem'>
                          <Th pl={0}>Name</Th>
                          <Th pl={0}></Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {licenseList.map((item, index) => (
                          <Tr key={index}>
                            <Td pl={0} fontSize={'sm'}>
                              {item.name}
                            </Td>
                            <Td>
                              <Icon
                                as={DeleteIcon}
                                color={'red'}
                                cursor={'pointer'}
                                onClick={() => onLicenselRemove(item)}
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
            )}
          </DrawerBody>

          <DrawerFooter>
            <Button variant='outline' mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme='blue' onClick={handleSave}>
              Save
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default GeneralDataDrawer
