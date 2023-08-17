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
  Text
} from '@chakra-ui/react'
import { UpdateProject } from 'graphQL/Mutation'
import { CreateProject } from 'graphQL/Mutation'
import { useState, useEffect } from 'react'

const ProductModal = ({
  id,
  isOpen,
  onClose,
  product,
  vendorName,
  description,
  allProjects
}) => {
  const [projectCreate] = useMutation(CreateProject)
  const [projectUpdate] = useMutation(UpdateProject)

  const [productName, setProductName] = useState('')
  const [productDesc, setProductDesc] = useState('')
  const [vendor, setVendor] = useState('')
  const [uniqueId, setUniqueId] = useState('')

  useEffect(() => {
    setProductName(product)
    setProductDesc(description)
    setVendor(vendorName)
  }, [isOpen])

  const [error, setError] = useState('')

  // console.log(`id`, id)

  const productExist =
    allProjects &&
    allProjects.projects.nodes.find((item) => item.name === `${productName}`)

  const updateProduct = async () => {
    try {
      await projectUpdate({
        variables: {
          id: id,
          name: productName,
          desc: productDesc
        }
      }).then((res) => window.location.reload())
    } catch (error) {
      console.error('Mutation error:', error)
    }
  }

  const handleSave = async () => {
    if (!productExist) {
      try {
        await projectCreate({
          variables: {
            name: productName,
            desc: productDesc
          }
        }).then(() => window.location.reload())
      } catch (error) {
        console.error('Mutation error:', error)
      }
    } else {
      setError(
        `A project with same name already exists. Please choose a unique name`
      )
      setProductName('')
      setProductDesc('')
      setUniqueId('')
    }
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />

        <ModalContent>
          <ModalHeader>{productName ? 'Update' : 'Add'} Product</ModalHeader>
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
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder='Enter name'
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Input
                  type='text'
                  value={productDesc}
                  onChange={(e) => setProductDesc(e.target.value)}
                  placeholder='Enter product description'
                />
              </FormControl>
              <FormControl>
                <FormLabel>Vendor</FormLabel>
                <Input
                  type='text'
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  placeholder='Enter vendor name'
                />
              </FormControl>
              <FormControl>
                <FormLabel>Unique Identifier</FormLabel>
                <Input
                  type='text'
                  value={uniqueId}
                  placeholder={`Add identifier`}
                  onChange={(e) => setUniqueId(e.target.value)}
                />
              </FormControl>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='gray' mr={3} onClick={onClose}>
              Cancel
            </Button>
            {id ? (
              <Button colorScheme='blue' onClick={updateProduct}>
                Update
              </Button>
            ) : (
              <Button colorScheme='blue' onClick={handleSave}>
                Save
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default ProductModal
