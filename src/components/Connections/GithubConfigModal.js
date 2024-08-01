import { useEffect, useState } from 'react'

import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useColorModeValue,
  useToast
} from '@chakra-ui/react'

const GithubConfigModal = ({
  isOpen,
  onClose,
  setGreenCheck,
  data,
  refetch
}) => {
  const toast = useToast()

  const [githubApiToken, setGithubApiToken] = useState('')
  const [githubUsername, setGithubUsername] = useState('')

  const [isGithubUsernameChanged, setIsGithubUsernameChanged] = useState(false)
  const [isGithubApiTokenChanged, setIsGithubApiTokenChanged] = useState(false)

  const [isSaveDisabled, setIsSaveDisabled] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const [showApiToken, setShowApiToken] = useState(false)
  const [success, setSuccess] = useState(false)

  const [verificationDetails, setVerificationDetails] = useState(null)

  useEffect(() => {
    if (data) {
      setGithubApiToken(data.connection?.apiToken)
      setGithubUsername(data.connection?.userName)
    }
  }, [data])

  const handleSave = () => {
    setGreenCheck((prev) => ({ ...prev, github: !isSaveDisabled }))
    resetChanges()
    refetch()
    onClose()
    localStorage.setItem('githubConfigSaved', 'true')
    toast({
      title: 'Configuration saved.',
      description: 'Your GITHUB configuration has been successfully saved.',
      status: 'success',
      duration: 5000,
      isClosable: true,
      position: 'top'
    })
  }

  const handleUpdate = () => {}

  const handleVerify = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setSuccess(true)
      resetChanges()
      setVerificationDetails({
        email: `${githubUsername}@gmail.com`,
        name: `${githubUsername.charAt(0).toUpperCase() + githubUsername.slice(1)}`,
        accountId: '65432345',
        accountType: 'User',
        url: `https://github.com/${githubUsername}`,
        version: 'v1.0',
        deploymentType: 'Cloud',
        serverTitle: 'GitHub Server'
      })
    }, 3000)
  }

  const bgColor = useColorModeValue('#F7FAFC', '#1A202C')

  const handleDelete = () => {}

  const handleToggleVisibility = () => setShowApiToken(!showApiToken)

  const resetChanges = () => {
    setIsGithubUsernameChanged(false)
    setIsGithubApiTokenChanged(false)
    setIsSaveDisabled(false)
  }

  const isValuesChanged = isGithubUsernameChanged || isGithubApiTokenChanged

  const saveOrVerify = isValuesChanged && githubUsername && githubApiToken

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      motionPreset='slideInBottom'
      size='xl'
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Configure GitHub Connection</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl isRequired mt={4}>
            <FormLabel>User Name</FormLabel>
            <Input
              value={githubUsername}
              onChange={(e) => {
                setGithubUsername(e.target.value)
                setIsGithubUsernameChanged(true)
              }}
              placeholder='Enter User Name'
            />
          </FormControl>
          <FormControl isRequired mt={4}>
            <FormLabel>API Token</FormLabel>
            <InputGroup size='md'>
              <Input
                pr='4.5rem'
                type={showApiToken ? 'text' : 'password'}
                value={githubApiToken}
                placeholder='Enter API Token'
                onChange={(e) => {
                  setGithubApiToken(e.target.value)
                  setIsGithubApiTokenChanged(true)
                }}
              />
              <InputRightElement width='4.5rem'>
                <IconButton
                  size='sm'
                  h='1.75rem'
                  onClick={handleToggleVisibility}
                  position='absolute'
                  right='2'
                >
                  {showApiToken ? <ViewOffIcon /> : <ViewIcon />}
                </IconButton>
              </InputRightElement>
            </InputGroup>
          </FormControl>
          {verificationDetails && (
            <Box
              mt={4}
              p={4}
              border='1px'
              borderColor='gray.200'
              borderRadius='md'
              boxShadow='md'
              bg={bgColor}
            >
              <Text fontWeight='bold' mb={2}>
                Verification Details:
              </Text>
              <Text>
                <strong>Email:</strong> {verificationDetails.email}
              </Text>
              <Text>
                <strong>Name:</strong> {verificationDetails.name}
              </Text>
              <Text>
                <strong>Account ID:</strong> {verificationDetails.accountId}
              </Text>
              <Text>
                <strong>Account Type:</strong> {verificationDetails.accountType}
              </Text>
              <Text>
                <strong>URL:</strong> {verificationDetails.url}
              </Text>
              <Text>
                <strong>Version:</strong> {verificationDetails.version}
              </Text>
              <Text>
                <strong>Deployment Type:</strong>{' '}
                {verificationDetails.deploymentType}
              </Text>
              <Text>
                <strong>Server Title:</strong> {verificationDetails.serverTitle}
              </Text>
            </Box>
          )}
        </ModalBody>
        <ModalFooter>
          {success && (
            <Text color='green.500' fontSize='sm' mr='auto'>
              {'Verified successfully!'}
            </Text>
          )}
          {saveOrVerify ? (
            <Button
              colorScheme='blue'
              ml={3}
              onClick={handleVerify}
              isLoading={isLoading}
            >
              Verify
            </Button>
          ) : (
            <Button
              colorScheme={isSaveDisabled ? 'blue' : 'green'}
              ml={3}
              onClick={data ? handleUpdate : handleSave}
              isDisabled={isSaveDisabled}
            >
              {data ? 'Update' : 'Save'}
            </Button>
          )}
          {data && (
            <Button colorScheme='red' ml={3} onClick={handleDelete}>
              Delete
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default GithubConfigModal
