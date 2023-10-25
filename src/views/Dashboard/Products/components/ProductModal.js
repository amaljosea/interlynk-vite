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
  useToast
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
  refetch
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
    allProjects &&
    allProjects.projects.nodes.find((item) => item.name === `${productName}`)

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
        .then(() =>
          refetch({
            first: 10
          })
        )
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
            first: 10
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
                  <Input
                    type='text'
                    value={productDesc || ''}
                    onChange={(e) => setProductDesc(e.target.value)}
                    placeholder='Enter product description'
                  />
                </FormControl>
{/*                 {id && (
                  <FormControl pointerEvents={'none'}>
                    <FormLabel>Type</FormLabel>
                    <Select
                      id='type'
                      name='type'
                      value={kind}
                      onChange={(e) => setKind(e.target.value)}
                    >
                      <option value=''>-- Select --</option>
                      <option value='application'>Application</option>
                      <option value='library'>Library</option>
                      <option value='operating-system'>Operating System</option>
                      <option value='firmware'>Firmware</option>
                      <option value='file'>File</option>
                      <option value='device'>Device</option>
                      <option value='container'>Container</option>
                      <option value='framework'>Framework</option>
                      <option value='source'>Source</option>
                      <option value='archive'>Archive</option>
                      <option value='install'>Install</option>
                      <option value='other'>Other</option>
                      <option value='unspecified'>Unspecified</option>
                    </Select>
                  </FormControl>
                )}
                <FormControl>
                  <FormLabel>Supplier Name</FormLabel>
                  <Input
                    type='text'
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder='Enter name'
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Supplier EmailXX</FormLabel>
                  <Input
                    type='email'
                    value={supplierEmail}
                    placeholder={`Enter email`}
                    onChange={(e) => setSupplierEmail(e.target.value)}
                  />
                </FormControl> */}
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
