import { useLazyQuery, useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Text
} from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'
import ToggleVisibilityButton from 'components/Misc/ToggleVisibilityButton'

import useCustomToast from 'hooks/useCustomToast'
import { useThemeColor } from 'hooks/useThemeColors'

import {
  CreateJiraConnection,
  DeleteJiraConnection,
  UpdateJiraConnection
} from 'graphQL/Mutation'
import { VerifyJiraToken } from 'graphQL/Queries'

import { LuSettings } from 'react-icons/lu'

const JiraConfigModal = ({
  isOpen,
  onClose,
  setGreenCheck,
  data,
  updateCon
}) => {
  const { showToast } = useCustomToast()

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
  const [deleteJiraSecret, { loading: deleteLoading }] =
    useMutation(DeleteJiraConnection)
  const [verifyJiraToken, { loading: verifyLoading }] = useLazyQuery(
    VerifyJiraToken,
    {
      fetchPolicy: 'network-only'
    }
  )

  const { primaryBgColor, grayBorderColor } = useThemeColor([
    'primaryBgColor',
    'grayBorderColor'
  ])

  useEffect(() => {
    if (data) {
      setJiraApiToken(data.connection?.apiToken)
      setJiraHost(data.connection?.url)
      setJiraUsername(data.connection?.userName)
    } else {
      setJiraApiToken('')
      setJiraHost('')
      setJiraUsername('')
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
        setGreenCheck((prev) => ({ ...prev, jira: !isSaveDisabled }))
        resetChanges()
        onClose()
        showToast({
          title: 'Configuration saved.',
          description: 'Your Jira configuration has been successfully saved.',
          status: 'success'
        })
      } else {
        showToast({
          title: 'Saving failed.',
          description:
            'An error occurred while saving your Jira configuration.',
          status: 'error'
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
        setGreenCheck((prev) => ({ ...prev, jira: !isSaveDisabled }))
        resetChanges()
        onClose()
        showToast({
          title: 'Configuration saved.',
          description: 'Your Jira configuration has been successfully updated.',
          status: 'success'
        })
      } else {
        showToast({
          title: 'Saving failed.',
          description:
            'An error occurred while updating your Jira configuration.',
          status: 'error'
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
        setGreenCheck((prev) => ({ ...prev, jira: false }))
        onClose()
        showToast({
          title: 'Configuration deleted.',
          description: 'Your Jira configuration has been successfully deleted.',
          status: 'success'
        })
      } else {
        // handle failure
        showToast({
          title: 'Deletion failed.',
          description:
            'An error occurred while deleting your Jira configuration.',
          status: 'error'
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
    <LynkModal
      hidden={data}
      isOpen={isOpen}
      hideCancelButton
      onClose={onClose}
      Icon={LuSettings}
      title={'Jira Configuration'}
      isLoading={isLoading || verifyLoading}
      buttonText={saveOrVerify ? 'Verify' : data ? 'Update' : 'Save'}
      disabled={saveOrVerify ? !updateCon : isSaveDisabled || !updateCon}
      onSubmit={saveOrVerify ? handleVerify : data ? handleUpdate : handleSave}
      rightFooterContent={
        data && (
          <Button
            colorScheme='red'
            onClick={handleDelete}
            isDisabled={!updateCon}
            isLoading={deleteLoading}
            title='Delete Jira Configuration'
          >
            Delete
          </Button>
        )
      }
    >
      <Flex direction='column' gap={4}>
        <FormControl isRequired isDisabled={!updateCon}>
          <FormLabel>Jira Host URL</FormLabel>
          <Input
            value={jiraHost}
            placeholder='Enter Jira Host URL'
            onChange={(e) => {
              setFailure(false)
              setJiraHost(e.target.value)
              setIsJiraHostChanged(true)
            }}
          />
        </FormControl>
        <FormControl isRequired isDisabled={!updateCon}>
          <FormLabel>User Email</FormLabel>
          <Input
            value={jiraUsername}
            onChange={(e) => {
              setJiraUsername(e.target.value)
              setIsJiraUsernameChanged(true)
            }}
            placeholder='Enter User Email'
          />
        </FormControl>
        <FormControl isRequired isDisabled={!updateCon}>
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
            <InputRightElement width='4.5rem' hidden={data}>
              <ToggleVisibilityButton
                isDisabled={!updateCon}
                showPassword={showApiToken}
                onClick={handleToggleVisibility}
              />
            </InputRightElement>
          </InputGroup>
        </FormControl>
        {success && <LynkAlert status='success' msg='Verified successfully!' />}
        {failure && <LynkAlert status='error' msg='Verification failed!' />}
        {verificationDetails && (
          <Box
            p={4}
            border='1px'
            borderColor={grayBorderColor}
            borderRadius='md'
            boxShadow='md'
            bg={primaryBgColor}
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
      </Flex>
    </LynkModal>
  )
}

export default JiraConfigModal
