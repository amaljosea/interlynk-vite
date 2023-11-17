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
  FormErrorMessage
} from '@chakra-ui/react'
import GlobalContext from 'context/GlobalContext'
import { updateComSupplier } from 'graphQL/Mutation'
import { recheckHealth } from 'graphQL/Mutation'
import { addComSupplier } from 'graphQL/Mutation'
import { useState, useEffect, useContext } from 'react'
import { useLocation } from 'react-router-dom'

const SupplierModal = ({
  id,
  isOpen,
  onClose,
  fetchCompData,
  suppliers,
  checkId,
  filterRefetch
}) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('p')
  const sbomId = queryParams.get('sbom')

  const {
    checkField,
    checkDirection,
    totalRows,
    comPageIndex,
    setComPageIndex,
    setCompFilters
  } = useContext(GlobalContext)

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
    return emailRegex.test(email)
  }

  const [supName, setSupName] = useState('')
  const [supEmail, setSupEmail] = useState('')

  const handleRefetch = () => {
    setComPageIndex(comPageIndex)
    fetchCompData()
  }

  const onFilterRefetch = () => {
    filterRefetch({
      variables: {
        projectId: productId,
        sbomId: sbomId
      }
    }).then((res) => {
      setCompFilters(res.data.sbom.filters)
    })
  }

  const [createSupplier] = useMutation(addComSupplier, {
    onCompleted: () => handleRefetch()
  })
  const [updateSupplier] = useMutation(updateComSupplier, {
    onCompleted: () => handleRefetch()
  })

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
        field: checkField,
        direction: checkDirection
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
    await createSupplier({
      variables: {
        name: supName,
        contactEmail: supEmail,
        componentId: id
      }
    })
      .then((res) => {
        if (res.data) {
          onFilterRefetch()
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
      .finally(() => onClose())
  }

  const handleUpdate = async (e) => {
    await updateSupplier({
      variables: {
        name: supName,
        contactEmail: supEmail,
        id: suppliers[0].id
      }
    }).then((data) => {
      if (data) {
        onClose()
      }
    })
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
                isInvalid={supEmail !== '' && !validateEmail(supEmail)}
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
                disabled={
                  !supName || (supEmail !== '' && !validateEmail(supEmail))
                }
              >
                Update
              </Button>
            ) : (
              <Button
                colorScheme='blue'
                onClick={handleSave}
                disabled={
                  !supName || (supEmail !== '' && !validateEmail(supEmail))
                }
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
