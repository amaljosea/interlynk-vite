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
  CreateTeamsConnection,
  DeleteTeamsConnection,
  UpdateTeamsConnection
} from 'graphQL/Mutation'

const TeamsConfigModal = ({
  isOpen,
  onClose,
  data,
  setGreenCheck,
  refetch
}) => {
  const toast = useToast()

  const [teamsWebhook, setTeamsWebhook] = useState('')

  const [updateTeamsConnection] = useMutation(UpdateTeamsConnection)
  const [createTeamsConnection] = useMutation(CreateTeamsConnection)
  const [deleteTeamsConnection] = useMutation(DeleteTeamsConnection)

  const [isUrlChanged, setIsUrlChanged] = useState(false)

  useEffect(() => {
    if (data) {
      setTeamsWebhook(data.connection?.url)
    }
  }, [data])

  const handleSave = () => {
    createTeamsConnection({
      variables: {
        url: teamsWebhook
      }
    }).then((res) => {
      if (res?.data?.teamsConnectionCreate?.errors?.length === 0) {
        setGreenCheck((prev) => ({ ...prev, teams: true }))
        refetch()
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
        id: data?.id,
        url: teamsWebhook
      }
    }).then((res) => {
      if (res?.data?.teamsConnectionUpdate?.errors?.length === 0) {
        setGreenCheck((prev) => ({ ...prev, teams: true }))
        refetch()
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
        organizationConnectionId: data?.id
      }
    }).then((res) => {
      if (res?.data?.teamsConnectionDelete?.errors?.length === 0) {
        setGreenCheck((prev) => ({ ...prev, teams: false }))
        refetch()
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
        // handle failure
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

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Teams Configuration</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Input
            placeholder='Paste Teams Webhook URL'
            color='gray.600'
            value={teamsWebhook}
            onChange={(e) => {
              setTeamsWebhook(e.target.value)
              setIsUrlChanged(true)
            }}
          />
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme='blue'
            mr={3}
            onClick={() => (data ? handleUpdate() : handleSave())}
            isDisabled={!teamsWebhook || !isUrlChanged}
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

export default TeamsConfigModal
