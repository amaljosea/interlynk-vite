import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'

import {
  Box,
  Button,
  HStack,
  Icon,
  IconButton,
  Input,
  Select,
  Text,
  VStack
} from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'
import { useThemeColor } from 'hooks/useThemeColors'

import { FaPlus } from 'react-icons/fa6'
import { MdDeleteOutline } from 'react-icons/md'

const ConfigModal = ({
  isOpen,
  onClose,
  data,
  setGreenCheck,
  updateCon,
  org,
  hostId,
  createConnection,
  updateConnection,
  deleteConnection,
  validateAddress,
  title,
  addressPlaceholder,
  icon,
  options,
  greenCheckKey
}) => {
  const { showToast } = useCustomToast()
  const [error, setError] = useState(false)

  const [updateConn] = useMutation(updateConnection)
  const [createConn] = useMutation(createConnection)
  const [deleteConn] = useMutation(deleteConnection)

  const [configs, setConfigs] = useState([
    {
      address: '',
      notificationType: 'All',
      frequency: 'Instant',
      isValid: true
    }
  ])

  const { grayBorderColor, primaryErrorColor } = useThemeColor([
    'grayBorderColor',
    'primaryErrorColor'
  ])

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
      console.log(responseData)
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
      } else {
        showToast({
          title: 'Deletion failed.',
          description: `An error occurred: ${errors.join(', ')}`,
          status: 'error'
        })
      }
    } catch (error) {
      showToast({
        title: 'Deletion failed.',
        description: `Unexpected error: ${error.message}`,
        status: 'error'
      })
    }
  }

  const handleUpdate = async () => {
    const validConfigs = configs.filter(
      (config) => config.address.trim() !== ''
    )

    const hasDuplicates = (configs) => {
      const addresses = configs.map((config) => config.address)
      return new Set(addresses).size !== addresses.length
    }

    if (validConfigs.length === 0) {
      onClose()
      handleDelete()
      return
    }

    if (hasDuplicates(validConfigs)) {
      showToast({
        title: 'Saving failed.',
        description: 'Duplicate address is not allowed.',
        status: 'error'
      })
      return
    }

    const configsForMutation = validConfigs.map(
      // eslint-disable-next-line no-unused-vars
      ({ isValid, error, ...rest }) => rest
    )
    console.log(configsForMutation)
    try {
      const res = await updateConn({
        variables: {
          id: hostId,
          org: !!org,
          configs: configsForMutation
        }
      })

      const responseData = res?.data
      const connectionKey = Object.keys(responseData)?.[0] // Get the first key
      const errors = responseData?.[connectionKey]?.errors
      console.log(errors)

      if (!errors || errors.length === 0) {
        setError(false)
        setGreenCheck((prev) => ({ ...prev, [greenCheckKey]: true }))
        onClose()
        showToast({
          title: 'Configuration saved.',
          description: `Your ${title} has been successfully updated.`,
          status: 'success'
        })
      } else {
        setError(true)
        showToast({
          title: 'Saving failed.',
          description: `An error occurred: ${errors.join(', ')}`,
          status: 'error'
        })
      }
    } catch (error) {
      showToast({
        title: 'Saving failed.',
        description: `Unexpected error: ${error.message}`,
        status: 'error'
      })
    }
  }

  const handleSave = async () => {
    const validConfigs = configs.filter(
      (config) => config.address.trim() !== ''
    )

    const hasDuplicates = (configs) => {
      const addresses = configs.map((config) => config.address)
      return new Set(addresses).size !== addresses.length
    }

    if (validConfigs.length === 0) {
      showToast({
        title: 'Missing configuration',
        description: 'Please enter a valid configuration.',
        status: 'warning'
      })
      return
    }

    if (hasDuplicates(validConfigs)) {
      showToast({
        title: 'Saving failed.',
        description: 'Duplicate address is not allowed.',
        status: 'error'
      })
      return
    }

    const configsForMutation = validConfigs.map(
      // eslint-disable-next-line no-unused-vars
      ({ isValid, error, ...rest }) => rest
    )

    try {
      const res = await createConn({
        variables: {
          org: !!org,
          configs: configsForMutation
        }
      })

      const responseData = res?.data
      const connectionKey = Object.keys(responseData)?.[0] // Get the first key
      const errors = responseData?.[connectionKey]?.errors

      if (!errors || errors.length === 0) {
        setError(false)
        setGreenCheck((prev) => ({ ...prev, [greenCheckKey]: true }))
        onClose()
        showToast({
          title: 'Configuration saved.',
          description: `Your ${title} has been successfully saved.`,
          status: 'success'
        })
      } else {
        setError(true)
        showToast({
          title: 'Saving failed.',
          description: `An error occurred: ${errors.join(', ')}`,
          status: 'error'
        })
      }
    } catch (error) {
      showToast({
        title: 'Saving failed.',
        description: `Unexpected error: ${error.message}`,
        status: 'error'
      })
    }
  }

  const handleChange = (index, field, value) => {
    const newConfigs = [...configs]
    newConfigs[index][field] = value
    if (field === 'address') {
      if (validateAddress(value)) {
        newConfigs[index].error = ''
        newConfigs[index].isValid = true
      } else {
        newConfigs[index].error = 'Invalid address'
        newConfigs[index].isValid = false
      }
    }
    setConfigs(newConfigs)
  }

  const handleAddConfig = () => {
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

  const handleRemoveConfig = (index) => {
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

  return (
    <LynkModal
      type='default'
      isOpen={isOpen}
      onClose={onClose}
      buttonText='Save'
      isLoading={false}
      Icon={icon}
      title={title}
      disabled={!updateCon}
      onSubmit={data ? handleUpdate : handleSave}
    >
      <VStack>
        {configs.map((config, index) => (
          <HStack key={index} width='100%' pb={2}>
            <Box position={'relative'}>
              <Input
                w={'270px'}
                placeholder={addressPlaceholder}
                value={config.address}
                onChange={(e) => handleChange(index, 'address', e.target.value)}
                borderColor={
                  !config.isValid ? primaryErrorColor : grayBorderColor
                }
                isDisabled={!updateCon}
              />
              {config.error && (
                <Text
                  color={primaryErrorColor}
                  fontSize='sm'
                  position={'absolute'}
                >
                  {config.error}
                </Text>
              )}
            </Box>
            <Select
              value={config.notificationType}
              onChange={(e) =>
                handleChange(index, 'notificationType', e.target.value)
              }
              isDisabled={!updateCon}
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select
              value={config.frequency}
              onChange={(e) => handleChange(index, 'frequency', e.target.value)}
              isDisabled={!updateCon}
            >
              <option value='Instant'>Instant</option>
            </Select>
            {updateCon && (
              <IconButton
                border='1px solid'
                borderColor={grayBorderColor}
                variant={'ghost'}
                aria-label='Delete configuration'
                onClick={() => handleRemoveConfig(index)}
                icon={
                  <Icon
                    as={MdDeleteOutline}
                    w={5}
                    h={5}
                    color={primaryErrorColor}
                  />
                }
              />
            )}
          </HStack>
        ))}
        {updateCon && (
          <Button
            onClick={handleAddConfig}
            alignSelf={'flex-start'}
            paddingLeft={'2px'}
            fontSize={'sm'}
            colorScheme='blue'
            variant='link'
            fontWeight={'medium'}
            leftIcon={<FaPlus />}
          >
            Add New
          </Button>
        )}
      </VStack>
    </LynkModal>
  )
}

export default ConfigModal
