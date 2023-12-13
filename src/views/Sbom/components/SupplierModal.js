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
  FormErrorMessage,
  Stack,
  Text
} from '@chakra-ui/react'
import GlobalContext from 'context/GlobalContext'
import { CreateAutomation } from 'graphQL/Mutation'
import { updateComSupplier } from 'graphQL/Mutation'
import { recheckHealth } from 'graphQL/Mutation'
import { addComSupplier } from 'graphQL/Mutation'
import { useState, useEffect, useContext } from 'react'
import { useLocation } from 'react-router-dom'

const SupplierModal = ({
  id,
  isOpen,
  onClose,
  refetch,
  suppliers,
  checkId,
  filterRefetch,
  activeCheck,
  setPageIndex
}) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('p')
  const sbomId = queryParams.get('sbom')

  const { comPageIndex, setComPageIndex, setCompFilters } =
    useContext(GlobalContext)

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
      projectId: productId,
      sbomId: sbomId
    }).then((res) => res.data && setCompFilters(res.data.sbom.filters))
  }

  const [createSupplier] = useMutation(addComSupplier, {
    onCompleted: () => {
      refetch()
      onFilterRefetch()
    }
  })
  const [updateSupplier] = useMutation(updateComSupplier, {
    onCompleted: () => {
      refetch()
      onFilterRefetch()
    }
  })

  const [healthRecheck] = useMutation(recheckHealth, {
    onCompleted: () => refetch()
  })

  useEffect(() => {
    if (suppliers.length > 0) {
      setSupName(suppliers[0].name)
      setSupEmail(suppliers[0].contactEmail)
    }
  }, [])

  const handleSave = async () => {
    await createSupplier({
      variables: {
        name: supName,
        contactEmail: supEmail,
        componentId: activeCheck ? activeCheck.id : id
      }
    })
      .then((res) => {
        if (checkId) {
          setPageIndex(1)
          healthRecheck({
            variables: {
              sbomId: sbomId,
              checkId: checkId,
              compId: activeCheck.id
            }
          })
        }
      })
      .finally(() => onClose())
  }

  const handleUpdate = async () => {
    await updateSupplier({
      variables: {
        name: supName,
        contactEmail: supEmail,
        id: suppliers[0].id
      }
    }).then((res) => res.data && onClose())
  }

  const [createAutoCheck] = useMutation(CreateAutomation)

  const onSaveRule = async () => {
    try {
      await createAutoCheck({
        variables: {
          projectId: productId,
          applicable: 'component',
          condition: 'missing',
          attr: 'supplier',
          enabled: true,
          compName: activeCheck.name,
          compVersion: activeCheck.version,
          set: JSON.stringify(
            {
              name: supName,
              contact_email: supEmail
            },
            null,
            2
          )
        }
      }).then((res) => res.data && handleSave())
    } catch (error) {
      console.log('Error', error)
    }
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
            <Flex
              width={'100%'}
              justifyContent={'space-between'}
              alignItems={'center'}
            >
              {checkId ? (
                <Button fontSize={'sm'} colorScheme='blue' onClick={onSaveRule}>
                  Save Rule
                </Button>
              ) : (
                <Text></Text>
              )}
              <Stack direction={'row'} spacing={2} alignItems={'center'}>
                <Button colorScheme='gray' onClick={onClose}>
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
              </Stack>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default SupplierModal
