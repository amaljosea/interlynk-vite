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
import { CreateAutomation } from 'graphQL/Mutation'
import { recheckHealth, supplierUpdate, supplierCreate } from 'graphQL/Mutation'
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const urlPattern = new RegExp(
  '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w.-]*/?'
)

const PriSupplierModal = ({
  isOpen,
  onClose,
  refetch,
  suppliers,
  checkId,
  setPageIndex
}) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('id')
  const sbomId = queryParams.get('sbom')

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
    return emailRegex.test(email)
  }

  const [orgName, setOrgName] = useState('')
  const [orgUrl, setOrgUrl] = useState('')
  const [isValidUrl, setIsValidUrl] = useState(true)
  const [supName, setSupName] = useState('')
  const [supEmail, setSupEmail] = useState('')
  const [supplierError, setSupplierError] = useState('')

  const onSupplierChange = (e) => {
    const { value } = e.target
    setSupName(value)
    if (value.length < 4 || value.length > 256) {
      setSupplierError('Input must be between 4 and 256 characters')
    } else {
      setSupplierError('')
    }
  }

  const onUrlChange = (e) => {
    const { value } = e.target
    setOrgUrl(value)
    if (urlPattern.test(value)) {
      setIsValidUrl(true)
    } else {
      setIsValidUrl(false)
    }
  }

  const isInvalid =
    !supName || (supEmail != '' && !validateEmail(supEmail)) || !isValidUrl

  const handleRefetch = () => {
    refetch({
      productId: productId,
      sbomId: sbomId
    })
  }

  const [createSupplier] = useMutation(supplierCreate, {
    onCompleted: () => handleRefetch()
  })
  const [updateSupplier] = useMutation(supplierUpdate, {
    onCompleted: () => handleRefetch()
  })

  const [healthRecheck] = useMutation(recheckHealth, {
    onCompleted: () => refetch()
  })

  const [createAutoCheck] = useMutation(CreateAutomation)

  useEffect(() => {
    if (suppliers && suppliers.length > 0) {
      setOrgName(suppliers[0].name)
      setOrgUrl(suppliers[0].url)
      setSupName(suppliers[0].contactName)
      setSupEmail(suppliers[0].contactEmail)
    }
  }, [suppliers])

  const handleSave = async () => {
    await createSupplier({
      variables: {
        name: orgName,
        url: orgUrl,
        contactName: supName,
        contactEmail: supEmail,
        sbomId: sbomId
      }
    })
      .then((res) => {
        if (checkId) {
          setPageIndex(1)
          healthRecheck({
            variables: {
              sbomId: sbomId,
              checkId: checkId
            }
          })
        }
      })
      .finally(() => onClose())
  }

  const handleUpdate = async () => {
    await updateSupplier({
      variables: {
        name: orgName,
        url: orgUrl,
        contactName: supName,
        contactEmail: supEmail,
        id: suppliers[0].id
      }
    }).then((res) => res.data && onClose())
  }

  const onSaveRule = async () => {
    try {
      await createAutoCheck({
        variables: {
          projectId: productId,
          applicable: 'document',
          condition: 'missing',
          attr: 'supplier',
          enabled: true,
          set: JSON.stringify(
            { name: supName, contact_email: supEmail },
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
          <ModalHeader>Add {checkId ? 'SBOM' : ''} Supplier</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex width={'100%'} direction={'column'} gap={4}>
              {/* ORG NAME */}
              <FormControl>
                <FormLabel fontSize={'sm'}>Organization Name</FormLabel>
                <Input
                  placeholder='Enter organization name'
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              </FormControl>
              {/* ORG URL */}
              <FormControl isInvalid={!isValidUrl}>
                <FormLabel fontSize={'sm'}>URL</FormLabel>
                <Input
                  placeholder='Enter URL'
                  value={orgUrl}
                  onChange={onUrlChange}
                />
                <FormErrorMessage>Invalid URL</FormErrorMessage>
              </FormControl>
              {/* SUPPLIER NAME */}
              <FormControl isRequired isInvalid={supplierError}>
                <FormLabel fontSize={'sm'}>Contact Name</FormLabel>
                <Input
                  placeholder='Enter supplier name'
                  value={supName}
                  onChange={onSupplierChange}
                />
                <FormErrorMessage>{supplierError}</FormErrorMessage>
              </FormControl>
              {/* SUPPLIER EMAIL */}
              <FormControl
                isInvalid={!validateEmail(supEmail) && supEmail !== ''}
              >
                <FormLabel fontSize={'sm'}>Contact Email</FormLabel>
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
                <Button
                  fontSize={'sm'}
                  colorScheme='blue'
                  onClick={onSaveRule}
                  disabled={isInvalid}
                >
                  Save Rule
                </Button>
              ) : (
                <Text></Text>
              )}
              <Stack direction={'row'} spacing={2} alignItems={'center'}>
                <Button colorScheme='gray' mr={3} onClick={onClose}>
                  Cancel
                </Button>
                {suppliers && suppliers.length > 0 ? (
                  <Button
                    colorScheme='blue'
                    onClick={handleUpdate}
                    disabled={isInvalid}
                  >
                    Update
                  </Button>
                ) : (
                  <Button
                    colorScheme='blue'
                    onClick={handleSave}
                    disabled={isInvalid}
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

export default PriSupplierModal
