import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import { validateEmail, validateUrl } from 'utils'

import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input
} from '@chakra-ui/react'

import ActionWrapper from 'components/Misc/ActionWrapper'

import { addComSupplier, updateComSupplier } from 'graphQL/Mutation'

const CompSupplier = ({ data, onClose, refetch }) => {
  const { id, suppliers } = data || ''

  const [orgName, setOrgName] = useState('')
  const [orgUrl, setOrgUrl] = useState('')
  const [isValidUrl, setIsValidUrl] = useState('')
  const [supName, setSupName] = useState('')
  const [nameError, setNameError] = useState('')
  const [supEmail, setSupEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [isDisabled, setIsDisabled] = useState(false)

  const disableButtonTemporarily = () => {
    setIsDisabled(true)
    setTimeout(() => {
      setIsDisabled(false)
    }, 3000)
  }

  const containsSpace = /\s/.test(orgUrl)

  const onSupplierChange = (e) => {
    const { value } = e.target
    setSupName(value)
    if ((value.length > 0 && value.length < 4) || value.length > 256) {
      setNameError('Input must be between 4 and 256 characters')
    } else {
      setNameError('')
    }
  }

  const [createSupplier] = useMutation(addComSupplier, {
    onCompleted: (data) => data && refetch()
  })
  const [updateSupplier] = useMutation(updateComSupplier, {
    onCompleted: (data) => data && refetch()
  })

  const handleSave = () => {
    disableButtonTemporarily()
    createSupplier({
      variables: {
        name: orgName,
        url: orgUrl,
        contactName: supName,
        contactEmail: supEmail,
        componentId: id
      }
    }).then((res) => res?.data && onClose())
  }

  const handleUpdate = () => {
    disableButtonTemporarily()
    if (suppliers?.length > 0) {
      updateSupplier({
        variables: {
          name: orgName,
          url: orgUrl,
          contactName: supName,
          contactEmail: supEmail,
          id: suppliers[0].id
        }
      }).then((res) => res.data && onClose())
    }
  }

  const handleCheckEmail = () => {
    if (!validateEmail(supEmail)) {
      setEmailError('Email is invalid')
    }
  }

  const handleCheckUrl = () => {
    if (!validateUrl(orgUrl)) {
      setIsValidUrl('Please enter a valid URL')
    }
  }

  const onUrlChange = (e) => {
    const { value } = e.target
    setOrgUrl(value)
    setIsValidUrl('')
  }

  const isInvalid =
    isDisabled ||
    orgName === '' ||
    nameError !== '' ||
    (supEmail !== '' && !validateEmail(supEmail)) ||
    (orgUrl !== '' && !validateUrl(orgUrl))

  useEffect(() => {
    if (data && data?.suppliers?.length > 0) {
      const { suppliers } = data
      setOrgName(suppliers[0].name || '')
      setOrgUrl(suppliers[0].url || '')
      setSupName(suppliers[0].contactName || '')
      setSupEmail(suppliers[0].contactEmail || '')
    }
  }, [data])

  return (
    <Flex width={'100%'} direction={'column'} gap={4} px={6} pb={20}>
      {/* ORG NAME */}
      <FormControl isRequired>
        <FormLabel fontSize={'sm'}>Organization Name</FormLabel>
        <Input
          fontSize={'sm'}
          value={orgName}
          placeholder='Enter organization name'
          onChange={(e) => setOrgName(e.target.value)}
        />
      </FormControl>
      {/* ORG URL */}
      <FormControl
        isInvalid={(orgUrl !== '' && !validateUrl(orgUrl)) || containsSpace}
      >
        <FormLabel fontSize={'sm'}>URL</FormLabel>
        <Input
          value={orgUrl}
          fontSize={'sm'}
          placeholder='Enter URL'
          onBlur={handleCheckUrl}
          onChange={onUrlChange}
        />
        <FormErrorMessage>{isValidUrl}</FormErrorMessage>
      </FormControl>
      {/* SUPPLIER NAME */}
      <FormControl isInvalid={supName !== '' && nameError !== ''}>
        <FormLabel fontSize={'sm'}>Contact Name</FormLabel>
        <Input
          fontSize={'sm'}
          placeholder='Enter supplier name'
          value={supName}
          onChange={onSupplierChange}
        />
        <FormErrorMessage>{nameError}</FormErrorMessage>
      </FormControl>
      {/* SUPPLIER EMAIL */}
      <FormControl isInvalid={supEmail !== '' && !validateEmail(supEmail)}>
        <FormLabel fontSize={'sm'}>Contact Email</FormLabel>
        <Input
          fontSize={'sm'}
          value={supEmail}
          onBlur={handleCheckEmail}
          placeholder='Enter supplier email'
          onChange={(e) => {
            setSupEmail(e.target.value)
            setEmailError('')
          }}
        />
        <FormErrorMessage>{emailError}</FormErrorMessage>
      </FormControl>
      {/* ACTIONS */}
      <ActionWrapper>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          colorScheme='blue'
          width={'fit-content'}
          isDisabled={isInvalid}
          onClick={suppliers?.length > 0 ? handleUpdate : handleSave}
        >
          Save
        </Button>
      </ActionWrapper>
    </Flex>
  )
}

export default CompSupplier
