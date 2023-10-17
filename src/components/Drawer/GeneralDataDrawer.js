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
  Select,
  useToast,
  FormControl,
  FormErrorMessage
} from '@chakra-ui/react'
import {
  toolDelete,
  supplierCreate,
  supplierDelete,
  recheckHealth,
  authorCreate,
  toolCreate
} from 'graphQL/Mutation'
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
  refetch,
  checkId
}) => {
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

  const [existingTools, setExistingTools] = useState([])
  const [creationTools, setCreationTools] = useState([])
  const [existingAuthors, setExistingAuthors] = useState([])
  const [authorList, setAuthorList] = useState([])
  const [supplierList, setSupplierList] = useState([])
  const [licenseList, setLicenseList] = useState([])

  const [createTool] = useMutation(toolCreate)
  const [deleteTool] = useMutation(toolDelete)

  const [createAuthor] = useMutation(authorCreate)

  const [createSupplier] = useMutation(supplierCreate)
  const [deleteSupplier] = useMutation(supplierDelete)

  const [healthRecheck] = useMutation(recheckHealth, {
    onCompleted: () => {
      refetch({
        projectId: productId,
        sbomId: sbomId,
        first: 10,
        last: undefined,
        field: 'STATUS',
        direction: 'ASC'
      })
    }
  })

  useEffect(() => {
    if (data) {
      setExistingTools(data.tools)
      setSupplierList(data.suppliers)
      setExistingAuthors(data.authors)
    }
  }, [data])

  useEffect(() => {
    if (data) {
      const filterData = licenseOptions.find(
        (item) => item.licenseId === data.licenses[0]
      )
      // console.log(`filterData`, filterData)
      if (filterData) {
        setLicenseList(filterData)
      }
    }
  }, [data])

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
    return emailRegex.test(email)
  }

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
        updatedAt: new Date().toISOString()
      },
      ...prev
    ])
    setToolName('')
    setToolVersion('')
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
    if (checkId) {
      healthRecheck({
        variables: {
          checkId: checkId,
          sbomId: sbomId
        }
      })
    }

    if (creationTools.length > 0) {
      creationTools.map((item) => {
        createTool({
          variables: {
            name: item.name,
            version: item.version,
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

  return (
    <>
      <Drawer
        isOpen={isOpen}
        placement='right'
        onClose={onClose}
        finalFocusRef={btnRef}
        closeOnOverlayClick={false}
        size='md'
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{heading(selectedKey)}</DrawerHeader>
          <DrawerBody>
            {selectedKey === 'tools' && (
              <Flex direction={'column'} alignItems={'flex-start'} gap={3}>
                <FormControl>
                  <Input
                    placeholder='Tool Name*'
                    value={toolName}
                    onChange={(e) => setToolName(e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <Input
                    placeholder='Tool Version*'
                    value={toolVersion}
                    onChange={(e) => setToolVersion(e.target.value)}
                  />
                </FormControl>
                <Button
                  colorScheme='blue'
                  onClick={handleToolAdd}
                  disabled={!toolName || !toolVersion}
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
                          <Th pl={0}>Name</Th>
                          <Th pl={0}>Version</Th>
                          <Th pl={0}>Updated At</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {existingTools.length > 0 &&
                          existingTools.map((item, index) => (
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
                            </Tr>
                          ))}

                        {creationTools.length > 0 &&
                          creationTools.map((item, index) => (
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
                  <FormControl isRequired>
                    <Input
                      type='text'
                      placeholder='Author Name*'
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                    />
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
                      !authorName || !authorEmail || !validateEmail(authorEmail)
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
                                  {timeSince(item.updatedAt)}
                                </Td>
                              </Tr>
                            ))}

                          {authorList.length > 0 &&
                            authorList.map((item, index) => (
                              <Tr key={index}>
                                <Td pl={0} fontSize={'xs'}>
                                  {item.name}
                                  <br />
                                  {item.email}
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
            <Button mr={3} onClick={onClose}>
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
