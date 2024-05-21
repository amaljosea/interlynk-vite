import { useState } from 'react'

import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea
} from '@chakra-ui/react'

const RequestModal = ({ data, isOpen, onClose }) => {
  const [title, setTitle] = useState('')
  const [email, setEmail] = useState('')
  const [productName, setProductName] = useState('')
  const [productVersion, setProductVersion] = useState('')
  const [notes, setNotes] = useState('')

  const handleUpdate = (e) => {
    e.preventDefault()
  }
  const handleCreate = (e) => {
    e.preventDefault()
  }

  return (
    <Modal
      size='lg'
      isOpen={isOpen}
      onClose={onClose}
      motionPreset='slideInBottom'
      closeOnOverlayClick={false}
      closeOnEsc={false}
    >
      <ModalOverlay />
      <form onSubmit={data ? handleUpdate : handleCreate}>
        <ModalContent>
          <ModalHeader>{data ? 'Edit' : 'Add'} Request</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex width={'100%'} direction={'column'} gap={4}>
              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input
                  type='text'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Product Name</FormLabel>
                <Input
                  type='text'
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Product Version</FormLabel>
                <Input
                  type='text'
                  value={productVersion}
                  onChange={(e) => setProductVersion(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  type='text'
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </FormControl>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='gray' mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme='blue' type='submit'>
              {data ? 'Update' : 'Save'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  )
}

export default RequestModal
