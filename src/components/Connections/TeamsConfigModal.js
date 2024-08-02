import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import {
  Button,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
  VStack,
  HStack,
  Select,
} from '@chakra-ui/react'
import { AddIcon, MinusIcon } from '@chakra-ui/icons'

import {
  CreateTeamsConnection,
  DeleteTeamsConnection,
  UpdateTeamsConnection
} from '../../graphQL/Mutation'

const TeamsConfigModal = ({ isOpen, onClose, data, setGreenCheck, updateCon, org, hostId }) => {
  const toast = useToast()

  const [updateTeamsConnection] = useMutation(UpdateTeamsConnection)
  const [createTeamsConnection] = useMutation(CreateTeamsConnection)
  const [deleteTeamsConnection] = useMutation(DeleteTeamsConnection)

  const [configs, setConfigs] = useState([{ address: '', notificationType: 'All', frequency: 'Instant' }])

  useEffect(() => {
    if (data) {
      setConfigs(data.map(item => ({
        address: item.connection?.configs[0]?.address,
        notificationType: item.connection?.configs[0]?.notificationType,
        frequency: item.connection?.configs[0]?.frequency
      })))
    }
  }, [data])

  const handleSave = () => {
    createTeamsConnection({
      variables: {
        org: !!org,
        configs: configs
      }
    }).then((res) => {
      if (res?.data?.teamsConnectionCreate?.errors?.length === 0) {
        setGreenCheck((prev) => ({ ...prev, teams: true }))
        onClose()
        toast({
          title: 'Configuration saved.',
          description: 'Your Teams configuration has been successfully saved.',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top'
        })
      } else {
        toast({
          title: 'Saving failed.',
          description:
            'An error occurred while saving your Teams configuration.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top'
        })
      }
    })
  }

  const handleUpdate = () => {
    updateTeamsConnection({
      variables: {
        id: hostId,
        org: !!org,
        configs: configs
      }
    }).then((res) => {
      if (res?.data?.teamsConnectionUpdate?.errors?.length === 0) {
        setGreenCheck((prev) => ({ ...prev, teams: true }))
        onClose()
        toast({
          title: 'Configuration saved.',
          description:
            'Your Teams configuration has been successfully updated.',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top'
        })
      } else {
        toast({
          title: 'Saving failed.',
          description:
            'An error occurred while updating your Teams configuration.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top'
        })
      }
    })
  }

  const handleDelete = () => {
    deleteTeamsConnection({
      variables: {
        id: hostId,
        org: !!org
      }
    }).then((res) => {
      if (res?.data?.teamsConnectionDelete?.errors?.length === 0) {
        setGreenCheck((prev) => ({ ...prev, teams: false }))
        onClose()
        toast({
          title: 'Configuration deleted.',
          description:
            'Your Teams configuration has been successfully deleted.',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top'
        })
      } else {
        toast({
          title: 'Deletion failed.',
          description:
            'An error occurred while deleting your Teams configuration.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top'
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
    setConfigs([...configs, { address: '', notificationType: 'All', frequency: 'Instant' }])
  }

  const handleRemoveConfig = (index) => {
    const newConfigs = configs.filter((_, i) => i !== index)
    setConfigs(newConfigs)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent maxW="800px">
        <ModalHeader>Teams Configuration</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            {configs.map((config, index) => (
              <HStack key={index} width="100%">
                <Input
                  placeholder='Paste Teams Webhook URL'
                  value={config.address}
                  onChange={(e) => handleChange(index, 'address', e.target.value)}
                  isDisabled={!updateCon}
                />
                <Select
                  value={config.notificationType}
                  onChange={(e) => handleChange(index, 'notificationType', e.target.value)}
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

export default TeamsConfigModal