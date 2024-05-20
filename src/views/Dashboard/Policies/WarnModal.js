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

import { PolicyUpdate } from 'graphQL/Mutation'

const WarnModal = ({ isOpen, onClose, data, refetch }) => {
  const toast = useToast()
  const { id, isEnabled } = data
  const [updatePolicy] = useMutation(PolicyUpdate)

  const toggleStatus = async () => {
    await updatePolicy({
      variables: { id: id, isEnabled: isEnabled ? false : true }
    }).then((res) => {
      const errors = res?.data?.policyUpdate?.errors
      if (errors?.length > 0) {
        toast({
          description: errors[0],
          status: 'error',
          position: 'top',
          duration: 2000
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
        <ModalHeader>{isEnabled ? 'Disable' : 'Enable'} Policy</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>{isEnabled ? 'Disable' : 'Enable'} this policy will : </Text>
          <UnorderedList>
            <Flex flexDir={'column'} gap={1} mt={4}>
              {[
                `${isEnabled ? 'Disable' : 'Enable'} the execution of this policy on products`,
                `${isEnabled ? 'Remove' : 'Add'} results of this policy's execution from existing products`
              ].map((item, index) => (
                <ListItem key={index}>{item}</ListItem>
              ))}
            </Flex>
          </UnorderedList>
          <Text mt={10}>Are you sure you wish to continue ?</Text>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            No
          </Button>
          <Button
            colorScheme={isEnabled ? 'red' : 'green'}
            onClick={toggleStatus}
          >
            Yes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default WarnModal
