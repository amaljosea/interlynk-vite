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
  useToast,
  chakra,
  FormErrorMessage
} from '@chakra-ui/react'
import { updateComSupplier } from 'graphQL/Mutation'
import { recheckHealth } from 'graphQL/Mutation'
import { addComSupplier } from 'graphQL/Mutation'
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SupplierModal = ({
  id,
  isOpen,
  onClose,
  refetch,
  suppliers,
  checkId
}) => {
  const toast = useToast()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('p')
  const sbomId = queryParams.get('sbom')

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
    return emailRegex.test(email)
  }

  const [supName, setSupName] = useState('')
  const [supEmail, setSupEmail] = useState('')

  const [createSupplier] = useMutation(addComSupplier)
  const [updateSupplier] = useMutation(updateComSupplier)

  const [healthRecheck] = useMutation(recheckHealth, {
    onCompleted: () => {
      refetch({
        projectId: productId,
        sbomId: sbomId,
        first: 10,
        last: undefined,
        field: 'STATUS',
        direction: 'ASC'
      })
    }
  })

  useEffect(() => {
    if (suppliers.length > 0) {
      setSupName(suppliers[0].name)
      setSupEmail(suppliers[0].contactEmail)
    }
  }, [suppliers])

  const handleSave = async (e) => {
    e.preventDefault()
    if (validateEmail(supEmail)) {
      await createSupplier({
        variables: {
          name: supName,
          contactEmail: supEmail,
          componentId: id
        }
      })
        .then(() => {
          if (checkId) {
            healthRecheck({
              variables: {
                sbomId: sbomId,
                checkId: checkId,
                compId: id
              }
            })
          } else {
            refetch({
              projectId: productId,
              sbomId: sbomId,
              first: 10,
              field: 'NAME',
              direction: 'ASC'
            })
          }
        })
        .finally(() => onClose())
    } else {
      toast({
        description: 'Invalid email',
        status: 'error',
        position: 'top',
        duration: 2000
      })
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (validateEmail(supEmail)) {
      await updateSupplier({
        variables: {
          name: supName,
          contactEmail: supEmail,
          id: suppliers[0].id
        }
      }).then((data) => {
        if (data) {
          window.location.reload()
        }
      })
    } else {
      toast({
        description: 'Invalid email',
        status: 'error',
        position: 'top',
        duration: 2000
      })
    }
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <form onSubmit={suppliers.length > 0 ? handleUpdate : handleSave}>
          <ModalContent>
            <ModalHeader>
              {suppliers.length > 0 ? 'Edit' : 'Add'} Supplier
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex width={'100%'} direction={'column'} gap={4}>
                <FormControl isRequired>
                  <FormLabel fontSize={'sm'}>Name</FormLabel>
                  <Input
                    placeholder='Enter supplier name'
                    value={supName}
                    onChange={(e) => setSupName(e.target.value)}
                  />
                </FormControl>
                <FormControl
                  isRequired
                  isInvalid={!validateEmail(supEmail) && supEmail !== ''}
                >
                  <FormLabel fontSize={'sm'}>Email</FormLabel>
                  <Input
                    placeholder='Enter supplier email'
                    value={supEmail}
                    onChange={(e) => setSupEmail(e.target.value)}
                  />
                  {supEmail !== '' && !validateEmail(supEmail) && (
                    <FormErrorMessage>Email is invalid</FormErrorMessage>
                  )}
                </FormControl>
              </Flex>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme='gray' mr={3} onClick={onClose}>
                Cancel
              </Button>
              {suppliers.length > 0 ? (
                <Button
                  colorScheme='blue'
                  type={'submit'}
                  disabled={!supName || !supEmail || !validateEmail(supEmail)}
                >
                  Update
                </Button>
              ) : (
                <Button
                  colorScheme='blue'
                  type={'submit'}
                  disabled={!supName || !supEmail || !validateEmail(supEmail)}
                >
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

export default SupplierModal
