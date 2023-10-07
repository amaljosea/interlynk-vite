import { useMutation } from '@apollo/client'
import { ArrowForwardIcon, WarningTwoIcon } from '@chakra-ui/icons'
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
  chakra
} from '@chakra-ui/react'
import { updateComSupplier } from 'graphQL/Mutation'
import { addComSupplier } from 'graphQL/Mutation'
import { supplierUpdate } from 'graphQL/Mutation'
import { supplierCreate } from 'graphQL/Mutation'
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SupplierModal = ({
  id,
  isOpen,
  onClose,
  refetch,
  suppliers,
  shortDesc
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
      }).then(() => {
        refetch({
          projectId: productId,
          sbomId: sbomId
        })
        onClose()
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
          refetch({
            projectId: productId,
            sbomId: sbomId
          })
          onClose()
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
            <ModalHeader>Add Supplier</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex width={'100%'} direction={'column'} gap={4}>
                <FormControl isRequired>
                  <FormLabel fontSize={'sm'}>
                    <chakra.span>
                      {shortDesc === 'Supplier Name' && supName === '' && (
                        <WarningTwoIcon w={4} h={4} color='red.500' mr={2} />
                      )}
                    </chakra.span>
                    Name
                  </FormLabel>
                  <Input
                    placeholder='Enter supplier name'
                    value={supName}
                    onChange={(e) => setSupName(e.target.value)}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize={'sm'}>Email</FormLabel>
                  <Input
                    placeholder='Enter supplier email'
                    value={supEmail}
                    onChange={(e) => setSupEmail(e.target.value)}
                  />
                </FormControl>
              </Flex>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme='gray' mr={3} onClick={onClose}>
                Cancel
              </Button>
              {suppliers.length > 0 ? (
                <Button colorScheme='blue' type={'submit'}>
                  Update
                </Button>
              ) : (
                <Button colorScheme='blue' type={'submit'}>
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
