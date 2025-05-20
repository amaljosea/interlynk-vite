import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import {
  isValidSlackWebhookUrl,
  isValidTeamsWebhookUrl,
  validateEmail
} from 'utils/formValidationUtils'

import { Box, Button, HStack, Input, Stack } from '@chakra-ui/react'
import { FormControl, FormErrorMessage } from '@chakra-ui/react'

import DeleteButton from 'components/Icons/DeleteButton'
import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'
import LynkSelect from 'components/LynkSelect'

import useCustomToast from 'hooks/useCustomToast'
import { useHasPermission } from 'hooks/useHasPermission'

import { IoSettingsOutline } from 'react-icons/io5'
import { LuCirclePlus } from 'react-icons/lu'

const options = [
  { value: 'All', label: 'All' },
  { value: 'Alert', label: 'Alert' },
  { value: 'Warning', label: 'Warning' },
  { value: 'Info', label: 'Info' }
]

const ConfigModal = ({
  isOpen,
  onClose,
  data,
  setGreenCheck,
  org,
  hostId,
  createConnection,
  updateConnection,
  deleteConnection,
  title,
  addressPlaceholder,
  greenCheckKey
}) => {
  const { showToast } = useCustomToast()
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [updateConn, { loading: updateLoading }] = useMutation(updateConnection)
  const [createConn, { loading: createLoading }] = useMutation(createConnection)
  const [deleteConn, { loading: deleteLoading }] = useMutation(deleteConnection)

  const [configs, setConfigs] = useState([
    {
      address: '',
      notificationType: 'All',
      frequency: 'Instant',
      isValid: true
    }
  ])

  const updateCon = useHasPermission({
    parentKey: 'view_connections',
    childKey: 'create_update_connection'
  })

  const validateConfigs = () => {
    let isValid = true
    let addressErrorShown = false

    const newConfigs = configs.map((config) => {
      let isConfigValid = true
      let addressError = ''

      const trimmedAddress = config.address.trim()

      if (trimmedAddress !== '') {
        if (title === 'Email Configuration' && !validateEmail(trimmedAddress)) {
          isConfigValid = false
          isValid = false
          addressError = 'Please enter a valid email'
        }
        if (
          title === 'Slack Configuration' &&
          !isValidSlackWebhookUrl(trimmedAddress)
        ) {
          isConfigValid = false
          isValid = false
          addressError = 'Please enter a valid slack webhook address'
        }
        if (
          title === 'Teams Configuration' &&
          !isValidTeamsWebhookUrl(trimmedAddress)
        ) {
          isConfigValid = false
          isValid = false
          addressError = 'Please enter a valid team webhook address'
        }
      }

      if (!isConfigValid && !addressErrorShown) {
        setErrorMessage(addressError)
        addressErrorShown = true
      }

      return {
        ...config,
        isValid: isConfigValid
      }
    })

    setConfigs(newConfigs)
    return isValid
  }

  useEffect(() => {
    if (data && !error) {
      const newConfigs = data.map((item) => ({
        address: item.connection?.configs[0]?.address || '',
        notificationType:
          item.connection?.configs[0]?.notificationType || 'All',
        frequency: item.connection?.configs[0]?.frequency || 'Instant',
        isValid: true
      }))

      setConfigs(newConfigs)
    }
  }, [data, error])

  const handleDelete = async () => {
    try {
      const res = await deleteConn({
        variables: {
          id: hostId,
          org: !!org
        }
      })

      const responseData = res?.data

      const connectionKey = Object.keys(responseData)?.[0] // Get the first key
      const errors = responseData?.[connectionKey]?.errors

      if (!errors || errors.length === 0) {
        setGreenCheck((prev) => ({ ...prev, [greenCheckKey]: false }))
        onClose()
        showToast({
          title: 'Configuration deleted.',
          description: `Your ${title} has been successfully deleted.`,
          status: 'success'
        })
        setErrorMessage(
          `Deletion failed. An error occurred: ${errors.join(', ')}`
        )
      } else {
        setErrorMessage(
          `Deletion failed. An error occurred: ${errors.join(', ')}`
        )
      }
    } catch (error) {
      setErrorMessage(`Deletion failed. Unexpected error: ${error.message}`)
    }
  }

  const getValidConfigs = () =>
    configs.filter((config) => config.address.trim() !== '')

  const hasDuplicates = (configs) => {
    const addresses = configs.map((config) => config.address)
    return new Set(addresses).size !== addresses.length
  }

  const getConfigsForMutation = (validConfigs) =>
    // eslint-disable-next-line no-unused-vars
    validConfigs.map(({ isValid, error, ...rest }) => rest)

  const handleMutationResponse = (res, actionText) => {
    const responseData = res?.data
    const connectionKey = Object.keys(responseData)?.[0]
    const errors = responseData?.[connectionKey]?.errors

    if (!errors || errors.length === 0) {
      setError(false)
      setGreenCheck((prev) => ({ ...prev, [greenCheckKey]: true }))
      onClose()
      showToast({
        title: `Configuration ${actionText}.`,
        description: `Your ${title} has been successfully ${actionText.toLowerCase()}.`,
        status: 'success'
      })
    } else {
      setError(true)
      setErrorMessage(`Saving failed. An error occurred: ${errors.join(', ')}`)
    }
  }

  const handleUpdate = async () => {
    const isValid = validateConfigs()
    if (!isValid) return

    const validConfigs = getValidConfigs()

    if (validConfigs.length === 0) {
      onClose()
      handleDelete()
      return
    }

    if (hasDuplicates(validConfigs)) {
      setErrorMessage('Duplicate address is not allowed.')
      return
    }

    const configsForMutation = getConfigsForMutation(validConfigs)

    try {
      const res = await updateConn({
        variables: {
          id: hostId,
          org: !!org,
          configs: configsForMutation
        }
      })
      handleMutationResponse(res, 'updated')
    } catch (error) {
      setErrorMessage(`Saving failed. Unexpected error: ${error.message}`)
    }
  }

  const handleSave = async () => {
    const isValid = validateConfigs()
    if (!isValid) return

    const validConfigs = getValidConfigs()

    if (validConfigs.length === 0) {
      setErrorMessage(
        'Missing configuration. Please enter a valid configuration.'
      )
      return
    }

    if (hasDuplicates(validConfigs)) {
      setErrorMessage(`Duplicate address is not allowed.`)
      return
    }

    const configsForMutation = getConfigsForMutation(validConfigs)

    try {
      const res = await createConn({
        variables: {
          org: org,
          configs: configsForMutation
        }
      })
      handleMutationResponse(res, 'saved')
    } catch (error) {
      setErrorMessage(`Saving failed. Unexpected error: ${error.message}`)
    }
  }

  const handleChange = (index, field, value) => {
    setErrorMessage('')
    const newConfigs = [...configs]
    newConfigs[index][field] = value
    setConfigs(newConfigs)
  }

  const hasExactDuplicateConfig = (data) => {
    for (let i = 0; i < data.length; i++) {
      for (let j = i + 1; j < data.length; j++) {
        if (
          data[i].address === data[j].address &&
          data[i].frequency === data[j].frequency &&
          data[i].notificationType === data[j].notificationType
        ) {
          return true // Similar row found
        }
      }
    }
    return false // No similar rows found
  }

  const handleAddConfig = () => {
    if (hasExactDuplicateConfig(configs)) {
      setErrorMessage(
        `A row with the empty or same values already exists. Please update or remove it before continue.`
      )
    } else {
      setErrorMessage('')
      setConfigs([
        ...configs,
        {
          address: '',
          notificationType: 'All',
          frequency: 'Instant',
          isValid: true
        }
      ])
    }
  }

  const handleRemoveConfig = (index) => {
    setErrorMessage('')
    if (configs.length === 1) {
      setConfigs([
        {
          address: '',
          notificationType: 'All',
          frequency: 'Instant',
          isValid: true
        }
      ])
      return
    }
    const newConfigs = configs.filter((_, i) => i !== index)
    setConfigs(newConfigs)
  }

  const selectStyles = {
    container: (baseStyles) => ({
      ...baseStyles,
      minWidth: '140px'
    })
  }

  return (
    <LynkModal
      Icon={IoSettingsOutline}
      title={title}
      isOpen={isOpen}
      onClose={onClose}
      buttonText='Save'
      isLoading={createLoading || updateLoading}
      onSubmit={data ? handleUpdate : handleSave}
      disabled={!updateCon || errorMessage !== ''}
    >
      <Stack spacing={4}>
        {configs.map((config, index) => {
          const { address, frequency, notificationType, error } = config || {}

          return (
            <HStack key={index} width='100%' alignItems='start'>
              <FormControl isInvalid={error}>
                <Box position='relative'>
                  <Input
                    value={address}
                    isDisabled={!updateCon}
                    placeholder={addressPlaceholder}
                    onChange={(e) =>
                      handleChange(index, 'address', e.target.value)
                    }
                  />
                  <FormErrorMessage>{config?.error}</FormErrorMessage>
                </Box>
              </FormControl>
              <LynkSelect
                isDisabled={!updateCon}
                value={options.find((opt) => opt.value === notificationType)}
                onChange={(item) =>
                  handleChange(index, 'notificationType', item.value)
                }
                options={options}
                dropDown
                styles={selectStyles}
              />
              <LynkSelect
                isDisabled={!updateCon}
                value={{ value: frequency, label: frequency }}
                onChange={(item) =>
                  handleChange(index, 'frequency', item.value)
                }
                options={[{ value: 'Instant', label: 'Instant' }]}
                dropDown
                styles={selectStyles}
              />
              {updateCon && configs?.length > 1 && (
                <DeleteButton
                  onClick={() => handleRemoveConfig(index)}
                  isLoading={deleteLoading}
                  aria-label={'Delete configuration'}
                />
              )}
            </HStack>
          )
        })}
        {updateCon && (
          <Button
            title='Add new connection'
            onClick={handleAddConfig}
            alignSelf={'flex-start'}
            paddingLeft={'2px'}
            fontSize={'sm'}
            colorScheme='blue'
            variant='link'
            fontWeight={'medium'}
            leftIcon={<LuCirclePlus size={18} />}
          >
            Add New
          </Button>
        )}
        {errorMessage !== '' && <LynkAlert msg={errorMessage} />}
      </Stack>
    </LynkModal>
  )
}

export default ConfigModal
