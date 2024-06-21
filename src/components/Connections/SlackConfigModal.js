import { useLazyQuery, useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'

import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useToast
} from '@chakra-ui/react'

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
  refetch
}) => {
  const toast = useToast()

  const [slackWebhook, setSlackWebhook] = useState('')

  const [updateSlackConnection] = useMutation(UpdateSlackConnection)
  const [createSlackConnection] = useMutation(CreateSlackConnection)
  const [deleteSlackConnection] = useMutation(DeleteSlackConnection)

  const [isUrlChanged, setIsUrlChanged] = useState(false)

  useEffect(() => {
    if (data) {
      setSlackWebhook(data.connection?.url)
    }
  }, [data])

  const handleSave = () => {
    createSlackConnection({
      variables: {
        url: slackWebhook
      }
    }).then((res) => {
      if (res?.data?.slackConnectionCreate?.errors?.length === 0) {
        setGreenCheck((prev) => ({ ...prev, slack: true }))
        refetch()
        onClose()
        toast({
          title: 'Configuration saved.',
          description: 'Your Slack configuration has been successfully saved.',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top'
        })
      } else {
        toast({
          title: 'Saving failed.',
          description:
            'An error occurred while saving your Slack configuration.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top'
        })
      }
    })
  }

  const handleUpdate = () => {
    updateSlackConnection({
      variables: {
        id: data?.id,
        url: slackWebhook
      }
    }).then((res) => {
      if (res?.data?.slackConnectionUpdate?.errors?.length === 0) {
        setGreenCheck((prev) => ({ ...prev, slack: true }))
        refetch()
        onClose()
        toast({
          title: 'Configuration saved.',
          description:
            'Your Slack configuration has been successfully updated.',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top'
        })
      } else {
        toast({
          title: 'Saving failed.',
          description:
            'An error occurred while updating your Slack configuration.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top'
        })
      }
    })
  }

  const handleDelete = () => {
    deleteSlackConnection({
      variables: {
        organizationConnectionId: data?.id
      }
    }).then((res) => {
      if (res?.data?.slackConnectionDelete?.errors?.length === 0) {
        setGreenCheck((prev) => ({ ...prev, slack: false }))
        refetch()
        onClose()
        toast({
          title: 'Configuration deleted.',
          description:
            'Your Slack configuration has been successfully deleted.',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top'
        })
      } else {
        // handle failure
        toast({
          title: 'Deletion failed.',
          description:
            'An error occurred while deleting your Slack configuration.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top'
        })
      }
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Slack Configuration</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Input
            placeholder='Paste Slack Webhook URL'
            color='gray.600'
            value={slackWebhook}
            onChange={(e) => {
              setSlackWebhook(e.target.value)
              setIsUrlChanged(true)
            }}
          />
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme='blue'
            mr={3}
            onClick={() => (data ? handleUpdate() : handleSave())}
            isDisabled={!slackWebhook || !isUrlChanged}
          >
            Save
          </Button>
          <Button
            colorScheme='red'
            mr={3}
            onClick={handleDelete}
            isDisabled={!data}
          >
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default SlackConfigModal
