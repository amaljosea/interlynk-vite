import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'

import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import { Button, IconButton, Stack, Text } from '@chakra-ui/react'
import { FormControl, FormLabel } from '@chakra-ui/react'
import { Input, InputGroup, InputRightElement } from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'
import { useThemeColor } from 'hooks/useThemeColors'

import {
  CreateBitbucketConnection,
  DeleteBitbucketConnection,
  UpdateBitbucketConnection
} from 'graphQL/Mutation'

import { IoSettingsOutline } from 'react-icons/io5'

const BitbucketConfigModal = (props) => {
  const { isOpen, onClose, setGreenCheck, data, updateCon } = props

  const { showToast } = useCustomToast()

  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    workspace: '',
    username: '',
    apiToken: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const [showApiToken, setShowApiToken] = useState(false)

  const disabled =
    formData?.workspace === '' ||
    formData?.username === '' ||
    formData?.apiToken === ''

  const [updateConnection, { loading: updateLoading }] = useMutation(
    UpdateBitbucketConnection
  )
  const [createConnection, { loading: createLoading }] = useMutation(
    CreateBitbucketConnection
  )
  const [deleteConnection, { loading: deleteLoading }] = useMutation(
    DeleteBitbucketConnection
  )

  const { primaryBgColor } = useThemeColor(['primaryBgColor'])

  const handleSave = () => {
    createConnection({
      variables: { enabled: true, ...formData }
    }).then((res) => {
      if (res?.data?.bitbucketConnectionCreate?.errors?.length === 0) {
        showToast({
          title: 'Configuration saved.',
          description:
            'Your BitBucket configuration has been successfully saved.',
          status: 'success'
        })
        onClose()
      } else {
        setError(res?.data?.bitbucketConnectionCreate?.errors[0])
      }
    })
  }

  const handleUpdate = () => {
    updateConnection({
      variables: { id: data?.id, enabled: true, ...formData }
    }).then((res) => {
      if (res?.data?.bitbucketConnectionUpdate?.errors?.length === 0) {
        showToast({
          title: 'Configuration saved.',
          description:
            'Your BitBucket configuration has been successfully updated.',
          status: 'success'
        })
        onClose()
      } else {
        setError(res?.data?.bitbucketConnectionUpdate?.errors[0])
      }
    })
  }

  const handleDelete = () => {
    deleteConnection({ variables: { id: data?.id } }).then((res) => {
      if (res?.data?.bitbucketConnectionDelete?.errors?.length === 0) {
        setGreenCheck((prev) => ({ ...prev, bitbucket: false }))
        showToast({
          title: 'Configuration deleted.',
          description:
            'Your BitBucket configuration has been successfully deleted.',
          status: 'success'
        })
        onClose()
      } else {
        setError(res?.data?.bitbucketConnectionDelete?.errors[0])
      }
    })
  }

  const handleToggleVisibility = () => setShowApiToken(!showApiToken)

  const handleSubmit = () => {
    if (data?.connection?.id) {
      handleUpdate()
    } else {
      handleSave()
    }
  }

  useEffect(() => {
    if (data) {
      setFormData((prev) => ({
        ...prev,
        username: data.connection?.userName,
        apiToken: data?.connection?.apiToken,
        workspace: data.connection?.workspace
      }))
    }
  }, [data])

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      hideCancelButton
      onSubmit={handleSubmit}
      Icon={IoSettingsOutline}
      hidden={data?.connection?.id}
      disabled={disabled || !updateCon}
      title={'BitBucket Configuration'}
      buttonText={data ? 'Update' : 'Save'}
      isLoading={createLoading || updateLoading}
      rightFooterContent={
        data && (
          <Button
            colorScheme='red'
            onClick={handleDelete}
            isDisabled={!updateCon}
            isLoading={deleteLoading}
            loadingText='Deleting....'
            title='Delete BitBucket Configuration'
          >
            Delete
          </Button>
        )
      }
    >
      <Stack spacing={4}>
        {error && <LynkAlert msg={error} />}

        <FormControl isRequired isDisabled={!updateCon || data?.connection?.id}>
          <FormLabel>Workspace</FormLabel>
          <Input
            name='workspace'
            onChange={handleChange}
            value={formData?.workspace}
            placeholder='Enter workspace'
          />
        </FormControl>
        <FormControl isRequired isDisabled={!updateCon || data?.connection?.id}>
          <FormLabel>Username</FormLabel>
          <Input
            name='username'
            onChange={handleChange}
            value={formData?.username}
            placeholder='Enter username'
          />
        </FormControl>
        <FormControl isRequired isDisabled={!updateCon || data?.connection?.id}>
          <FormLabel>API Token</FormLabel>
          <InputGroup size='md'>
            <Input
              pr='4.5rem'
              name='apiToken'
              onChange={handleChange}
              value={formData?.apiToken}
              placeholder='Enter API Token'
              type={showApiToken ? 'text' : 'password'}
            />
            <InputRightElement width='4.5rem' hidden={data}>
              <IconButton
                right='2'
                size='sm'
                h='1.75rem'
                position='absolute'
                isDisabled={!updateCon}
                onClick={handleToggleVisibility}
              >
                {showApiToken ? <ViewOffIcon /> : <ViewIcon />}
              </IconButton>
            </InputRightElement>
          </InputGroup>
        </FormControl>
        {data?.connection && (
          <Stack p={4} mt={2} borderRadius='md' bg={primaryBgColor}>
            <Text fontWeight='bold' mb={1}>
              Verification Details:
            </Text>
            <Text>
              <span style={{ fontWeight: 600 }}>Username:</span>{' '}
              {data?.connection?.userName}
            </Text>
            <Text>
              <span style={{ fontWeight: 600 }}>Workspace:</span>{' '}
              {data?.connection?.workspace}
            </Text>
            <Text>
              <span style={{ fontWeight: 600 }}>Workspace Access:</span>{' '}
              {data?.connection?.checkWorkspaceAccess ? 'Yes' : 'No'}
            </Text>
            <Text>
              <span style={{ fontWeight: 600 }}>Repository Access:</span>{' '}
              {data?.connection?.checkRepositoryAccess ? 'Yes' : 'No'}
            </Text>
          </Stack>
        )}
      </Stack>
    </LynkModal>
  )
}

export default BitbucketConfigModal
