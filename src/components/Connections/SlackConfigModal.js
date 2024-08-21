import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'

import { AddIcon, DeleteIcon, MinusIcon } from '@chakra-ui/icons'
import {
  Button,
  Flex,
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
  CreateSlackConnection,
  DeleteSlackConnection,
  UpdateSlackConnection
} from '../../graphQL/Mutation'

const SlackConfigModal = ({
  isOpen,
  onClose,
  data,
  setGreenCheck,
  updateCon,
  org,
  hostId
}) => {
  const { showToast } = useCustomToast()

  const [updateSlackConnection] = useMutation(UpdateSlackConnection)
  const [createSlackConnection] = useMutation(CreateSlackConnection)
  const [deleteSlackConnection] = useMutation(DeleteSlackConnection)

  const [configs, setConfigs] = useState([
    { address: '', notificationType: 'All', frequency: 'Instant' }
  ])

  const bgColor = useColorModeValue('gray.400', 'gray.200')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  useEffect(() => {
    if (data) {
      const newConfigs = data.map((item) => ({
        address: item.connection?.configs[0]?.address,
        notificationType: item.connection?.configs[0]?.notificationType,
        frequency: item.connection?.configs[0]?.frequency
      }))

      // Update state with the new configurations
      setConfigs(newConfigs)
    }
  }, [data])

  const handleUpdate = () => {
    const validConfigs = configs.filter(
      (config) => config.address.trim() !== ''
    )
    if (validConfigs.length === 0) {
      handleDelete()
      onClose()
      return
    }
    updateSlackConnection({
      variables: {
        id: hostId,
        org: !!org,
        configs: validConfigs
      }
    }).then((res) => {
      if (res?.data?.slackConnectionUpdate?.errors?.length === 0) {
        setGreenCheck((prev) => ({ ...prev, slack: true }))
        onClose()
        showToast({
          title: 'Configuration saved.',
          description:
            'Your Slack configuration has been successfully updated.',
          status: 'success'
        })
      } else {
        showToast({
          title: 'Saving failed.',
          description:
            'An error occurred while updating your Slack configuration.',
          status: 'error'
        })
      }
    })
  }

  const handleDelete = () => {
    deleteSlackConnection({
      variables: {
        id: hostId,
        org: !!org
      }
    }).then((res) => {
      if (res?.data?.slackConnectionDelete?.errors?.length === 0) {
        setGreenCheck((prev) => ({ ...prev, slack: false }))
        onClose()
        showToast({
          title: 'Configuration deleted.',
          description:
            'Your Slack configuration has been successfully deleted.',
          status: 'success'
        })
      } else {
        showToast({
          title: 'Deletion failed.',
          description:
            'An error occurred while deleting your Slack configuration.',
          status: 'error'
        })
      }
    })
  }

  const handleSave = () => {
    const validConfigs = configs.filter(
      (config) => config.address.trim() !== ''
    )

    if (validConfigs.length === 0) {
      handleDelete()
      onClose()
      return
    }

    createSlackConnection({
      variables: {
        org: !!org,
        configs: validConfigs
      }
    }).then((res) => {
      if (res?.data?.slackConnectionCreate?.errors?.length === 0) {
        setGreenCheck((prev) => ({ ...prev, slack: true }))
        onClose()
        showToast({
          title: 'Configuration saved.',
          description: 'Your Slack configuration has been successfully saved.',
          status: 'success'
        })
      } else {
        showToast({
          title: 'Saving failed.',
          description:
            'An error occurred while saving your Slack configuration.',
          status: 'error'
        })
      }
    })
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
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={data ? handleUpdate : handleSave}
      title='Slack Configuration'
      buttonText='Save'
      Icon={IoSettingsOutline}
      type='configuration'
      disabled={!updateCon}
    >
      <VStack spacing={4}>
        {configs.map((config, index) => (
          <HStack key={index} width='100%'>
            <Input
              placeholder='Paste Slack Webhook URL'
              value={config.address}
              onChange={(e) => handleChange(index, 'address', e.target.value)}
              isDisabled={!updateCon}
            />
            <Select
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
              value={config.frequency}
              onChange={(e) => handleChange(index, 'frequency', e.target.value)}
              isDisabled={!updateCon}
            >
              <option value='Instant'>Instant</option>
            </Select>

            <IconButton
              aria-label='Remove config'
              icon={<Icon color={'#E53E3E'} w={6} h={6} as={MdDeleteOutline} />}
              onClick={() => handleRemoveConfig(index)}
              isDisabled={!updateCon}
              border='1px solid'
              borderColor={borderColor}
              colorScheme='white'
            />
          </HStack>
        ))}
      </VStack>
      <Button
        aria-label='Add config'
        onClick={handleAddConfig}
        isDisabled={!updateCon}
        colorScheme='white'
        textColor='blue.500'
        leftIcon={<AddIcon />}
        marginTop='10px'
        fontWeight='500'
        paddingLeft={'2px'}
      >
        Add New
      </Button>
    </LynkModal>
  )
}

export default SlackConfigModal
