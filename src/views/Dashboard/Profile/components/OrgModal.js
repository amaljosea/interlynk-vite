import { useMutation } from '@apollo/client'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage
} from '@chakra-ui/react'
import { RegisterOrganization } from 'graphQL/Mutation'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { validateUrl, validateEmail } from 'utils'

const OrgModal = ({ isOpen, onClose, refetch, org, onSwitch }) => {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [urlError, setUrlError] = useState('')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')

  const containsSpace = /\s/.test(url)

  const [registerOrg] = useMutation(RegisterOrganization, {
    onCompleted: () => refetch()
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

  const handleCreate = async () => {
    await registerOrg({
      variables: {
        name,
        url,
        email
      }
    }).then((res) => {
      if (res.data) {
        const orgId = res.data.organizationCreate.organization.id
        if (org) {
          onClose()
          navigate('/vendor/settings?tab=organization')
        } else {
          onSwitch(orgId, name)
        }
      }
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Organization</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex width={'100%'} direction={'column'} gap={4}>
            {error !== '' && (
              <Alert status='error'>
                <AlertIcon />
                <Text fontSize={'sm'}>{error}</Text>
              </Alert>
            )}
            {/* NAME */}
            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                type='text'
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setError('')
                }}
                placeholder='Enter name'
              />
            </FormControl>
            {/* URL */}
            <FormControl isInvalid={url !== '' && !validateUrl(url) && containsSpace}>
              <FormLabel>URL</FormLabel>
              <Input
                type='text'
                value={url}
                onBlur={handleCheckUrl}
                onChange={(e) => {
                  setUrl(e.target.value)
                  setUrlError('')
                }}
                placeholder='Enter url'
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
                value={email}
                onBlur={handleCheckEmail}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setEmailError('')
                }}
                placeholder='Enter email address'
              />
              {emailError !== '' && (
                <FormErrorMessage>{emailError}</FormErrorMessage>
              )}
            </FormControl>
          </Flex>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme='blue'
            disabled={name === '' || emailError !== ''}
            onClick={handleCreate}
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default OrgModal
