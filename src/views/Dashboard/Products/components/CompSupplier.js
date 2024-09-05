import { gql, useMutation, useQuery } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { useContext, useEffect, useState } from 'react'
import { validateEmail, validateUrl } from 'utils'

import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input
} from '@chakra-ui/react'

import useCustomToast from 'hooks/useCustomToast'

import { addComSupplier, updateComSupplier } from 'graphQL/Mutation'

const GetSupplier = gql`
  query GetCompUrls($id: Uuid!, $sbomId: Uuid!) {
    component(id: $id, sbomId: $sbomId) {
      suppliers {
        id
        name
        url
        contactEmail
        contactName
      }
    }
  }
`

const CompSupplier = ({ data }) => {
  const { showToast } = useCustomToast()

  const { id, sbomId } = data || ''

  const { data: result } = useQuery(GetSupplier, {
    variables: { id, sbomId }
  })
  const { suppliers } = result?.component || ''

  const { tabData, setTabData, handleChange, saveChanges } =
    useContext(TabContext)
  const { supplier } = tabData

  const [isValidUrl, setIsValidUrl] = useState('')
  const [nameError, setNameError] = useState('')
  const [emailError, setEmailError] = useState('')

  const containsSpace = /\s/.test(supplier?.url)

  const onSupplierChange = (e) => {
    const { value } = e.target
    handleChange('supplier', 'contactName', value)
    if ((value.length > 0 && value.length < 4) || value.length > 256) {
      setNameError('Input must be between 4 and 256 characters')
    } else {
      setNameError('')
    }
  }

  const [createSupplier, { loading: createLoading }] =
    useMutation(addComSupplier)
  const [updateSupplier, { loading: updateLoading }] =
    useMutation(updateComSupplier)

  const handleSave = () => {
    createSupplier({
      variables: {
        componentId: id,
        url: supplier?.url,
        name: supplier?.name,
        contactName: supplier?.contactName,
        contactEmail: supplier?.contactEmail
      }
    }).then((res) => {
      if (res?.data) {
        saveChanges()
        showToast({
          description: 'Supplier added successfully',
          status: 'success'
        })
      }
    })
  }

  const handleUpdate = () => {
    if (suppliers?.length > 0) {
      updateSupplier({
        variables: {
          id: suppliers[0].id,
          url: supplier?.url,
          name: supplier?.name,
          contactName: supplier?.contactName,
          contactEmail: supplier?.contactEmail
        }
      }).then((res) => {
        if (res?.data) {
          saveChanges()
          showToast({
            description: 'Supplier updated successfully',
            status: 'success'
          })
        }
      })
    }
  }

  const handleCheckEmail = () => {
    if (!validateEmail(supplier?.contactEmail)) {
      setEmailError('Email is invalid')
    }
  }

  const handleCheckUrl = () => {
    if (!validateUrl(supplier?.url)) {
      setIsValidUrl('Please enter a valid URL')
    }
  }

  const onUrlChange = (e) => {
    handleChange('supplier', 'url', e.target.value)
    setIsValidUrl('')
  }

  const isInvalid =
    createLoading ||
    updateLoading ||
    supplier?.name === '' ||
    nameError !== '' ||
    (supplier?.contactEmail !== '' && !validateEmail(supplier?.contactEmail)) ||
    (supplier?.url !== '' && !validateUrl(supplier?.url))

  useEffect(() => {
    if (data && data?.suppliers?.length > 0) {
      const { suppliers } = data
      setTabData((prev) => ({
        ...prev,
        supplier: {
          name: suppliers[0].name || '',
          url: suppliers[0].url || '',
          contactName: suppliers[0].contactName || '',
          contactEmail: suppliers[0].contactEmail || ''
        }
      }))
    }
  }, [data, setTabData])

  return (
    <Flex width={'100%'} direction={'column'} gap={4} px={6} pb={20}>
      {/* ORG NAME */}
      <FormControl isRequired>
        <FormLabel fontSize={'sm'}>Organization Name</FormLabel>
        <Input
          fontSize={'sm'}
          value={supplier?.name}
          placeholder='Enter organization name'
          onChange={(e) => handleChange('supplier', 'name', e.target.value)}
        />
      </FormControl>
      {/* ORG URL */}
      <FormControl
        isInvalid={
          (supplier?.url !== '' && !validateUrl(supplier?.url)) || containsSpace
        }
      >
        <FormLabel fontSize={'sm'}>URL</FormLabel>
        <Input
          fontSize={'sm'}
          value={supplier?.url}
          placeholder='Enter URL'
          onBlur={handleCheckUrl}
          onChange={onUrlChange}
        />
        <FormErrorMessage>{isValidUrl}</FormErrorMessage>
      </FormControl>
      {/* SUPPLIER NAME */}
      <FormControl isInvalid={supplier?.contactName !== '' && nameError !== ''}>
        <FormLabel fontSize={'sm'}>Contact Name</FormLabel>
        <Input
          fontSize={'sm'}
          onChange={onSupplierChange}
          value={supplier.contactName}
          placeholder='Enter supplier name'
        />
        <FormErrorMessage>{nameError}</FormErrorMessage>
      </FormControl>
      {/* SUPPLIER EMAIL */}
      <FormControl
        isInvalid={
          supplier?.contactEmail !== '' &&
          !validateEmail(supplier?.contactEmail)
        }
      >
        <FormLabel fontSize={'sm'}>Contact Email</FormLabel>
        <Input
          fontSize={'sm'}
          onBlur={handleCheckEmail}
          value={supplier?.contactEmail}
          placeholder='Enter supplier email'
          onChange={(e) => {
            handleChange('supplier', 'contactEmail', e.target.value)
            setEmailError('')
          }}
        />
        <FormErrorMessage>{emailError}</FormErrorMessage>
      </FormControl>
      {/* ACTIONS */}
      <Button
        variant='outline'
        colorScheme='blue'
        width={'fit-content'}
        isDisabled={isInvalid}
        onClick={suppliers?.length > 0 ? handleUpdate : handleSave}
      >
        Save
      </Button>
    </Flex>
  )
}

export default CompSupplier
