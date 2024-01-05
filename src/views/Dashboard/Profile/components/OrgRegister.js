import { useMutation } from '@apollo/client'
import {
  Button,
  Heading,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Flex,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  useToast
} from '@chakra-ui/react'
import Card from 'components/Card/Card'
import { RegisterOrganization, SwitchOrganization } from 'graphQL/Mutation'
import Cookies from 'js-cookie'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { validateEmail, validateUrl } from 'utils'

const OrgRegister = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [urlError, setUrlError] = useState('')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')

  const containsSpace = /\s/.test(url)

  const [registerOrg] = useMutation(RegisterOrganization)
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

  const onSwitchOrg = async (id, name) => {
    await switchOrg({
      variables: {
        orgId: id
      }
    })
      .then((res) => {
        if (res.data) {
          Cookies.set('authToken', res.data.organizationSwitch.token)
          toast({
            description: `Logged into ${name} successfully`,
            position: 'top',
            status: 'success'
          })
        }
      })
      .finally(() => navigate('/vendor/dashboard'))
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
        localStorage.setItem(
          'organization',
          res.data.organizationCreate.organization.name
        )
        onSwitchOrg(orgId, name)
      }
    })
  }

  return (
    <>
      <Card p={20} alignItems={'center'} justifyContent={'center'} height={64}>
        <Heading
          textAlign={'center'}
          size='md'
          fontFamily={'inherit'}
          fontWeight={'semibold'}
        >
          Register or join an organization to get started
        </Heading>
        <Button mt={10} variant='solid' colorScheme='blue' onClick={onOpen}>
          Register Organization
        </Button>
      </Card>

      {isOpen && (
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Register Organization</ModalHeader>
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
                <FormControl
                  isInvalid={(url !== '' && !validateUrl(url)) || containsSpace}
                >
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
      )}
    </>
  )
}

export default OrgRegister
