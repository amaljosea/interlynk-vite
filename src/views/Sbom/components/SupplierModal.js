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
  checkId,
  totalRows,
  filterRefetch
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
        first: totalRows,
        last: undefined,
        after: undefined,
        before: undefined,
        category: undefined,
        severity: undefined,
        status: undefined,
        field: 'UPDATED_AT',
        direction: 'DESC'
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
    await createSupplier({
      variables: {
        name: supName,
        contactEmail: supEmail,
        componentId: id
      }
    })
      .then((res) => {
        if (res.data) {
          refetch({
            projectId: productId,
            sbomId: sbomId,
            first: totalRows,
            last: undefined,
            field: 'UPDATED_AT',
            direction: 'DESC'
          })
        }
        if (checkId) {
          healthRecheck({
            variables: {
              sbomId: sbomId,
              checkId: checkId,
              compId: id
            }
          })
        }
      })
      .finally(() => {
        filterRefetch({
          projectId: productId,
          sbomId: sbomId
        })
        onClose()
      })
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    await updateSupplier({
      variables: {
        name: supName,
        contactEmail: supEmail,
        id: suppliers[0].id
      }
    })
      .then((data) => {
        if (data) {
          refetch({
            projectId: productId,
            sbomId: sbomId,
            first: totalRows,
            field: 'UPDATED_AT',
            direction: 'DESC'
          })
        }
      })
      .finally(() => onClose())
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />

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
                onClick={handleUpdate}
                disabled={!supName || !supEmail || !validateEmail(supEmail)}
              >
                Update
              </Button>
            ) : (
              <Button
                colorScheme='blue'
                onClick={handleSave}
                disabled={!supName || !supEmail || !validateEmail(supEmail)}
              >
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
