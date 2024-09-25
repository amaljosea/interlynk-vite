import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import { validateEmail } from 'utils'

import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Icon,
  IconButton,
  Input,
  Stack,
  useColorModeValue
} from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'

import {
  OrganizationManufacturerCreate,
  OrganizationManufacturerUpdate
} from 'graphQL/Mutation'

import { BsGear } from 'react-icons/bs'
import { FaPlus } from 'react-icons/fa6'
import { MdDeleteOutline } from 'react-icons/md'

const validateUrl = (url) => {
  const urlRegex =
    /^https?:\/\/(?:www\.)?([a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,})(\/[^?#]*\/?)?(?:\?[^#]*)?(?:#.*)?$/
  return urlRegex.test(url)
}

const LegalModal = ({ data, isOpen, onClose }) => {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [orgName, setOrgName] = useState('')
  const [contacts, setContacts] = useState([])
  const [isValidUrl, setIsValidUrl] = useState('')
  const [deletedContacts, setDeletedContacts] = useState([])

  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const [createMfc, { loading: crLoading }] = useMutation(
    OrganizationManufacturerCreate
  )
  const [updateMfc, { loading: upLoading }] = useMutation(
    OrganizationManufacturerUpdate
  )

  const containsSpace = /\s/.test(url)
  const checkDataValidity = (data) => {
    for (let i = 0; i < data.length; i++) {
      const { email, phone, emailError, phError } = data[i]
      if (
        (email !== '' && emailError !== '') ||
        (phone !== '' && phError !== '')
      ) {
        return 'Error: Some properties are empty'
      }
    }
    return null
  }

  const errorMessage = checkDataValidity(contacts) || crLoading || upLoading

  const checkEmptyValues = (data) => {
    for (let i = 0; i < data.length; i++) {
      const { name, email, phone } = data[i]
      if (name === '' && email === '' && phone === '') {
        return 'Error: Some properties are empty'
      }
    }
    return null
  }

  const emptyRow = checkEmptyValues(contacts)

  const handleCreate = () => {
    if (url !== '' && !validateUrl(url)) {
      setIsValidUrl('Please enter a valid URL including http:// or https://')
    } else {
      createMfc({
        variables: {
          orgName,
          url,
          contacts:
            contacts?.length > 0 && emptyRow
              ? undefined
              : contacts?.map((item) => ({
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
          onClose()
        }
      })
    }
  }

  const handleUpdate = () => {
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
    if (url !== '' && !validateUrl(url)) {
      setIsValidUrl('Please enter a valid URL')
    } else {
      updateMfc({
        variables: {
          id: data?.id,
          orgName,
          url,
          contacts: mergedArray
        }
      }).then((res) => {
        const errors = res?.data?.organizationManufacturerUpdate?.errors
        if (errors?.length > 0) {
          setError(errors[0])
        } else {
          onClose()
        }
      })
    }
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

  const onChangeUrl = (e) => {
    setUrl(e.target.value)
    setIsValidUrl('')
    setError('')
  }

  const onEmailBlur = (e, cn) => {
    e.preventDefault()
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

  const onPhoneBlur = (e, cn) => {
    e.preventDefault()
    const newData = contacts.map((item) => {
      if (item.id === cn?.id) {
        const isValidPhoneNumber =
          /^(\+\d{1,3}\s?)?(\(\d{1,4}\)|\d{1,4})[-\s]?\d{1,4}[-\s]?\d{1,4}$/.test(
            cn.phone
          )
        if (cn?.phone !== '' && !isValidPhoneNumber) {
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
        setContacts(result)
      }
    }
  }, [data])

  return (
    <LynkModal
      Icon={BsGear}
      isOpen={isOpen}
      onClose={onClose}
      buttonText={data ? 'Update' : 'Save'}
      onSubmit={data ? handleUpdate : handleCreate}
      title={`${data ? 'Edit' : 'Add'} Manufacturer`}
      disabled={errorMessage || (url !== '' && isValidUrl !== '')}
    >
      <Flex width={'100%'} direction={'column'} gap={4}>
        <FormControl isRequired>
          <FormLabel fontSize={12}>Organization Name</FormLabel>
          <Input
            type='text'
            value={orgName}
            onChange={(e) => {
              setOrgName(e.target.value)
              setError('')
            }}
            placeholder='Add organization name'
          />
        </FormControl>
        <FormControl isInvalid={isValidUrl !== '' || containsSpace}>
          <FormLabel fontSize={12}>URL</FormLabel>
          <Input
            type='text'
            value={url}
            onChange={onChangeUrl}
            placeholder='Add URL'
            fontSize={14}
          />
          <FormErrorMessage>{isValidUrl}</FormErrorMessage>
        </FormControl>
        <Flex direction='column' gap={2}>
          <Flex
            width={'100%'}
            my={2}
            justifyContent={'space-between'}
            alignItems={'center'}
          >
            <Stack spacing={0} alignItems={'flex-start'}>
              <Heading fontWeight={500} fontFamily={'inherit'} fontSize={12}>
                Contacts
              </Heading>
            </Stack>
          </Flex>
          {contacts?.length > 0 &&
            contacts?.map((item, index) => (
              <Flex key={index} alignItems={'flex-start'} gap={2}>
                <FormControl>
                  <Input
                    type='text'
                    maxLength={50}
                    placeholder='Name'
                    value={item?.name}
                    onChange={(e) =>
                      handleChange(e.target.value, item.id, 'name')
                    }
                    fontSize={12}
                  />
                </FormControl>
                <FormControl
                  isInvalid={item?.email !== '' && item?.emailError !== ''}
                >
                  <Input
                    type='email'
                    placeholder='Email'
                    value={item?.email}
                    onBlur={(e) => onEmailBlur(e, item)}
                    onChange={(e) =>
                      handleChange(e.target.value, item.id, 'email')
                    }
                    fontSize={12}
                  />
                  {item?.email !== '' && item?.emailError !== '' && (
                    <FormErrorMessage fontSize='xs'>
                      {item?.emailError}
                    </FormErrorMessage>
                  )}
                </FormControl>
                <FormControl
                  isInvalid={item?.phone !== '' && item?.phError !== ''}
                >
                  <Input
                    type='text'
                    placeholder='Phone number'
                    value={item?.phone}
                    onBlur={(e) => onPhoneBlur(e, item)}
                    onChange={(e) =>
                      handleChange(e.target.value, item.id, 'phone')
                    }
                    fontSize={12}
                  />
                  {item?.phone !== '' && item?.phError !== '' && (
                    <FormErrorMessage fontSize='xs'>
                      {item?.phError}
                    </FormErrorMessage>
                  )}
                </FormControl>
                <IconButton
                  border='1px solid'
                  colorScheme='white'
                  borderColor={borderColor}
                  aria-label='Remove config'
                  onClick={() => deleteRow(item)}
                  icon={
                    <Icon color={'#E53E3E'} w={6} h={6} as={MdDeleteOutline} />
                  }
                />
              </Flex>
            ))}
        </Flex>
      </Flex>
      <Button
        my={3}
        aria-label='Add config'
        onClick={addRow}
        colorScheme='blue'
        leftIcon={<FaPlus />}
        fontWeight={'medium'}
        paddingLeft={'2px'}
        fontSize={'sm'}
        variant='link'
      >
        Add New
      </Button>
      {error !== '' && <LynkAlert msg={error} />}
    </LynkModal>
  )
}

export default LegalModal
