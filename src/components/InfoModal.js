import { useParams } from 'react-router-dom'

import { ArrowForwardIcon } from '@chakra-ui/icons'
import {
  Button,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text
} from '@chakra-ui/react'

const InfoModal = ({ isOpen, onClose, heading, body, url }) => {
  const params = useParams()
  const env = params.productid
  return (
    <Modal isOpen={isOpen} onClose={onClose} motionPreset='slideInBottom'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{heading}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>{body}</Text>
          {env && heading === 'Manufacturer' && (
            <Text mt={3}>{`Setup Manufacturer Identities under -`}</Text>
          )}
          {env && heading === 'Manufacturer' && (
            <Text
              fontWeight={'medium'}
              mt={3}
            >{`Settings > Organization > Legal`}</Text>
          )}
          {url !== '' && (
            <Link href={url} isExternal>
              <Button
                size='sm'
                mt={5}
                rightIcon={<ArrowForwardIcon />}
                colorScheme='blue'
                variant='link'
              >
                Learn more
              </Button>
            </Link>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant='unstyled' colorScheme='red' onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default InfoModal
