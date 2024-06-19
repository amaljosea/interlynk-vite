import { useMutation } from '@apollo/client'
import { useState } from 'react'
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

const ProductModal = ({ isOpen, onClose, data }) => {
  const { id, name, description } = data || ''
  const [projectGroupCreate] = useMutation(CreateProjectGroup)
  const [projectGroupUpdate] = useMutation(UpdateProjectGroup)

  const [productName, setProductName] = useState(name || '')
  const [productDesc, setProductDesc] = useState(description || '')
  const [error, setError] = useState('')

  const updateProduct = async (e) => {
    e.preventDefault()
    await projectGroupUpdate({
      variables: { id: id, name: productName, desc: productDesc }
    }).then((res) => {
      const error = res?.data?.projectGroupUpdate?.errors
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
      const error = res?.data?.projectGroupCreate?.errors
      if (error?.length > 0) {
        setError(error[0])
      } else {
        onClose()
      }
    })
  }

  const onNameChange = (e) => {
    setProductName(e.target.value)
    setError('')
  }
  const onDescChange = (e) => {
    setProductDesc(e.target.value)
    setError('')
  }

  const isInvalid = productName === '' || error !== ''

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <form onSubmit={data ? updateProduct : handleSave}>
          <ModalContent>
            <ModalHeader>{data ? 'Edit' : 'Add'} Product</ModalHeader>
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
                    value={productName}
                    onChange={onNameChange}
                    placeholder={`Add product name`}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    rows={5}
                    value={productDesc}
                    onChange={onDescChange}
                    placeholder={`Add product description`}
                  />
                </FormControl>
              </Flex>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme='gray' mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme='blue' type='submit' disabled={isInvalid}>
                {data ? 'Update' : 'Save'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </form>
      </Modal>
    </>
  )
}

export default ProductModal
