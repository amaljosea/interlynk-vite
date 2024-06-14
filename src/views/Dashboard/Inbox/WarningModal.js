import React from 'react'

import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay
} from '@chakra-ui/react'

const WarningModal = ({
  isOpen: isWarningOpen,
  onClose: onWarningClose,
  handleCancel,
  row
}) => {
  return (
    <Modal isOpen={isWarningOpen} onClose={onWarningClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Warning</ModalHeader>
        <ModalCloseButton />
        <ModalBody>Are you sure you want to cancel this request?</ModalBody>
        <ModalFooter>
          <Button colorScheme='gray' mr={3} onClick={onWarningClose}>
            No
          </Button>
          <Button
            colorScheme='red'
            onClick={() => {
              handleCancel(row)
              onWarningClose()
            }}
          >
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default WarningModal
