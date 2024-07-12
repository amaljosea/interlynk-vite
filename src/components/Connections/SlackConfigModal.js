import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
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
  refetch,
  updateCon
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
            isDisabled={!updateCon}
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
            onClick={() => (data ? handleUpdate() : handleSave())}
            isDisabled={!slackWebhook || !isUrlChanged || !updateCon}
          >
            Save
          </Button>
          <Button
            ml={3}
            colorScheme='red'
            onClick={handleDelete}
            isDisabled={!updateCon}
            display={data ? 'flex' : 'none'}
          >
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default SlackConfigModal
