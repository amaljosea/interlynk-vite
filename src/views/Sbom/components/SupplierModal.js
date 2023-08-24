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
  Input
} from '@chakra-ui/react'
import { supplierUpdate } from 'graphQL/Mutation'
import { supplierCreate } from 'graphQL/Mutation'
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SupplierModal = ({ id, isOpen, onClose, refetch, suppliers }) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('p')
  const sbomId = queryParams.get('sbom')

  console.log('suppliers', suppliers)

  const [supName, setSupName] = useState('')
  const [supEmail, setSupEmail] = useState('')

  const [createSupplier] = useMutation(supplierCreate)
  const [updateSupplier] = useMutation(supplierUpdate)

  useEffect(() => {
    if (suppliers.length > 0) {
      setSupName(suppliers[0].name)
      setSupEmail(suppliers[0].email)
    }
  }, [suppliers])

  const handleSave = async () => {
    if (supName || supEmail) {
      await createSupplier({
        variables: {
          name: supName,
          email: supEmail,
          sbomId: sbomId,
          componentId: id
        }
      }).then(() => {
        refetch({
          projectId: productId,
          sbomId: sbomId
        })
        onClose()
      })
    }
  }

  const handleUpdate = async () => {
    if (supName || supEmail) {
      await updateSupplier({
        variables: {
          name: supName,
          email: supEmail,
          supplierId: suppliers[0].id,
          sbomId: sbomId,
          componentId: id
        }
      }).then(() => {
        refetch({
          projectId: productId,
          sbomId: sbomId
        })
        onClose()
      })
    }
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Supplier</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex width={'100%'} direction={'column'} gap={4}>
              <FormControl>
                <FormLabel fontSize={'sm'}>Name</FormLabel>
                <Input
                  placeholder='Enter supplier name'
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                />
              </FormControl>
              <FormControl>
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
              <Button colorScheme='blue' onClick={handleUpdate}>
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

export default SupplierModal
