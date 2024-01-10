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
import { CreateProjectGroup, UpdateProjectGroup } from 'graphQL/Mutation'
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const ProductModal = ({
  id,
  isOpen,
  onClose,
  product,
  description,
  refetch
}) => {
  const navigate = useNavigate()
  const params = useParams()
  const [projectGroupCreate] = useMutation(CreateProjectGroup, {
    onCompleted: () => refetch()
  })
  const [projectGroupUpdate] = useMutation(UpdateProjectGroup, {
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
    await projectGroupUpdate({
      variables: {
        id: id,
        name: productName,
        desc: productDesc
      }
    }).then((res) => {
      const error = res.data.projectGroupUpdate.errors
      if (error.length > 0) {
        setError(
          'A project group with same name already exists. Please choose an unique name'
        )
      } else {
        params?.name
          ? navigate(`/vendor/products/${productName}?id=${id}`)
          : navigate(`/vendor/products`)
        onClose()
      }
    })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    await projectGroupCreate({
      variables: {
        name: productName,
        desc: productDesc,
        enabled: true
      }
    }).then((res) => {
      const error = res.data.projectGroupCreate.errors
      if (error.length > 0) {
        setError(
          'A project group with same name already exists. Please choose an unique name'
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
            <ModalHeader>{product ? 'Edit' : 'Add'} Product</ModalHeader>
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
