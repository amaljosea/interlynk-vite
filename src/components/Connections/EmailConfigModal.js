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
  CreateEmailConnection,
  DeleteEmailConnection,
  UpdateEmailConnection
} from '../../graphQL/Mutation'

const EmailConfigModal = ({ isOpen, onClose, data, setGreenCheck, refetch, updateCon, org, hostId }) => {
  const toast = useToast()

  const [updateEmailConnection] = useMutation(UpdateEmailConnection)
  const [createEmailConnection] = useMutation(CreateEmailConnection)
  const [deleteEmailConnection] = useMutation(DeleteEmailConnection)

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
    createEmailConnection({
      variables: {
        org: !!org,
        configs: configs
      }
    }).then((res) => {
      if (res?.data?.emailConnectionCreate?.errors?.length === 0) {
        setGreenCheck((prev) => ({ ...prev, email: true }))
        refetch()
        onClose()
        toast({
          title: 'Configuration saved.',
          description: 'Your Email configuration has been successfully saved.',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top'
        })
      } else {
        toast({
          title: 'Saving failed.',
          description:
            'An error occurred while saving your Email configuration.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top'
        })
      }
    })
  }

  const handleUpdate = () => {
    updateEmailConnection({
      variables: {
        id: hostId,
        org: !!org,
        configs: configs
      }
    }).then((res) => {
      if (res?.data?.emailConnectionUpdate?.errors?.length === 0) {
        setGreenCheck((prev) => ({ ...prev, email: true }))
        refetch()
        onClose()
        toast({
          title: 'Configuration saved.',
          description:
            'Your Email configuration has been successfully updated.',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top'
        })
      } else {
        toast({
          title: 'Saving failed.',
          description:
            'An error occurred while updating your Email configuration.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top'
        })
      }
    })
  }

  const handleDelete = () => {
    deleteEmailConnection({
      variables: {
        id: hostId,
        org: !!org
      }
    }).then((res) => {
      if (res?.data?.emailConnectionDelete?.errors?.length === 0) {
        setGreenCheck((prev) => ({ ...prev, email: false }))
        refetch()
        onClose()
        toast({
          title: 'Configuration deleted.',
          description:
            'Your Email configuration has been successfully deleted.',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top'
        })
      } else {
        toast({
          title: 'Deletion failed.',
          description:
            'An error occurred while deleting your Email configuration.',
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
        <ModalHeader>Email Configuration</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            {configs.map((config, index) => (
              <HStack key={index} width="100%">
                <Input
                  placeholder='Paste Email Webhook URL'
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

export default EmailConfigModal