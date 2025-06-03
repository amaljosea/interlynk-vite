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
  CreateLinearConnection,
  DeleteLinearConnection
} from 'graphQL/Mutation'
import { VerifyLinearToken } from 'graphQL/Queries'

import { LuSettings } from 'react-icons/lu'

const LinearConfigModal = ({
  isOpen,
  onClose,
  setGreenCheck,
  data,
  updateCon
}) => {
  const { showToast } = useCustomToast()

  const url = 'https://api.linear.app/graphql'
  const [apiToken, setApiToken] = useState('')

  const [isApiTokenChanged, setIsApiTokenChanged] = useState(false)

  const [isSaveDisabled, setIsSaveDisabled] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const [showApiToken, setShowApiToken] = useState(false)
  const [success, setSuccess] = useState(false)
  const [failure, setFailure] = useState(false)

  const [verificationDetails, setVerificationDetails] = useState(null)

  const [createConnection, { loading: creating }] = useMutation(
    CreateLinearConnection
  )
  const [deleteConnection, { loading: deleting }] = useMutation(
    DeleteLinearConnection
  )
  const [verifyConnection, { loading: verifying }] = useLazyQuery(
    VerifyLinearToken,
    { fetchPolicy: 'network-only' }
  )

  const { primaryBgColor, grayBorderColor } = useThemeColor([
    'primaryBgColor',
    'grayBorderColor'
  ])

  const handleChangeApi = (e) => {
    setApiToken(e.target.value)
    setIsApiTokenChanged(true)
    setIsSaveDisabled(false)
  }

  const handleSave = () => {
    createConnection({ variables: { url: url, apiToken } }).then((res) => {
      if (res?.data?.linearConnectionCreate?.errors?.length === 0) {
        setGreenCheck((prev) => ({ ...prev, linear: !isSaveDisabled }))
        resetChanges()
        onClose()
        showToast({
          title: 'Configuration saved.',
          description: 'Linear configuration has been successfully saved.',
          status: 'success'
        })
      } else {
        showToast({
          title: 'Saving failed.',
          description:
            'An error occurred while saving your linear configuration.',
          status: 'error'
        })
      }
    })
  }

  const handleVerify = () => {
    setIsLoading(true)
    verifyConnection({ variables: { url: url, apiToken } })
      .then((res) => {
        setIsLoading(false)
        if (res?.data?.organization?.linearVerify) {
          resetChanges()
          setSuccess(true)
          setFailure(false)
          setVerificationDetails(res.data.organization.linearVerify)
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
    deleteConnection({
      variables: { organizationConnectionId: data?.id }
    }).then((res) => {
      if (res?.data?.linearConnectionDelete?.errors?.length === 0) {
        setGreenCheck((prev) => ({ ...prev, linear: false }))
        showToast({
          title: 'Configuration deleted.',
          description: 'Linear configuration has been successfully deleted.',
          status: 'success'
        })
        setApiToken('')
        onClose()
      } else {
        // handle failure
        showToast({
          title: 'Deletion failed.',
          description:
            'An error occurred while deleting your linear configuration.',
          status: 'error'
        })
      }
    })
  }

  const resetChanges = () => {
    setIsApiTokenChanged(false)
    setIsSaveDisabled(false)
  }

  const isValuesChanged = isApiTokenChanged

  const saveOrVerify = isValuesChanged && url && apiToken

  const handleToggleVisibility = () => setShowApiToken(!showApiToken)

  useEffect(() => {
    if (data) {
      setApiToken(data?.connection?.apiToken)
    } else {
      setApiToken('')
    }
  }, [data])

  return (
    <LynkModal
      hidden={data}
      isOpen={isOpen}
      hideCancelButton
      onClose={onClose}
      Icon={LuSettings}
      title={'Linear Configuration'}
      buttonText={saveOrVerify ? 'Verify' : 'Save'}
      isLoading={isLoading || verifying || creating}
      onSubmit={saveOrVerify ? handleVerify : handleSave}
      disabled={saveOrVerify ? !updateCon : isSaveDisabled || !updateCon}
      rightFooterContent={
        data && (
          <Button
            colorScheme='red'
            isLoading={deleting}
            onClick={handleDelete}
            isDisabled={!updateCon}
            title='Delete Linear Configuration'
          >
            Delete
          </Button>
        )
      }
    >
      <Flex direction='column' gap={4}>
        <FormControl isRequired isDisabled>
          <FormLabel>Linear Host URL</FormLabel>
          <Input
            value={url}
            placeholder='Enter Linear Host URL'
            onChange={(e) => console.warn(e.target.value)}
          />
        </FormControl>
        <FormControl isRequired isDisabled={!updateCon || data?.connection?.id}>
          <FormLabel>API Token</FormLabel>
          <InputGroup size='md'>
            <Input
              pr='4.5rem'
              value={apiToken}
              onChange={handleChangeApi}
              placeholder='Enter API Token'
              type={showApiToken ? 'text' : 'password'}
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
              <strong>Name:</strong> {verificationDetails?.name}
            </Text>
            <Text>
              <strong>Email:</strong> {verificationDetails?.email}
            </Text>
            <Text>
              <strong>Account ID:</strong> {verificationDetails?.accountId}
            </Text>
            <Text>
              <strong>URL:</strong> {verificationDetails?.url}
            </Text>
          </Box>
        )}
      </Flex>
    </LynkModal>
  )
}

export default LinearConfigModal
