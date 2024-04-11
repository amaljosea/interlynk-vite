import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import { validateEmail } from 'utils'
import { validateUrl } from 'utils'

import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text
} from '@chakra-ui/react'

import { useGlobalState } from 'hooks/useGlobalState'

import {
  OrganizationManufacturerCreate,
  OrganizationManufacturerUpdate
} from 'graphQL/Mutation'

import { FaPlus, FaTrash } from 'react-icons/fa6'

const LegalModal = ({ data, isOpen, onClose, refetch }) => {
  const { totalRows } = useGlobalState()
  const [orgName, setOrgName] = useState('')
  const [url, setUrl] = useState('')
  const [contacts, setContacts] = useState([
    {
      id: 1,
      name: '',
      email: '',
      phone: '',
      status: 'CREATED',
      emailError: '',
      phError: ''
    }
  ])
  const [deletedContacts, setDeletedContacts] = useState([])
  const [error, setError] = useState('')
  const [isValidUrl, setIsValidUrl] = useState('')

  const containsSpace = /\s/.test(url)
  const checkDataValidity = (data) => {
    for (let i = 0; i < data.length; i++) {
      const { name, email, phone, emailError, phError } = data[i]
      if (
        name === '' ||
        email === '' ||
        phone === '' ||
        emailError !== '' ||
        phError !== ''
      ) {
        return 'Error: Some properties are empty'
      }
    }
    return null
  }

  const errorMessage = checkDataValidity(contacts)

  const [createMfc] = useMutation(OrganizationManufacturerCreate)
  const [updateMfc] = useMutation(OrganizationManufacturerUpdate)

  // console.log('data', data)

  const handleCreate = async (e) => {
    e.preventDefault()
    await createMfc({
      variables: {
        orgName,
        url,
        contacts: contacts?.map((item) => ({
          name: item?.name,
          email: item?.email,
          phone: item?.phone
        }))
      }
    }).then((res) => {
      const errors = res?.data?.organizationManufacturerCreate?.errors
      if (errors?.length > 0) {
        setError(errors[0])
      } else {
        refetch({ first: totalRows })
        onClose()
      }
    })
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    const removedData = deletedContacts?.map((item) => ({
      id: item?.status === 'ADDED' ? item?.id : undefined,
      name: item?.name,
      email: item?.email,
      phone: item?.phone,
      _destroy: true
    }))
    const existingData = contacts?.map((item) => ({
      id: item?.status === 'ADDED' ? item?.id : undefined,
      name: item?.name,
      email: item?.email,
      phone: item?.phone,
      _destroy: false
    }))
    const mergedArray = []
    if (removedData && removedData.length > 0) {
      mergedArray.push(...removedData)
    }
    if (existingData && existingData.length > 0) {
      mergedArray.push(...existingData)
    }
    await updateMfc({
      variables: {
        id: data?.id,
        orgName,
        url,
        contacts: mergedArray
      }
    }).then((res) => {
      const errors = res?.data?.OrganizationManufacturerUpdate?.errors
      if (errors?.length > 0) {
        setError(errors[0])
      } else {
        refetch({ first: totalRows })
        onClose()
      }
    })
  }

  const hasSimilarRow = (data) => {
    for (let i = 0; i < data.length; i++) {
      for (let j = i + 1; j < data.length; j++) {
        if (
          data[i].name === data[j].name &&
          data[i].email === data[j].email &&
          data[i].phone === data[j].phone
        ) {
          return true // Similar row found
        }
      }
    }
    return false // No similar rows found
  }

  const addRow = () => {
    if (hasSimilarRow(contacts)) {
      setError(
        `A row with the empty or same values already exists. Please update or remove it before continue.`
      )
    } else {
      setError('')
      const newId = contacts?.length + 1
      setContacts([
        ...contacts,
        {
          id: newId,
          name: '',
          email: '',
          phone: '',
          status: 'CREATED',
          emailError: '',
          phError: ''
        }
      ])
    }
  }

  const deleteRow = (cn) => {
    setError('')
    if (cn?.status === 'ADDED') {
      setDeletedContacts((prev) => [...prev, cn])
    }
    const newData = contacts?.filter((item) => item.id !== cn?.id)
    setContacts(newData)
  }

  const handleChange = (value, id, field) => {
    setError('')
    const newData = contacts.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value }
      }
      return item
    })
    setContacts(newData)
  }

  const handleCheckUrl = () => {
    if (!validateUrl(url)) {
      setIsValidUrl('Please enter a valid URL')
    }
  }

  const onEmailBlur = (cn) => {
    const newData = contacts.map((item) => {
      if (item.id === cn?.id) {
        if (!validateEmail(cn.email)) {
          return { ...item, emailError: 'Please enter a valid email' }
        } else {
          return { ...item, emailError: '' }
        }
      }
      return item
    })
    setContacts(newData)
  }

  const onPhoneBlur = (cn) => {
    const newData = contacts.map((item) => {
      if (item.id === cn?.id) {
        const isValidPhoneNumber = /^\d{10}$/.test(cn.phone)
        if (!isValidPhoneNumber) {
          return { ...item, phError: 'Please enter a valid phone number' }
        } else {
          return { ...item, phError: '' }
        }
      }
      return item
    })
    setContacts(newData)
  }

  useEffect(() => {
    if (data) {
      setOrgName(data?.organizationName)
      setUrl(data?.url)
      if (data?.organizationContacts?.length > 0) {
        const result = data?.organizationContacts?.map((item) => ({
          id: item?.id,
          name: item?.name,
          phone: item?.phone,
          email: item?.email,
          status: 'ADDED',
          emailError: '',
          phError: ''
        }))
        console.log('result', result)
        setContacts(result)
      } else {
        setContacts([
          {
            id: 1,
            name: '',
            email: '',
            phone: '',
            status: 'CREATED',
            emailError: '',
            phError: ''
          }
        ])
      }
    }
  }, [data])

  return (
    <>
      <Modal
        size='4xl'
        isOpen={isOpen}
        onClose={onClose}
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <form onSubmit={data ? handleUpdate : handleCreate}>
          <ModalContent>
            <ModalHeader>{data ? 'Edit' : 'Add'} Manufacturer</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex width={'100%'} direction={'column'} gap={4}>
                <Grid
                  templateColumns={`repeat(2,1fr)`}
                  alignItems={'flex-start'}
                  gap={4}
                >
                  <GridItem>
                    <FormControl isRequired>
                      <FormLabel>Organization Name</FormLabel>
                      <Input
                        size='sm'
                        type='text'
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                      />
                    </FormControl>
                  </GridItem>
                  <GridItem>
                    <FormControl
                      isInvalid={
                        (url !== '' && !validateUrl(url)) || containsSpace
                      }
                    >
                      <FormLabel>URL</FormLabel>
                      <Input
                        size='sm'
                        type='text'
                        value={url}
                        onBlur={handleCheckUrl}
                        onChange={(e) => setUrl(e.target.value)}
                      />
                      <FormErrorMessage>{isValidUrl}</FormErrorMessage>
                    </FormControl>
                  </GridItem>
                </Grid>
                <Flex
                  width={'100%'}
                  my={2}
                  justifyContent={'space-between'}
                  alignItems={'center'}
                >
                  <Stack spacing={0} alignItems={'flex-start'}>
                    <Heading
                      fontWeight={'medium'}
                      fontFamily={'inherit'}
                      fontSize={'md'}
                    >
                      Contacts
                    </Heading>
                    <Text fontSize={'xs'}>Atleast 1 contact is required</Text>
                  </Stack>
                  <IconButton
                    size='sm'
                    colorScheme='blue'
                    icon={<FaPlus />}
                    // isDisabled={errorMessage}
                    onClick={addRow}
                  />
                </Flex>
                {contacts?.length > 0 &&
                  contacts?.map((item, index) => (
                    <Grid
                      key={index}
                      templateColumns={`repeat(3,1fr)`}
                      alignItems={'flex-start'}
                      gap={4}
                    >
                      <GridItem>
                        <FormControl>
                          <Input
                            size='sm'
                            type='text'
                            maxLength={50}
                            placeholder='Enter name'
                            value={item?.name}
                            onChange={(e) =>
                              handleChange(e.target.value, item.id, 'name')
                            }
                          />
                        </FormControl>
                      </GridItem>
                      <GridItem>
                        <FormControl isInvalid={item?.emailError !== ''}>
                          <Input
                            size='sm'
                            type='email'
                            placeholder='Enter email'
                            value={item?.email}
                            onBlur={() => onEmailBlur(item)}
                            onChange={(e) =>
                              handleChange(e.target.value, item.id, 'email')
                            }
                          />
                          <FormErrorMessage fontSize='xs'>
                            {item?.emailError}
                          </FormErrorMessage>
                        </FormControl>
                      </GridItem>
                      <GridItem as={Flex} gap={4} alignItems='flex-start'>
                        <FormControl isInvalid={item?.phError !== ''}>
                          <Input
                            size='sm'
                            type='text'
                            minLength={10}
                            maxLength={10}
                            placeholder='Enter phone number'
                            value={item?.phone}
                            onBlur={() => onPhoneBlur(item)}
                            onChange={(e) =>
                              handleChange(e.target.value, item.id, 'phone')
                            }
                          />
                          <FormErrorMessage fontSize='xs'>
                            {item?.phError}
                          </FormErrorMessage>
                        </FormControl>
                        <IconButton
                          size='sm'
                          colorScheme='red'
                          icon={<FaTrash />}
                          onClick={() => deleteRow(item)}
                        />
                      </GridItem>
                    </Grid>
                  ))}
                {error !== '' && (
                  <Alert status='error' borderRadius={4}>
                    <AlertIcon />
                    <AlertDescription fontSize={'sm'} pr={2}>
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
              </Flex>
            </ModalBody>
            <ModalFooter mt={4}>
              <Button colorScheme='gray' mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme='blue'
                type='submit'
                isDisabled={errorMessage || orgName === '' || isValidUrl !== ''}
              >
                {data ? 'Update' : 'Save'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </form>
      </Modal>
    </>
  )
}

export default LegalModal
