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
  UnorderedList
} from '@chakra-ui/react'

const DeleteWarning = ({ isOpen, onClose, onDelete }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Archive Automation</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>Archiving this entry will: </Text>
          <UnorderedList>
            <Flex flexDir={'column'} gap={1} mt={4}>
              {[`Remove this rule from existing automations`].map(
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
          <Button colorScheme={'red'} onClick={onDelete}>
            Yes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default DeleteWarning
