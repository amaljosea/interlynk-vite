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
  Text,
  useToast,
  AlertIcon,
  AlertDescription
} from '@chakra-ui/react'
import { EnvCreate } from 'graphQL/Mutation'
import { useState } from 'react'
import {errorMapping} from "utils/errorUtils";

const EnvModal = ({ groupId, isOpen, onClose, refetch }) => {
  const toast = useToast()
  const [projectCreate] = useMutation(EnvCreate)
  const [productName, setProductName] = useState('')
  const [error, setError] = useState('')

  const handleSave = async (e) => {
    e.preventDefault()
    await projectCreate({
      variables: {
        groupId,
        name: productName,
        enabled: true
      }
    }).then((res) => {
      const errors = res?.data?.projectCreate?.errors
      if (errors?.length > 0) {
        setError(errorMapping[errors[0]] || errors[0])
      } else {
        refetch({ id: groupId })
        toast({
          description: 'Environment added successfully',
          status: 'success',
          position: 'top',
          duration: 3000
        })
        onClose()
      }
    })
  }

  const isInvalid = productName === '' || error !== ''

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <form onSubmit={handleSave}>
          <ModalContent>
            <ModalHeader>Add Environment</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex width={'100%'} direction={'column'} gap={4}>
                {error !== '' && (
                  <Alert status='error' borderRadius={4}>
                    <AlertIcon />
                    <AlertDescription fontSize={'sm'} pr={2}>
                      {error}
                    </AlertDescription>
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
