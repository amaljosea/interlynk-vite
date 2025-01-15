import { useMutation } from '@apollo/client'
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

import { RegisterOrganization } from 'graphQL/Mutation'

const OrgModal = ({ isOpen, onClose }) => {
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

  const [registerOrg, { loading: regLoading }] =
    useMutation(RegisterOrganization)

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

  const handleCreate = () => {
    disableButtonTemporarily(setIsDisabled)
    registerOrg({
      variables: {
        name,
        url,
        email,
        awsRegistrationToken: awsToken || undefined
      }
    }).then((res) => {
      const { errors } = res?.data?.RegisterOrganization || ''
      if (errors?.length > 0) {
        setError(errors[0])
      } else {
        showToast({
          description: `Organization added successfully`,
          status: 'success'
        })
        onClose()
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
            maxLength={'20'}
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
