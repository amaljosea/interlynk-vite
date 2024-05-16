import { useMutation } from '@apollo/client'
import { refetchActiveQueries } from 'context/ApolloWrapper'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { errorMapping } from 'utils/errorUtils'

import {
  Alert,
  AlertIcon,
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
  Text,
  Textarea
} from '@chakra-ui/react'

import { CreateProjectGroup, UpdateProjectGroup } from 'graphQL/Mutation'

const ProductModal = ({ id, isOpen, onClose, product, description }) => {
  const params = useParams()
  const [projectGroupCreate] = useMutation(CreateProjectGroup, {
    onCompleted: refetchActiveQueries
  })
  const [projectGroupUpdate] = useMutation(UpdateProjectGroup, {
    onCompleted: refetchActiveQueries
  })

  const [productName, setProductName] = useState('')
  const [productDesc, setProductDesc] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setProductName(product)
    setProductDesc(description)
  }, [description, product])

  const updateProduct = async (e) => {
    e.preventDefault()
    await projectGroupUpdate({
      variables: { id: id, name: productName, desc: productDesc }
    }).then((res) => {
      const error = res.data.projectGroupUpdate.errors
      if (error?.length > 0) {
        setError(res.data.projectGroupUpdate.errors[0])
      } else {
        onClose()
      }
    })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    await projectGroupCreate({
      variables: { name: productName, desc: productDesc, enabled: true }
    }).then((res) => {
      const error = res.data.projectGroupCreate.errors
      if (error?.length > 0) {
        setError(error[0])
      } else {
        onClose()
      }
    })
  }

  const isInvalid = productName === '' || error !== ''

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
                  <Alert status='error' borderRadius={4}>
                    <AlertIcon />
                    <Text fontSize={'sm'}>{errorMapping[error] || error}</Text>
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
                    placeholder={`Add product ${params && 'group'} name`}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={productDesc || ''}
                    onChange={(e) => setProductDesc(e.target.value)}
                    placeholder={`Add product ${params && 'group'} description`}
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
