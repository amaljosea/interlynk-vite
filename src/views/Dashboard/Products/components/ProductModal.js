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
import { UpdateProject, CreateProject } from 'graphQL/Mutation'
import { useState, useEffect } from 'react'

const ProductModal = ({
  id,
  isOpen,
  onClose,
  product,
  description,
  refetch
}) => {
  const [projectCreate] = useMutation(CreateProject, {
    onCompleted: () => refetch()
  })
  const [projectUpdate] = useMutation(UpdateProject, {
    onCompleted: () => refetch()
  })

  const [productName, setProductName] = useState('')
  const [productDesc, setProductDesc] = useState('')

  useEffect(() => {
    setProductName(product)
    setProductDesc(description)
  }, [id])

  const [error, setError] = useState('')

  const updateProduct = async (e) => {
    e.preventDefault()
    await projectUpdate({
      variables: {
        id: id,
        name: productName,
        desc: productDesc
      }
    }).then((res) => {
      const error = res.data.projectUpdate.errors
      if (error.length > 0) {
        setError(
          'A project with same name already exists. Please choose an unique name'
        )
      } else {
        onClose()
      }
    })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    await projectCreate({
      variables: {
        name: productName,
        desc: productDesc
      }
    }).then((res) => {
      const error = res.data.projectCreate.errors
      if (error.length > 0) {
        setError(
          'A project with same name already exists. Please choose an unique name'
        )
      } else {
        onClose()
      }
    })
  }

  const isInvalid = productName === '' || productDesc === '' || error !== ''

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <form onSubmit={id ? updateProduct : handleSave}>
          <ModalContent>
            <ModalHeader>{product ? 'Update' : 'Add'} Product</ModalHeader>
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
                    placeholder='Enter product name'
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={productDesc || ''}
                    onChange={(e) => setProductDesc(e.target.value)}
                    placeholder='Enter product description'
                    rows={5}
                  />
                </FormControl>
              </Flex>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme='gray' mr={3} onClick={onClose}>
                Cancel
              </Button>
              {id ? (
                <Button colorScheme='blue' type='submit' disabled={isInvalid}>
                  Update
                </Button>
              ) : (
                <Button colorScheme='blue' type='submit' disabled={isInvalid}>
                  Save
                </Button>
              )}
            </ModalFooter>
          </ModalContent>
        </form>
      </Modal>
    </>
  )
}

export default ProductModal
