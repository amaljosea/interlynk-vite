import { useLazyQuery, useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'

import { Button, Select, Stack, Text } from '@chakra-ui/react'
import { FormControl, FormLabel } from '@chakra-ui/react'
import { Input, InputGroup, InputRightElement } from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'
import ToggleVisibilityButton from 'components/Misc/ToggleVisibilityButton'

import useCustomToast from 'hooks/useCustomToast'
import { useThemeColor } from 'hooks/useThemeColors'

import {
  CreateBitbucketConnection,
  DeleteBitbucketConnection,
  UpdateBitbucketWorkspace
} from 'graphQL/Mutation'
import { BitbucketWorkspace } from 'graphQL/Queries'

import { IoSettingsOutline } from 'react-icons/io5'

const BitbucketConfigModal = (props) => {
  const { isOpen, onClose, setGreenCheck, data, updateCon } = props

  const { showToast } = useCustomToast()
  const { mutedBorder } = useThemeColor(['mutedBorder'])

  const [error, setError] = useState('')
  const [connection, setConnection] = useState(null)
  const [showApiToken, setShowApiToken] = useState(false)
  const [workspaceList, setWorkspaceList] = useState([])
  const [formData, setFormData] = useState({
    username: '',
    apiToken: '',
    workspace: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const [getWorksapces] = useLazyQuery(BitbucketWorkspace)

  const [createConnection, { loading: createLoading }] = useMutation(
    CreateBitbucketConnection
  )
  const [updateWorkspace, { loading: workspaceLoading }] = useMutation(
    UpdateBitbucketWorkspace
  )
  const [deleteConnection, { loading: deleteLoading }] = useMutation(
    DeleteBitbucketConnection
  )

  const handleVerify = () => {
    createConnection({
      variables: { enabled: true, ...formData }
    }).then((res) => {
      if (res?.data?.bitbucketConnectionCreate?.errors?.length === 0) {
        setConnection(
          res?.data?.bitbucketConnectionCreate?.organizationConnection
        )
        getWorksapces({ variables: { first: 10 } }).then((res) => {
          const { edges } = res?.data?.bitbucketWorkspaces || {}
          if (edges?.length > 0) {
            setWorkspaceList(edges)
          }
        })
        showToast({
          title: 'Configuration saved.',
          description:
            'Your BitBucket configuration has been successfully saved.',
          status: 'success'
        })
      } else {
        setError(res?.data?.bitbucketConnectionCreate?.errors[0])
      }
    })
  }

  const handleAddWorkspace = () => {
    updateWorkspace({
      variables: {
        organizationConnectionId: connection?.id,
        workspace: formData?.workspace
      }
    }).then((res) => {
      if (res?.data?.bitbucketConnectionUpdate?.errors?.length === 0) {
        showToast({
          title: 'Workspace added.',
          description: 'Bitbucket workspace has been successfully updated.',
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
          description: 'Bitbucket configuration has been successfully deleted.',
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
    if (connection?.id) {
      handleAddWorkspace()
    } else {
      handleVerify()
    }
  }

  const showDeleteBtn = data && !connection
  const disabled =
    formData?.username === '' ||
    formData?.apiToken === '' ||
    !updateCon ||
    (connection?.id && formData?.workspace === '')

  useEffect(() => {
    if (data) {
      setFormData((prev) => ({
        ...prev,
        username: data.connection?.userName,
        apiToken: data?.connection?.apiToken
      }))
    }
  }, [data])

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      hideCancelButton
      disabled={disabled}
      onSubmit={handleSubmit}
      Icon={IoSettingsOutline}
      title={'Bitbucket Configuration'}
      buttonText={connection ? 'Save' : 'Verify'}
      isLoading={createLoading || workspaceLoading}
      hidden={!connection && data?.connection?.userName}
      rightFooterContent={
        showDeleteBtn && (
          <Button
            colorScheme='red'
            onClick={handleDelete}
            isDisabled={!updateCon}
            isLoading={deleteLoading}
            loadingText='Deleting....'
            title='Delete Bitbucket Configuration'
          >
            Delete
          </Button>
        )
      }
    >
      <Stack spacing={4}>
        {error && <LynkAlert msg={error} />}

        <FormControl
          isRequired
          isDisabled={!updateCon || data?.connection?.userName}
        >
          <FormLabel>Username</FormLabel>
          <Input
            name='username'
            onChange={handleChange}
            value={formData?.username}
            placeholder='Enter username'
          />
        </FormControl>
        <FormControl
          isRequired
          isDisabled={!updateCon || data?.connection?.userName}
        >
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
            <InputRightElement hidden={data}>
              <ToggleVisibilityButton
                isDisabled={!updateCon}
                showPassword={showApiToken}
                onClick={handleToggleVisibility}
              />
            </InputRightElement>
          </InputGroup>
        </FormControl>
        {connection && (
          <FormControl isRequired>
            <FormLabel>Workspace</FormLabel>
            <Select
              name='workspace'
              value={formData?.workspace}
              onChange={handleChange}
            >
              <option value=''>-- Select --</option>
              {workspaceList?.map((item, index) => (
                <option key={index} value={item?.node?.name}>
                  {item?.node?.name}
                </option>
              ))}
            </Select>
          </FormControl>
        )}
        {!connection && data?.connection && (
          <Stack
            p={4}
            mt={2}
            borderRadius='md'
            border={`1px solid ${mutedBorder}`}
          >
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
            <Text>
              <span style={{ fontWeight: 600 }}>Webhook Access:</span>{' '}
              {data?.connection?.checkWebhookAccess ? 'Yes' : 'No'}
            </Text>
          </Stack>
        )}
      </Stack>
    </LynkModal>
  )
}

export default BitbucketConfigModal
