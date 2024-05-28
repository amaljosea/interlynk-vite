import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'

import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import {
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
  useToast
} from '@chakra-ui/react'

import { UpdateJiraSecret, VerifyJiraConfigs } from 'graphQL/Mutation'

const JiraConfigModal = ({ isOpen, onClose, setGreenCheck, data, refetch }) => {
  const toast = useToast()

  const [jiraApiToken, setJiraApiToken] = useState('')
  const [jiraHost, setJiraHost] = useState('')
  const [jiraUsername, setJiraUsername] = useState('')
  const [jiraConfigs, setJiraConfigs] = useState({})

  const [isJiraHostChanged, setIsJiraHostChanged] = useState(false)
  const [isJiraUsernameChanged, setIsJiraUsernameChanged] = useState(false)
  const [isJiraApiTokenChanged, setIsJiraApiTokenChanged] = useState(false)

  const [isSaveDisabled, setIsSaveDisabled] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const [showApiToken, setShowApiToken] = useState(false)
  const [success, setSuccess] = useState(false)
  const [failure, setFaliure] = useState(false)

  const [updateJiraSecret] = useMutation(UpdateJiraSecret)
  const [verifyJiraConfigs] = useMutation(VerifyJiraConfigs)

  useEffect(() => {
    if (data) {
      setJiraApiToken(data.jiraSecret?.apiToken)
      setJiraHost(data.jiraSecret?.host)
      setJiraUsername(data.jiraSecret?.username)
    }
  }, [data])

  useEffect(() => {
    setJiraConfigs(
      JSON.stringify({
        jiraApiToken,
        jiraHost,
        jiraUsername
      })
    )
  }, [jiraHost, jiraUsername, jiraApiToken])

  const handleSave = () => {
    let payload = {}
    if (!isSaveDisabled) {
      payload = {
        host: jiraHost,
        username: jiraUsername,
        apiToken: jiraApiToken
      }
    } else {
      payload = {}
    }
    updateJiraSecret({
      variables: payload
    }).then((res) => {
      if (res?.data?.jiraSecretUpdate?.success) {
        setGreenCheck(!isSaveDisabled)
        resetChanges()
        refetch()
        onClose()
        toast({
          title: 'Configuration saved.',
          description: 'Your JIRA configuration has been successfully saved.',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top'
        })
      } else {
        toast({
          title: 'Saving failed.',
          description:
            'An error occurred while saving your JIRA configuration.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top'
        })
      }
    })
  }

  const handleVerify = () => {
    setIsLoading(true)

    verifyJiraConfigs({
      variables: {
        jiraConfigs: jiraConfigs
      }
    }).then((res) => {
      setIsLoading(false)
      if (res?.data?.verifyJiraConfigs?.success) {
        resetChanges()
        setSuccess(true)
        setFaliure(false)
      } else {
        setFaliure(true)
        setSuccess(false)
      }
    })
  }

  const resetChanges = () => {
    setIsJiraHostChanged(false)
    setIsJiraUsernameChanged(false)
    setIsJiraApiTokenChanged(false)
    setIsSaveDisabled(false)
  }

  const isValuesChanged =
    isJiraHostChanged || isJiraUsernameChanged || isJiraApiTokenChanged

  const saveOrVerify =
    isValuesChanged && jiraHost && jiraUsername && jiraApiToken

  const handleToggleVisibility = () => setShowApiToken(!showApiToken)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      motionPreset='slideInBottom'
      size='xl'
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Configure JIRA Connection </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl isRequired mt={4}>
            <FormLabel>JIRA Host URL</FormLabel>
            <Input
              value={jiraHost}
              placeholder='Enter JIRA Host URL'
              onChange={(e) => {
                setJiraHost(e.target.value)
                setIsJiraHostChanged(true)
              }}
            />
          </FormControl>
          <FormControl isRequired mt={4}>
            <FormLabel>User Name</FormLabel>
            <Input
              value={jiraUsername}
              onChange={(e) => {
                setJiraUsername(e.target.value)
                setIsJiraUsernameChanged(true)
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
                value={jiraApiToken}
                placeholder='Enter API Token'
                onChange={(e) => {
                  setJiraApiToken(e.target.value)
                  setIsJiraApiTokenChanged(true)
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
        </ModalBody>
        <ModalFooter>
          {success && (
            <Text color='green.500' fontSize='sm' mr='auto'>
              {'Verified successfully!'}
            </Text>
          )}
          {failure && (
            <Text color='red.500' fontSize='sm' mr='auto'>
              {'Verification failed!'}
            </Text>
          )}
          <Button variant='unstyled' colorScheme='red' onClick={onClose}>
            Cancel
          </Button>
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
              colorScheme={isSaveDisabled ? 'red' : 'green'}
              ml={3}
              onClick={handleSave}
            >
              {isSaveDisabled ? 'Reset' : 'Save'}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default JiraConfigModal
