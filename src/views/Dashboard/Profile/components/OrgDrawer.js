import { useMutation } from '@apollo/client'
import DOMPurify from 'dompurify'
import { useEffect, useState } from 'react'
import { nameValidation } from 'utils/formValidationUtils'

import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input
} from '@chakra-ui/react'

import LynkDrawer from 'components/LynkDrawer'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'
import { useThemeColor } from 'hooks/useThemeColors'

import { orgUpdate } from 'graphQL/Mutation'

const OrgDrawer = ({ isOpen, onClose }) => {
  const [updateOrg, { loading: updateLoading }] = useMutation(orgUpdate)

  const { showToast } = useCustomToast()
  const { organization: orgData } = useGlobalState()
  const { secondaryTextInverse, primaryErrorColor } = useThemeColor([
    'secondaryTextInverse',
    'primaryErrorColor'
  ])

  const [orgName, setOrgName] = useState('')
  const [nameError, setNameError] = useState('')
  const [isSaveDisabled, setIsSaveDisabled] = useState(false)

  const handleOrgNameChange = (e) => {
    const { value } = e.target
    const sanitizedValue = DOMPurify.sanitize(value)
    setOrgName(sanitizedValue)

    if (value.length < 2 || value.length > 256) {
      setNameError('Input must be between 2 and 256 characters')
      setIsSaveDisabled(true)
      return
    } else if (value.startsWith(' ')) {
      setNameError('Organisation name must begin with a letter')
      setIsSaveDisabled(true)
      return
    } else if (!nameValidation.test(value)) {
      setNameError(
        'Only letters, numbers, spaces, dashes, and underscores are allowed'
      )
      setIsSaveDisabled(true)
      return
    } else {
      setNameError('')
      setIsSaveDisabled(false)
    }
  }

  const handleUpdateOrgName = async () => {
    if (orgData?.name === orgName) {
      onClose()
      return
    }
    await updateOrg({
      variables: {
        name: orgName
      }
    }).then((res) => {
      if (res?.data?.organizationUpdate?.errors.length === 0) {
        showToast({
          description: 'Organization name updated successfully',
          status: 'success'
        })
        onClose()
      }
    })
  }

  useEffect(() => {
    if (orgData) {
      setOrgName(orgData?.name)
    }
  }, [orgData])

  return (
    <LynkDrawer
      title={'Edit Organization'}
      isOpen={isOpen}
      onClose={onClose}
      noFooter={true}
    >
      <FormControl id='name' mb={4} isInvalid={nameError !== ''}>
        <FormLabel mb='8px' textColor={secondaryTextInverse}>
          Name
        </FormLabel>
        <Input
          value={orgName}
          placeholder='Enter organization name'
          onChange={handleOrgNameChange}
          borderColor={nameError ? primaryErrorColor : 'inherit'}
        />
        <FormErrorMessage>{nameError}</FormErrorMessage>
      </FormControl>
      <Button
        colorScheme='blue'
        isLoading={updateLoading}
        isDisabled={orgName === '' || isSaveDisabled}
        onClick={handleUpdateOrgName}
        title='Update organization name'
      >
        Update
      </Button>
    </LynkDrawer>
  )
}

export default OrgDrawer
