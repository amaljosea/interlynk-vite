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

import { UpdateCompSupportOverride } from 'graphQL/Mutation'

const StatusModal = ({ isOpen, onClose, data }) => {
  const toast = useToast()
  const { id, enabled } = data
  const [updateSupport] = useMutation(UpdateCompSupportOverride)

  const onChangeStatus = async () => {
    await updateSupport({
      variables: { id: id, enabled: enabled === true ? false : true }
    }).then((res) => {
      const errors = res?.data?.componentSupportOverrideUpdate?.errors
      if (errors?.length > 0) {
        toast({
          description: errors[0],
          status: 'error',
          duration: 2000,
          position: 'top'
        })
      } else {
        onClose()
      }
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Disable Support</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>Disabling this entry will: </Text>
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
          <Button colorScheme={'blue'} onClick={onChangeStatus}>
            Yes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default StatusModal
