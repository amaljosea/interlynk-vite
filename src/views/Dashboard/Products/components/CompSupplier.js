import { gql, useMutation, useQuery } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { useContext, useEffect, useState } from 'react'
import { disableButtonTemporarily } from 'utils'
import {
  hasWhiteSpace,
  validateEmail,
  validateUrl
} from 'utils/formValidationUtils'

import {
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input
} from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'

import useCustomToast from 'hooks/useCustomToast'
import { useThemeColor } from 'hooks/useThemeColors'

import { addComSupplier, updateComSupplier } from 'graphQL/Mutation'
import { deleteComSupplier } from 'graphQL/Mutation'

import ActionButton from './ActionButton'

const GetSupplier = gql`
  query GetSupplier($id: Uuid!, $sbomId: Uuid!) {
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
  const { secondaryTextInverse } = useThemeColor(['secondaryTextInverse'])
  const { id, sbomId } = data || {}

  const {
    tabData,
    setTabData,
    handleChange,
    saveChanges,
    unsavedChanges,
    alert,
    setAlert,
    tab,
    alertMessageSetter,
    alertMessage
  } = useContext(TabContext)
  const { suppliers: tabSuppiers } = tabData

  const [isValidUrl, setIsValidUrl] = useState('')
  const [nameError, setNameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [isDisabled, setIsDisabled] = useState(false)

  const { data: result } = useQuery(GetSupplier, {
    skip: tab === 'suppliers' ? false : true,
    variables: { id, sbomId }
  })
  const { suppliers } = result?.component || ''

  const containsSpace = hasWhiteSpace(tabSuppiers?.url)

  const onSupplierChange = (e) => {
    const { value } = e.target
    handleChange('suppliers', 'contactName', value)
    if ((value.length > 0 && value.length < 4) || value.length > 256) {
      setNameError('Input must be between 4 and 256 characters')
    } else {
      setNameError('')
    }
  }

  const [createSupplier] = useMutation(addComSupplier, {
    refetchQueries: ['GetComponentColumnData','GetSupplier']
  })
  const [updateSupplier] = useMutation(updateComSupplier, {
    refetchQueries: ['GetComponentColumnData','GetSupplier']
  })
  const [deleteSupplier] = useMutation(deleteComSupplier, {
    refetchQueries: ['GetComponentColumnData','GetSupplier']
  })

  const handleRemove = () => {
    disableButtonTemporarily(setIsDisabled, 4000)
    deleteSupplier({ variables: { id: suppliers[0]?.id } }).then((res) => {
      if (res?.data) {
        saveChanges('suppliers')
        setTabData((prev) => ({
          ...prev,
          suppliers: {
            name: '',
            url: '',
            contactName: '',
            contactEmail: ''
          }
        }))
        showToast({
          description: 'Supplier removed successfully',
          status: 'success'
        })
      }
    })
  }

  const handleSave = () => {
    disableButtonTemporarily(setIsDisabled)
    createSupplier({
      variables: {
        componentId: id,
        url: tabSuppiers?.url,
        name: tabSuppiers?.name,
        contactName: tabSuppiers?.contactName,
        contactEmail: tabSuppiers?.contactEmail
      }
    }).then((res) => {
      if (res?.data) {
        saveChanges('suppliers')
        showToast({
          description: 'Supplier added successfully',
          status: 'success'
        })
      }
    })
  }

  const handleUpdate = () => {
    updateSupplier({
      variables: {
        id: suppliers[0].id,
        url: tabSuppiers?.url,
        name: tabSuppiers?.name,
        contactName: tabSuppiers?.contactName,
        contactEmail: tabSuppiers?.contactEmail
      }
    }).then((res) => {
      if (res?.data) {
        saveChanges('suppliers')
        showToast({
          description: 'Supplier updated successfully',
          status: 'success'
        })
      }
    })
  }

  const checkData = () => {
    // eslint-disable-next-line no-unused-vars
    const { suppliers, ...rest } = unsavedChanges
    alertMessageSetter(rest)
    return Object.values(rest).some((value) => value === true)
  }

  const handleSubmit = () => {
    suppliers?.length > 0 ? handleUpdate() : handleSave()
    if (checkData()) {
      setAlert(true)
    }
  }

  const handleCheckEmail = () => {
    if (!validateEmail(tabSuppiers?.contactEmail)) {
      setEmailError('Email is invalid')
    }
  }

  const handleCheckUrl = () => {
    if (!validateUrl(tabSuppiers?.url)) {
      setIsValidUrl('Please enter a valid URL')
    }
  }

  const onUrlChange = (e) => {
    handleChange('suppliers', 'url', e.target.value)
    setIsValidUrl('')
  }

  const isInvalid =
    isDisabled ||
    tabSuppiers?.name === '' ||
    nameError !== '' ||
    (tabSuppiers?.contactEmail !== '' &&
      !validateEmail(tabSuppiers?.contactEmail)) ||
    (tabSuppiers?.url !== '' && !validateUrl(tabSuppiers?.url))

  useEffect(() => {
    if (data && data?.suppliers?.length > 0) {
      const { suppliers } = data
      setTabData((prev) => ({
        ...prev,
        suppliers: {
          name: suppliers[0].name || '',
          url: suppliers[0].url || '',
          contactName: suppliers[0].contactName || '',
          contactEmail: suppliers[0].contactEmail || ''
        }
      }))
    }
  }, [data, setTabData])

  return (
    <Flex width={'100%'} direction={'column'} gap={4} pb={20}>
      {alert && <LynkAlert status='warning' msg={alertMessage} />}
      {/* ORG NAME */}
      <FormControl isRequired>
        <FormLabel>Organization Name</FormLabel>
        <Input
          fontSize={'sm'}
          value={tabSuppiers?.name}
          placeholder='Enter organization name'
          onChange={(e) => handleChange('suppliers', 'name', e.target.value)}
        />
      </FormControl>
      {/* ORG URL */}
      <FormControl
        isInvalid={
          (tabSuppiers?.url !== '' && !validateUrl(tabSuppiers?.url)) ||
          containsSpace
        }
      >
        <FormLabel>URL</FormLabel>
        <Input
          fontSize={'sm'}
          value={tabSuppiers?.url}
          placeholder='Enter URL'
          onBlur={handleCheckUrl}
          onChange={onUrlChange}
        />
        <FormErrorMessage>{isValidUrl}</FormErrorMessage>
      </FormControl>
      {/* SUPPLIER NAME */}
      <FormControl
        isInvalid={tabSuppiers?.contactName !== '' && nameError !== ''}
      >
        <FormLabel>Contact Name</FormLabel>
        <Input
          fontSize={'sm'}
          onChange={onSupplierChange}
          value={tabSuppiers?.contactName}
          placeholder='Enter supplier name'
        />
        <FormErrorMessage>{nameError}</FormErrorMessage>
      </FormControl>
      {/* SUPPLIER EMAIL */}
      <FormControl
        isInvalid={
          tabSuppiers?.contactEmail !== '' &&
          !validateEmail(tabSuppiers?.contactEmail)
        }
      >
        <FormLabel>Contact Email</FormLabel>
        <Input
          fontSize={'sm'}
          onBlur={handleCheckEmail}
          value={tabSuppiers?.contactEmail}
          placeholder='Enter supplier email'
          onChange={(e) => {
            handleChange('suppliers', 'contactEmail', e.target.value)
            setEmailError('')
          }}
        />
        <FormErrorMessage>{emailError}</FormErrorMessage>
      </FormControl>
      <ButtonGroup>
        <ActionButton
          isDisabled={isInvalid}
          onClick={handleSubmit}
          title={suppliers?.length > 0 ? 'Update' : 'Save'}
        />
        {suppliers?.length > 0 && (
          <Button
            variant='ghost'
            title='Remove supplier'
            onClick={handleRemove}
            isDisabled={isDisabled}
            sx={{
              fontSize: '14px',
              fontWeight: 400,
              color: secondaryTextInverse
            }}
          >
            Remove Supplier
          </Button>
        )}
      </ButtonGroup>
    </Flex>
  )
}

export default CompSupplier
