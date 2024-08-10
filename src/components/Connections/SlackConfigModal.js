import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'

import { AddIcon, MinusIcon } from '@chakra-ui/icons'
import {
  Button,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  VStack
} from '@chakra-ui/react'

import useCustomToast from 'hooks/useCustomToast'

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
  refetch,
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

  useEffect(() => {
    if (data) {
      setConfigs(
        data.map((item) => ({
          address: item.connection?.configs[0]?.address,
          notificationType: item.connection?.configs[0]?.notificationType,
          frequency: item.connection?.configs[0]?.frequency
        }))
      )
    }
  }, [data])

  const handleSave = () => {
    createSlackConnection({
      variables: {
        org: !!org,
        configs: configs
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

  const handleUpdate = () => {
    updateSlackConnection({
      variables: {
        id: hostId,
        org: !!org,
        configs: configs
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
    const newConfigs = configs.filter((_, i) => i !== index)
    setConfigs(newConfigs)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent maxW='800px'>
        <ModalHeader>Slack Configuration</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            {configs.map((config, index) => (
              <HStack key={index} width='100%'>
                <Input
                  placeholder='Paste Slack Webhook URL'
                  value={config.address}
                  onChange={(e) =>
                    handleChange(index, 'address', e.target.value)
                  }
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
                  onChange={(e) =>
                    handleChange(index, 'frequency', e.target.value)
                  }
                  isDisabled={!updateCon}
                >
                  <option value='Instant'>Instant</option>
                </Select>
                <IconButton
                  aria-label='Add config'
                  icon={<AddIcon />}
                  onClick={handleAddConfig}
                  isDisabled={!updateCon}
                />
                {configs.length > 1 && (
                  <IconButton
                    aria-label='Remove config'
                    icon={<MinusIcon />}
                    onClick={() => handleRemoveConfig(index)}
                    isDisabled={!updateCon}
                  />
                )}
              </HStack>
            ))}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme='blue'
            onClick={() => (data ? handleUpdate() : handleSave())}
            isDisabled={configs.length === 0 || !updateCon}
          >
            Save
          </Button>
          {data && (
            <Button
              ml={3}
              colorScheme='red'
              onClick={handleDelete}
              isDisabled={!updateCon}
            >
              Delete
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default SlackConfigModal
