import { useMutation } from '@apollo/client'
import Cookies from 'js-cookie'
import { useState } from 'react'
import { disableButtonTemporarily } from 'utils'
import { validateEmail, validateUrl } from 'utils/formValidationUtils'

import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Stack
} from '@chakra-ui/react'

import { RegisterOrganizationIcon } from 'components/Icons/Icons'
import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'

import { RegisterOrganization, SwitchOrganization } from 'graphQL/Mutation'

const OrgModal = ({ isOpen, onClose, shouldSwitchOrg = false }) => {
  const { showToast } = useCustomToast()
  const { organization } = useGlobalState()
  const isSuperAdmin = organization?.currentUser?.superAdmin

  const [error, setError] = useState('')
  const [urlError, setUrlError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [isDisabled, setIsDisabled] = useState(false)
  const awsToken = sessionStorage.getItem('awsToken')

  const [formData, setFormData] = useState({
    name: '',
    url: '',
    email: ''
  })
  const { name, url, email } = formData

  const isInvalidEmail = email !== '' && !validateEmail(email)
  const isInvalidURL = url !== '' && !validateUrl(url)

  const handleChange = (event) => {
    const { name, value } = event.target
    const trimmedValue = ['email', 'url'].includes(name) ? value.trim() : value
    setFormData((prev) => ({ ...prev, [name]: trimmedValue }))
    setError('')
    if (name === 'url') {
      setUrlError('')
    } else if (name === 'email') {
      setEmailError('')
    }
  }

  const handleCheckEmail = () => {
    if (!validateEmail(email)) {
      setEmailError('Email is invalid')
    }
  }

  const handleCheckUrl = () => {
    if (!validateUrl(url)) {
      setUrlError('Please enter a valid URL')
    }
  }

  const queries = isSuperAdmin
    ? ['AllOrganizations', 'GetAllOrganizations']
    : ['MyOrganizations', 'GetMyOrganizations']

  const [registerOrg, { loading: regLoading }] = useMutation(
    RegisterOrganization,
    { refetchQueries: queries }
  )
  const [switchOrg] = useMutation(SwitchOrganization, {
    refetchQueries: queries
  })

  const handleSwitchOrg = (orgId, orgName) => {
    switchOrg({
      variables: {
        orgId
      }
    }).then((res) => {
      if (res.data) {
        Cookies.set('authToken', res.data.organizationSwitch.token)
        showToast?.({
          description: `Logged into ${orgName} successfully`,
          status: 'success'
        })
        window.location.href = '/vendor/dashboard'
      }
    })
  }

  const handleCreate = () => {
    disableButtonTemporarily(setIsDisabled)
    registerOrg({
      variables: {
        name: name || undefined,
        url: url || undefined,
        email: email || undefined,
        awsRegistrationToken: awsToken || undefined
      }
    }).then((res) => {
      const { errors } = res?.data?.RegisterOrganization || {}
      if (errors?.length > 0) {
        setError(errors[0])
      } else {
        const orgId = res?.data?.organizationCreate?.organization?.id
        const orgName = res?.data?.organizationCreate?.organization?.name

        !shouldSwitchOrg &&
          showToast({
            description: `Organization added successfully`,
            status: 'success'
          })

        if (shouldSwitchOrg) {
          handleSwitchOrg(orgId, orgName)
        } else {
          onClose()
        }
      }
    })
  }

  const isInvalid = isDisabled || name === '' || isInvalidEmail || isInvalidURL

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      buttonText='Save'
      disabled={isInvalid}
      isLoading={regLoading}
      onSubmit={handleCreate}
      title={'Register Organization'}
      Icon={RegisterOrganizationIcon}
    >
      <Stack width={'100%'} spacing={4}>
        <FormControl isRequired>
          <FormLabel>Name</FormLabel>
          <Input
            type='text'
            name='name'
            value={name}
            maxLength={'30'}
            onChange={handleChange}
            placeholder='Enter name'
          />
        </FormControl>
        <FormControl isInvalid={isInvalidURL}>
          <FormLabel>URL</FormLabel>
          <Input
            name='url'
            type='text'
            value={url}
            placeholder='Enter URL'
            onChange={handleChange}
            onBlur={handleCheckUrl}
          />
          {urlError !== '' && <FormErrorMessage>{urlError}</FormErrorMessage>}
        </FormControl>
        <FormControl isRequired isInvalid={isInvalidEmail}>
          <FormLabel>Email</FormLabel>
          <Input
            name='email'
            type='email'
            value={email}
            onChange={handleChange}
            onBlur={handleCheckEmail}
            placeholder='Enter Email Address'
          />
          {emailError !== '' && (
            <FormErrorMessage>{emailError}</FormErrorMessage>
          )}
        </FormControl>
        {error !== '' && <LynkAlert msg={error} />}
      </Stack>
    </LynkModal>
  )
}

export default OrgModal
