import { useMutation } from '@apollo/client'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Alert,
  AlertIcon,
  Text,
  Textarea
} from '@chakra-ui/react'
import { EnvCreate } from 'graphQL/Mutation'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const EnvModal = ({ groupId, isOpen, onClose, refetch }) => {
  const navigate = useNavigate()

  const [projectCreate] = useMutation(EnvCreate)

  const [productName, setProductName] = useState('')
  const [productDesc, setProductDesc] = useState('')

  const [error, setError] = useState('')

  const handleSave = async (e) => {
    e.preventDefault()
    await projectCreate({
      variables: {
        groupId,
        name: productName,
        desc: productDesc,
        enabled: true
      }
    })
      .then((res) => res.data && refetch({ id: groupId }))
      .finally(() => onClose())
  }

  const isInvalid = productName === '' || productDesc === '' || error !== ''

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <form onSubmit={handleSave}>
          <ModalContent>
            <ModalHeader>Add Product</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex width={'100%'} direction={'column'} gap={4}>
                {error !== '' && (
                  <Alert status='error'>
                    <AlertIcon />
                    <Text fontSize={'sm'}>{error}</Text>
                  </Alert>
                )}
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input
                    type='text'
                    value={productName || ''}
                    onChange={(e) => {
                      setProductName(e.target.value)
                      setError('')
                    }}
                    placeholder={`Add product  name`}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={productDesc || ''}
                    onChange={(e) => setProductDesc(e.target.value)}
                    placeholder={`Add product description`}
                    rows={5}
                  />
                </FormControl>
              </Flex>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme='gray' mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme='blue' type='submit' disabled={isInvalid}>
                Save
              </Button>
            </ModalFooter>
          </ModalContent>
        </form>
      </Modal>
    </>
  )
}

export default EnvModal
