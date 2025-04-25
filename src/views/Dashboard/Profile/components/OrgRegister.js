import { useMutation } from '@apollo/client'
import Cookies from 'js-cookie'
import { useState } from 'react'
import {
  hasWhiteSpace,
  validateEmail,
  validateUrl
} from 'utils/formValidationUtils'

import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  useDisclosure
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import { RegisterOrganizationIcon } from 'components/Icons/Icons'
import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'

import { RegisterOrganization, SwitchOrganization } from 'graphQL/Mutation'

const OrgRegister = () => {
  const { showToast } = useCustomToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [urlError, setUrlError] = useState('')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')

  const containsSpace = hasWhiteSpace(url)

  const [registerOrg, { loading: regLoading }] =
    useMutation(RegisterOrganization)
  const [switchOrg] = useMutation(SwitchOrganization)

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

  const onSwitchOrg = (id, name) => {
    switchOrg({
      variables: {
        orgId: id
      }
    })
      .then((res) => {
        if (res.data) {
          Cookies.set('authToken', res.data.organizationSwitch.token)
          showToast({
            description: `Logged into ${name} successfully`,
            status: 'success'
          })
        }
      })
      .finally(() => (window.location.href = '/vendor/dashboard'))
  }

  const handleCreate = () => {
    registerOrg({
      variables: {
        name,
        url,
        email
      }
    }).then((res) => {
      if (res?.data) {
        const orgId = res.data.organizationCreate.organization.id
        localStorage.setItem(
          'organization',
          res.data.organizationCreate.organization.name
        )
        onClose()
        onSwitchOrg(orgId, name)
      }
    })
  }

  const isInvalid =
    name === '' ||
    (email !== '' && emailError !== '') ||
    (url !== '' && !validateUrl(url))

  return (
    <>
      <Card p={20} alignItems={'center'} justifyContent={'center'} height={64}>
        <Heading textAlign={'center'} size='md' fontWeight={'semibold'}>
          Register or join an organization to get started
        </Heading>
        <Button
          mt={10}
          variant='solid'
          colorScheme='blue'
          onClick={onOpen}
          title='Register organization'
        >
          Register Organization
        </Button>
      </Card>

      {isOpen && (
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
              {urlError !== '' && (
                <FormErrorMessage>{urlError}</FormErrorMessage>
              )}
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
      )}
    </>
  )
}

export default OrgRegister
