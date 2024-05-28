import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getFullDateAndTime, timeSince, validateEmail } from 'utils'

import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useToast
} from '@chakra-ui/react'

import {
  AutomationRuleCreate,
  authorCreate,
  recheckHealth,
  toolCreate
} from 'graphQL/Mutation'

const GeneralDataDrawer = ({
  isOpen,
  onClose,
  data,
  selectedKey,
  refetch,
  activeRow
}) => {
  const navigate = useNavigate()
  const toast = useToast()
  const params = useParams()
  const sbomId = params.sbomid
  const productId = params.productid

  const { status, sbom } = activeRow || ''
  const { friendlyId, shortDesc } = activeRow?.organizationRule?.rule || ''

  const [toolName, setToolName] = useState('')
  const [toolVersion, setToolVersion] = useState('')
  const [toolVendor, setToolVendor] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [authorEmail, setAuthorEmail] = useState('')
  const [existingTools, setExistingTools] = useState([])
  const [creationTools, setCreationTools] = useState([])
  const [existingAuthors, setExistingAuthors] = useState([])
  const [authorList, setAuthorList] = useState([])
  const [authorError, setAuthorError] = useState('')
  const [error, setError] = useState('')

  const toolsNotAdded =
    selectedKey === 'tools' &&
    (toolVendor !== '' || toolName !== '' || toolVersion !== '')
  const authorNotAdded =
    selectedKey === 'author' && (authorName !== '' || authorEmail !== '')

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
  const [createAuthor] = useMutation(authorCreate)
  const [healthRecheck] = useMutation(recheckHealth)
  const [createRule] = useMutation(AutomationRuleCreate)

  useEffect(() => {
    if (data) {
      setExistingTools(data.tools ? data.tools : [])
      setExistingAuthors(data.authors ? data.authors : [])
    }
  }, [data])

  useEffect(() => {
    if (status === 'resolved' && sbom?.authors?.length > 0) {
      setExistingAuthors(sbom?.authors || [])
    }
  }, [sbom, status])

  const handleAuthorAdd = async (e) => {
    e.preventDefault()
    setError('')
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

  const handleToolAdd = async () => {
    setError('')
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
    if (toolsNotAdded) {
      setError('Please add tools before save')
    } else if (authorNotAdded) {
      setError('Please add author before save')
    } else {
      setError('')

      if (creationTools.length > 0) {
        creationTools.map((item) => {
          createTool({
            variables: {
              name: item.name,
              version: item.version,
              vendor: item.vendor,
              sbomID: sbomId
            }
          }).then((res) => res?.data && refetch())
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
          }).then((res) => res?.data && refetch())
        })
      }

      if (friendlyId && (creationTools.length > 0 || authorList.length > 0)) {
        healthRecheck({
          variables: {
            checkId: friendlyId,
            sbomId: sbomId
          }
        }).then((res) => res?.data && refetch())
      }

      if (friendlyId && (creationTools.length > 0 || authorList.length > 0)) {
        healthRecheck({
          variables: {
            checkId: friendlyId,
            sbomId: sbomId
          }
        }).then((res) => res?.data && refetch())
      }

      onClose()
    }
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

  const conditionsAttributes = [
    {
      subject: 'version',
      operator: 'not_exists',
      field: 'version_author_name',
      value: undefined
    },
    {
      subject: 'version',
      operator: 'not_exists',
      field: 'version_author_email',
      value: undefined
    }
  ]

  const actionsAttributes = authorList?.length > 0 && [
    {
      subject: 'version',
      field: 'version_author_name',
      value: authorList[0].name
    },
    {
      subject: 'version',
      field: 'version_author_email',
      value: authorList[0].email
    }
  ]

  const handleRuleCreate = async () => {
    if (status === 'resolved') {
      localStorage.setItem('activeProdTab', 2)
      navigate(`/vendor/products/${params.productgroupid}/env/${productId}`)
    } else {
      await createRule({
        variables: {
          name: shortDesc,
          active: true,
          projectId: productId,
          automationConditionsAttributes: conditionsAttributes,
          automationActionsAttributes: actionsAttributes
        }
      }).then((res) => {
        const errors = res?.data?.automationRuleCreate?.errors
        if (errors?.length > 0) {
          console.log(errors[0])
        } else {
          toast({
            description: 'Rule added successfully',
            duration: 3000,
            status: 'success',
            position: 'top'
          })
          onClose()
        }
      })
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
                {error !== '' && (
                  <Alert status='error' borderRadius={4}>
                    <AlertIcon />
                    <AlertDescription fontSize={'sm'} pr={2}>
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
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
                  {error !== '' && (
                    <Alert status='error' borderRadius={4}>
                      <AlertIcon />
                      <AlertDescription fontSize={'sm'} pr={2}>
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}
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
          </DrawerBody>

          <DrawerFooter>
            <Flex
              gap={2}
              width={'100%'}
              justifyContent={'flex-end'}
              alignItems={'center'}
            >
              <Button
                hidden={friendlyId ? false : true}
                fontSize={'sm'}
                colorScheme='blue'
                mr={'auto'}
                onClick={handleRuleCreate}
              >
                {status === 'resolved' ? 'View Rule' : 'Save as Rule'}
              </Button>
              <Button onClick={onClose}>Cancel</Button>
              <Button
                colorScheme='blue'
                onClick={handleSave}
                hidden={status === 'resolved'}
              >
                Save
              </Button>
            </Flex>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default GeneralDataDrawer
