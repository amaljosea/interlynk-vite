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
  Select,
  useToast,
  Textarea
} from '@chakra-ui/react'
import { UpdateProject } from 'graphQL/Mutation'
import { CreateProject } from 'graphQL/Mutation'
import { useState, useEffect } from 'react'

const ProductModal = ({
  id,
  isOpen,
  onClose,
  product,
  type,
  description,
  allProjects,
  refetch,
  totalRows
}) => {
  const toast = useToast()
  const [projectCreate] = useMutation(CreateProject)
  const [projectUpdate] = useMutation(UpdateProject)

  const [productName, setProductName] = useState('')
  const [productDesc, setProductDesc] = useState('')
  const [kind, setKind] = useState('')
  const [supplierName, setSupplierName] = useState('')
  const [supplierEmail, setSupplierEmail] = useState('')

  useEffect(() => {
    setProductName(product)
    setProductDesc(description)
    setKind(type)
  }, [id])

  const [error, setError] = useState('')

  // console.log(`id`, id)

  const productExist =
    allProjects && allProjects.find((item) => item.name === `${productName}`)

  const updateProduct = async (e) => {
    e.preventDefault()
    try {
      await projectUpdate({
        variables: {
          id: id,
          name: productName,
          desc: productDesc
        }
      })
        .then((res) => {
          const error = res.data.projectUpdate.errors
          if (error.length > 0) {
            toast({
              description:
                'A project with same name already exists. Please choose a unique name',
              status: 'error',
              position: 'top',
              duration: 5000
            })
          } else {
            refetch({
              first: totalRows
            })
          }
        })
        .finally(() => onClose())
    } catch (error) {
      console.error('Mutation error:', error)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      await projectCreate({
        variables: {
          name: productName,
          desc: productDesc
        }
      }).then((res) => {
        const error = res.data.projectCreate.errors
        if (error.length > 0) {
          toast({
            description:
              'A project with same name already exists. Please choose a unique name',
            position: 'top',
            status: 'error',
            duration: 5000
          })
        } else {
          refetch({
            first: totalRows
          })
          onClose()
        }
      })
    } catch (error) {
      console.error('Mutation error:', error)
    }
  }

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
                    onChange={(e) => setProductName(e.target.value)}
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
                <Button colorScheme='blue' type='submit'>
                  Update
                </Button>
              ) : (
                <Button colorScheme='blue' type='submit'>
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
