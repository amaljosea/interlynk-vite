import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Stack,
  Text
} from '@chakra-ui/react'

const RelDeleteModal = ({ isOpen, onClose, activeComp, handleRemove }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Remove</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack
            direction='column'
            alignItems={'flex-start'}
            spacing={4}
            py={2}
          >
            <Text wordBreak={'break-all'} fontWeight={'semibold'}>
              {activeComp?.toComp.name}-{activeComp?.toComp.version}
            </Text>
            <Text>
              This will remove the relationship of this component with other
              components and change the dependency order of this version.
            </Text>
            <Text>Are you sure you wish to continue?</Text>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant='outline' mr={3} onClick={onClose}>
            No
          </Button>
          <Button colorScheme='red' onClick={handleRemove}>
            Yes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default RelDeleteModal
