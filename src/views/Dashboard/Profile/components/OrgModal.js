import { useMutation } from '@apollo/client'
import Cookies from 'js-cookie'
import { useState } from 'react'
import { disableButtonTemporarily } from 'utils'
import {
  hasWhiteSpace,
  validateEmail,
  validateUrl
} from 'utils/formValidationUtils'

import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/react'
import { Flex, Input } from '@chakra-ui/react'

import { RegisterOrganizationIcon } from 'components/Icons/Icons'
import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'

import { RegisterOrganization, SwitchOrganization } from 'graphQL/Mutation'

const OrgModal = ({ isOpen, onClose, shouldSwitchOrg = false }) => {
  const { showToast } = useCustomToast()
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [urlError, setUrlError] = useState('')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [isDisabled, setIsDisabled] = useState(false)
  const awsToken = sessionStorage.getItem('awsToken')

  const containsSpace = hasWhiteSpace(url)

  const [registerOrg, { loading: regLoading }] = useMutation(
    RegisterOrganization,
    { refetchQueries: ['MyOrganizations', 'AllOrganizations'] }
  )
  const [switchOrg] = useMutation(SwitchOrganization, {
    refetchQueries: ['MyOrganizations', 'AllOrganizations']
  })

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
        url: name || undefined,
        email: name || undefined,
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

  const isInvalid =
    isDisabled ||
    name === '' ||
    (email !== '' && emailError !== '') ||
    (url !== '' && !validateUrl(url))

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
      <Flex width={'100%'} direction={'column'} gap={4}>
        {error !== '' && <LynkAlert msg={error} />}
        {/* NAME */}
        <FormControl isRequired>
          <FormLabel>Name</FormLabel>
          <Input
            type='text'
            fontSize={14}
            maxLength={'30'}
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError('')
            }}
            placeholder='Enter name'
          />
        </FormControl>
        {/* URL */}
        <FormControl
          isInvalid={(url !== '' && !validateUrl(url)) || containsSpace}
        >
          <FormLabel>URL</FormLabel>
          <Input
            type='text'
            fontSize={14}
            value={url}
            onBlur={handleCheckUrl}
            onChange={(e) => {
              setUrl(e.target.value)
              setUrlError('')
            }}
            placeholder='Enter URL'
          />
          {urlError !== '' && <FormErrorMessage>{urlError}</FormErrorMessage>}
        </FormControl>
        {/* EMAIL */}
        <FormControl isInvalid={email !== '' && !validateEmail(email)}>
          <FormLabel>Email</FormLabel>
          <Input
            type='text'
            fontSize={14}
            value={email}
            onBlur={handleCheckEmail}
            onChange={(e) => {
              setEmail(e.target.value)
              setEmailError('')
            }}
            placeholder='Enter Email Address'
          />
          {emailError !== '' && (
            <FormErrorMessage>{emailError}</FormErrorMessage>
          )}
        </FormControl>
      </Flex>
    </LynkModal>
  )
}

export default OrgModal
