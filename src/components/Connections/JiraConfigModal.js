import { useLazyQuery, useMutation } from '@apollo/client'
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
  useToast
} from '@chakra-ui/react'

import {
  CreateJiraConnection,
  DeleteJiraConnection,
  UpdateJiraConnection
} from 'graphQL/Mutation'
import { VerifyJiraToken } from 'graphQL/Queries'

const JiraConfigModal = ({ isOpen, onClose, setGreenCheck, data, refetch }) => {
  const toast = useToast()

  const [jiraApiToken, setJiraApiToken] = useState('')
  const [jiraHost, setJiraHost] = useState('')
  const [jiraUsername, setJiraUsername] = useState('')

  const [isJiraHostChanged, setIsJiraHostChanged] = useState(false)
  const [isJiraUsernameChanged, setIsJiraUsernameChanged] = useState(false)
  const [isJiraApiTokenChanged, setIsJiraApiTokenChanged] = useState(false)

  const [isSaveDisabled, setIsSaveDisabled] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const [showApiToken, setShowApiToken] = useState(false)
  const [success, setSuccess] = useState(false)
  const [failure, setFailure] = useState(false)

  const [verificationDetails, setVerificationDetails] = useState(null)

  const [updateJiraSecret] = useMutation(UpdateJiraConnection)
  const [createJiraSecret] = useMutation(CreateJiraConnection)
  const [deleteJiraSecret] = useMutation(DeleteJiraConnection)
  const [verifyJiraToken, { data: verifyData, loading: verifyLoading }] =
    useLazyQuery(VerifyJiraToken, {
      fetchPolicy: 'network-only'
    })

  useEffect(() => {
    if (data) {
      setJiraApiToken(data.connection?.apiToken)
      setJiraHost(data.connection?.url)
      setJiraUsername(data.connection?.userName)
    }
  }, [data])

  const handleSave = () => {
    createJiraSecret({
      variables: {
        url: jiraHost,
        userName: jiraUsername,
        apiToken: jiraApiToken
      }
    }).then((res) => {
      if (res?.data?.jiraConnectionCreate?.errors?.length === 0) {
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

  const handleUpdate = () => {
    updateJiraSecret({
      variables: {
        id: data?.id,
        url: jiraHost,
        userName: jiraUsername,
        apiToken: jiraApiToken
      }
    }).then((res) => {
      if (res?.data?.jiraConnectionUpdate?.errors?.length === 0) {
        setGreenCheck(!isSaveDisabled)
        resetChanges()
        refetch()
        onClose()
        toast({
          title: 'Configuration saved.',
          description: 'Your JIRA configuration has been successfully updated.',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top'
        })
      } else {
        toast({
          title: 'Saving failed.',
          description:
            'An error occurred while updating your JIRA configuration.',
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

    verifyJiraToken({
      variables: {
        userName: jiraUsername,
        apiToken: jiraApiToken,
        url: jiraHost
      }
    })
      .then((res) => {
        setIsLoading(false)
        if (res?.data?.organization?.jiraVerify) {
          resetChanges()
          setSuccess(true)
          setFailure(false)
          setVerificationDetails(res.data.organization.jiraVerify)
        } else {
          setFailure(true)
          setSuccess(false)
        }
      })
      .catch(() => {
        setIsLoading(false)
        setFailure(true)
        setSuccess(false)
      })
  }

  const handleDelete = () => {
    deleteJiraSecret({
      variables: {
        organizationConnectionId: data?.id
      }
    }).then((res) => {
      if (res?.data?.jiraConnectionDelete?.errors?.length === 0) {
        // handle success
        refetch()
        onClose()
        toast({
          title: 'Configuration deleted.',
          description: 'Your JIRA configuration has been successfully deleted.',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top'
        })
      } else {
        // handle failure
        toast({
          title: 'Deletion failed.',
          description:
            'An error occurred while deleting your JIRA configuration.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top'
        })
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
          {verificationDetails && (
            <Box
              mt={4}
              p={4}
              border='1px'
              borderColor='gray.200'
              borderRadius='md'
              boxShadow='md'
              bg='gray.50'
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
          {failure && (
            <Text color='red.500' fontSize='sm' mr='auto'>
              {'Verification failed!'}
            </Text>
          )}
          {saveOrVerify ? (
            <Button
              colorScheme='blue'
              ml={3}
              onClick={handleVerify}
              isLoading={isLoading || verifyLoading}
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

export default JiraConfigModal
