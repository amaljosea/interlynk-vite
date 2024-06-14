import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'

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
  Textarea,
  useToast
} from '@chakra-ui/react'

import { RequestCreate } from 'graphQL/Mutation'

const RequestModal = ({ isOpen, onClose }) => {
  const toast = useToast()

  const [email, setEmail] = useState('')
  const [productName, setProductName] = useState('')
  const [productVersion, setProductVersion] = useState('')
  const [notes, setNotes] = useState('')

  const [isSaveDisabled, setIsSaveDisabled] = useState(false)

  const [createRequest] = useMutation(RequestCreate)

  useEffect(() => {
    if (email === '') {
      setIsSaveDisabled(true)
    } else {
      setIsSaveDisabled(false)
    }
  }, [email])

  const handleCreate = (e) => {
    e.preventDefault()
    setIsSaveDisabled(true)
    createRequest({
      variables: {
        email,
        productName,
        productVersion,
        notes
      }
    }).then((res) => {
      if (res?.data?.requestCreate?.errors?.length === 0) {
        toast({
          description: 'SBOM request is being sent to the email',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top'
        })
        onClose()
      } else {
        setIsSaveDisabled(false)
      }
    })
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
      <form onSubmit={handleCreate}>
        <ModalContent>
          <ModalHeader>Request SBOM</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex width={'100%'} direction={'column'} gap={4}>
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
            <Button
              isDisabled={isSaveDisabled}
              colorScheme='blue'
              type='submit'
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  )
}

export default RequestModal
