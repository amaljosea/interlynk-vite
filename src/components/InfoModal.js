import { ArrowForwardIcon } from '@chakra-ui/icons'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  Link
} from '@chakra-ui/react'

const InfoModal = ({ isOpen, onClose, heading, body, url }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} motionPreset='slideInBottom'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{heading}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>{body}</Text>
          {url !== '' && (
            <Link href={url} isExternal>
              <Button size='sm' mt={5} rightIcon={<ArrowForwardIcon />} colorScheme='blue' variant='link' >
                Learn more
              </Button>
            </Link>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant='unstyled' colorScheme='red' onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default InfoModal
