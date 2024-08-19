import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'

import { AddIcon } from '@chakra-ui/icons'
import {
  Button,
  Flex,
  HStack,
  Icon,
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
  VStack,
  useColorModeValue
} from '@chakra-ui/react'

import useCustomToast from 'hooks/useCustomToast'

import { IoSettingsOutline } from 'react-icons/io5'
import { MdDeleteOutline } from 'react-icons/md'

import {
  CreateTeamsConnection,
  DeleteTeamsConnection,
  UpdateTeamsConnection
} from '../../graphQL/Mutation'

const TeamsConfigModal = ({
  isOpen,
  onClose,
  data,
  setGreenCheck,
  updateCon,
  org,
  hostId
}) => {
  const { showToast } = useCustomToast()

  const [updateTeamsConnection] = useMutation(UpdateTeamsConnection)
  const [createTeamsConnection] = useMutation(CreateTeamsConnection)
  const [deleteTeamsConnection] = useMutation(DeleteTeamsConnection)

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
    updateTeamsConnection({
      variables: {
        id: hostId,
        org: !!org,
        configs: validConfigs
      }
    }).then((res) => {
      if (res?.data?.teamsConnectionUpdate?.errors?.length === 0) {
        setGreenCheck((prev) => ({ ...prev, teams: true }))
        onClose()
        showToast({
          title: 'Configuration saved.',
          description:
            'Your Teams configuration has been successfully updated.',
          status: 'success'
        })
      } else {
        showToast({
          title: 'Saving failed.',
          description:
            'An error occurred while updating your Teams configuration.',
          status: 'error'
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
        showToast({
          title: 'Configuration deleted.',
          description:
            'Your Teams configuration has been successfully deleted.',
          status: 'success'
        })
      } else {
        showToast({
          title: 'Deletion failed.',
          description:
            'An error occurred while deleting your Teams configuration.',
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

    createTeamsConnection({
      variables: {
        org: !!org,
        configs: validConfigs
      }
    }).then((res) => {
      if (res?.data?.teamsConnectionCreate?.errors?.length === 0) {
        setGreenCheck((prev) => ({ ...prev, teams: true }))
        onClose()
        showToast({
          title: 'Configuration saved.',
          description: 'Your Teams configuration has been successfully saved.',
          status: 'success'
        })
      } else {
        showToast({
          title: 'Saving failed.',
          description:
            'An error occurred while saving your Teams configuration.',
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
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent maxW='800px' minH='400px'>
        <Flex
          alignItems={'center'}
          padding={'16px 20px'}
          borderBottom='1px solid'
          borderColor={borderColor}
        >
          <Icon color={bgColor} w={6} h={6} as={IoSettingsOutline} />
          <ModalHeader paddingLeft={'8px'} minW={'50%'}>
            Teams Configuration
          </ModalHeader>

          <ModalCloseButton
            w={8}
            h={8}
            marginTop={'20px'}
            marginRight={'16px'}
            color={bgColor}
          />
        </Flex>

        <ModalBody
          padding={'20px'}
          borderBottom='1px solid'
          borderColor={borderColor}
        >
          <VStack spacing={4}>
            {configs.map((config, index) => (
              <HStack key={index} width='100%'>
                <Input
                  placeholder='Paste Teams Webhook URL'
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
                  aria-label='Remove config'
                  icon={
                    <Icon color={'#E53E3E'} w={6} h={6} as={MdDeleteOutline} />
                  }
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
            leftIcon={<AddIcon />}
            marginTop='10px'
            fontWeight='500'
            textColor={'blue.500'}
            paddingLeft={'2px'}
          >
            Add New
          </Button>
        </ModalBody>
        <ModalFooter>
          <Button
            ml={3}
            colorScheme='white'
            onClick={() => onClose()}
            isDisabled={!updateCon}
            textColor={bgColor}
          >
            Cancel
          </Button>

          <Button
            colorScheme='blue'
            onClick={() => (data ? handleUpdate() : handleSave())}
            isDisabled={configs.length === 0 || !updateCon}
            marginLeft={'10px'}
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default TeamsConfigModal
