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
import { recheckHealth } from 'graphQL/Mutation'
import { supplierUpdate } from 'graphQL/Mutation'
import { supplierCreate } from 'graphQL/Mutation'
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const PriSupplierModal = ({ isOpen, onClose, refetch, suppliers, checkId }) => {
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

  const [createSupplier] = useMutation(supplierCreate)
  const [updateSupplier] = useMutation(supplierUpdate)

  const [healthRecheck] = useMutation(recheckHealth)

  const handleReCheck = async () => {
    await healthRecheck({
      variables: {
        sbomId: sbomId,
        checkId: checkId
      }
    }).then(() =>
      refetch({
        variables: {
          projectId: productId,
          sbomId: sbomId,
          first: 10,
          last: undefined,
          field: 'STATUS',
          direction: 'ASC'
        }
      })
    )
  }

  useEffect(() => {
    if (suppliers && suppliers.length > 0) {
      setSupName(suppliers[0].name)
      setSupEmail(suppliers[0].contactEmail)
    }
  }, [suppliers])

  const handleSave = async (e) => {
    e.preventDefault()
    if (validateEmail(supEmail) === true) {
      await createSupplier({
        variables: {
          name: supName,
          contactEmail: supEmail,
          sbomId: sbomId
        }
      })
        .then((res) => {
          if (checkId) {
            handleReCheck()
          } else if (res) {
            refetch({
              productId: productId,
              sbomId: sbomId
            })
          }
        })
        .finally(() => onClose())
    } else {
      toast({
        description: 'Invalid email',
        status: 'error',
        position: 'top-right',
        duration: 2000
      })
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (validateEmail(supEmail) === true) {
      await updateSupplier({
        variables: {
          name: supName,
          contactEmail: supEmail,
          id: suppliers[0].id
        }
      })
        .then((res) => {
          if (res) {
            setSupName('')
            setSupEmail('')
          }
        })
        .finally(() => {
          refetch({
            productId: productId,
            sbomId: sbomId
          })
          onClose()
        })
    } else {
      toast({
        description: 'Invalid email',
        status: 'error',
        position: 'top-right',
        duration: 2000
      })
    }
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <form
          onSubmit={
            suppliers && suppliers.length > 0 ? handleUpdate : handleSave
          }
        >
          <ModalContent>
            <ModalHeader>Add {checkId ? 'SBOM' : ''} Supplier</ModalHeader>
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
              {suppliers && suppliers.length > 0 ? (
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

export default PriSupplierModal
