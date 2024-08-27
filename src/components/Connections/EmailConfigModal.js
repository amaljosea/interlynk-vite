import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'

import { AddIcon } from '@chakra-ui/icons'
import {
  Button,
  HStack,
  Icon,
  IconButton,
  Input,
  Select,
  VStack,
  useColorModeValue
} from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'

import { IoSettingsOutline } from 'react-icons/io5'
import { MdDeleteOutline } from 'react-icons/md'

import {
  CreateEmailConnection,
  DeleteEmailConnection,
  UpdateEmailConnection
} from '../../graphQL/Mutation'

const EmailConfigModal = ({
  isOpen,
  onClose,
  data,
  setGreenCheck,
  updateCon,
  org,
  hostId
}) => {
  const { showToast } = useCustomToast()

  const [updateEmailConnection] = useMutation(UpdateEmailConnection)
  const [createEmailConnection] = useMutation(CreateEmailConnection)
  const [deleteEmailConnection] = useMutation(DeleteEmailConnection)

  const [configs, setConfigs] = useState([
    { address: '', notificationType: 'All', frequency: 'Instant' }
  ])

  const borderColor = useColorModeValue('gray.200', 'gray.600')

  useEffect(() => {
    if (data) {
      const newConfigs = data.map((item) => ({
        address: item.connection?.configs[0]?.address || '',
        notificationType:
          item.connection?.configs[0]?.notificationType || 'All',
        frequency: item.connection?.configs[0]?.frequency || 'Instant'
      }))

      setConfigs(newConfigs)
    }
  }, [data])

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
    // Check for duplicates
    if (hasDuplicates(validConfigs)) {
      showToast({
        title: 'Saving failed.',
        description: 'Duplicate Email Address is not allowed.',
        status: 'error'
      })
      return
    }

    try {
      const res = await updateEmailConnection({
        variables: {
          id: hostId,
          org: !!org,
          configs: validConfigs
        }
      })

      const errors = res?.data?.emailConnectionUpdate?.errors

      if (!errors || errors.length === 0) {
        setGreenCheck((prev) => ({ ...prev, email: true }))
        onClose()
        showToast({
          title: 'Configuration saved.',
          description:
            'Your Email configuration has been successfully updated.',
          status: 'success'
        })
      } else {
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

  const handleDelete = async () => {
    if (!data) {
      showToast({
        title: 'Configuration saved.',
        description: 'Your Email configuration has been successfully saved.',
        status: 'success'
      })
      return
    }

    try {
      const res = await deleteEmailConnection({
        variables: {
          id: hostId,
          org: !!org
        }
      })

      const errors = res?.data?.emailConnectionDelete?.errors

      if (!errors || errors.length === 0) {
        setGreenCheck((prev) => ({ ...prev, email: false }))
        onClose()
        showToast({
          title: 'Configuration deleted.',
          description:
            'Your Email configuration has been successfully deleted.',
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

  const handleSave = async () => {
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
    // Check for duplicates
    if (hasDuplicates(validConfigs)) {
      showToast({
        title: 'Saving failed.',
        description: 'Duplicate Email Address is not allowed.',
        status: 'error'
      })
      return
    }

    try {
      const res = await createEmailConnection({
        variables: {
          org: !!org,
          configs: validConfigs
        }
      })

      const errors = res?.data?.emailConnectionCreate?.errors

      if (!errors || errors.length === 0) {
        setGreenCheck((prev) => ({ ...prev, email: true }))
        onClose()
        showToast({
          title: 'Configuration saved.',
          description: 'Your Email configuration has been successfully saved.',
          status: 'success'
        })
      } else {
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
    setConfigs(newConfigs)
  }

  const handleAddConfig = () => {
    setConfigs([
      ...configs,
      { address: '', notificationType: 'All', frequency: 'Instant' }
    ])
  }

  const handleRemoveConfig = (index) => {
    if (configs.length === 1) {
      setConfigs([
        { address: '', notificationType: 'All', frequency: 'Instant' }
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
      Icon={IoSettingsOutline}
      title='Email Configuration'
      disabled={!updateCon}
      onSubmit={data ? handleUpdate : handleSave}
    >
      <VStack spacing={4}>
        {configs.map((config, index) => (
          <HStack key={index} width='100%'>
            <Input
              w={'320px'}
              placeholder='Paste Email Webhook URL'
              value={config.address}
              onChange={(e) => handleChange(index, 'address', e.target.value)}
              isDisabled={!updateCon}
            />
            <Select
              w={'150px'}
              value={config.notificationType}
              onChange={(e) =>
                handleChange(index, 'notificationType', e.target.value)
              }
              isDisabled={!updateCon}
            >
              <option value='All'>All</option>
              <option value='Alert'>Alert</option>
              <option value='Warning'>Warning</option>
              <option value='Info'>Info</option>
            </Select>
            <Select
              w={'150px'}
              value={config.frequency}
              onChange={(e) => handleChange(index, 'frequency', e.target.value)}
              isDisabled={!updateCon}
            >
              <option value='Instant'>Instant</option>
            </Select>

            <IconButton
              border='1px solid'
              colorScheme='white'
              isDisabled={!updateCon}
              borderColor={borderColor}
              aria-label='Remove config'
              onClick={() => handleRemoveConfig(index)}
              icon={<Icon color={'#E53E3E'} w={6} h={6} as={MdDeleteOutline} />}
            />
          </HStack>
        ))}
      </VStack>

      <Button
        aria-label='Add config'
        onClick={handleAddConfig}
        isDisabled={!updateCon}
        colorScheme='white'
        leftIcon={<AddIcon />}
        marginTop='10px'
        fontWeight='500'
        textColor={'blue.500'}
        paddingLeft={'2px'}
      >
        Add New
      </Button>
    </LynkModal>
  )
}

export default EmailConfigModal
