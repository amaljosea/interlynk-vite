import { useMutation } from '@apollo/client'

import {
  Button,
  Flex,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  UnorderedList,
  useToast
} from '@chakra-ui/react'

import { DeleteCompSupportOverride } from 'graphQL/Mutation'

const DeleteModal = ({ isOpen, onClose, data, refetch }) => {
  const { id } = data
  const toast = useToast()
  const [deleteSupport] = useMutation(DeleteCompSupportOverride)

  const onDeleteSupport = async () => {
    await deleteSupport({ variables: { id } }).then((res) => {
      const errors = res?.data?.componentSupportOverrideDelete?.errors
      if (errors?.length > 0) {
        toast({
          description: errors[0],
          status: 'error',
          position: 'top',
          duration: 3000
        })
      } else {
        refetch()
        onClose()
      }
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Archive Support</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>Archiving this entry will: </Text>
          <UnorderedList>
            <Flex flexDir={'column'} gap={1} mt={4}>
              {[`Remove this support detail from existing products`].map(
                (item, index) => (
                  <ListItem key={index}>{item}</ListItem>
                )
              )}
            </Flex>
          </UnorderedList>
          <Text mt={10}>Are you sure you wish to continue ?</Text>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            No
          </Button>
          <Button colorScheme={'red'} onClick={onDeleteSupport}>
            Yes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default DeleteModal
