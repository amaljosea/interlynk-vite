import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text
} from '@chakra-ui/react'

const FixedModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} motionPreset='slideInBottom'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Fixed</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={8}>
          <Text>The platform automatically fixed this issue.</Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default FixedModal
