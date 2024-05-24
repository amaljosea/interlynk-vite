import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { validateEmail, validateUrl } from 'utils'

import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay
} from '@chakra-ui/react'

import { recheckHealth, supplierCreate, supplierUpdate } from 'graphQL/Mutation'

const PriSupplierModal = ({ isOpen, onClose, refetch, suppliers, checkId }) => {
  const params = useParams()
  const sbomId = params.sbomid

  const [orgName, setOrgName] = useState('')
  const [orgUrl, setOrgUrl] = useState('')
  const [isValidUrl, setIsValidUrl] = useState('')
  const [supName, setSupName] = useState('')
  const [supEmail, setSupEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [supplierError, setSupplierError] = useState('')

  const containsSpace = /\s/.test(orgUrl)

  const onSupplierChange = (e) => {
    const { value } = e.target
    setSupName(value)
    if ((value.length > 0 && value.length < 4) || value.length > 256) {
      setSupplierError('Input must be between 4 and 256 characters')
    } else {
      setSupplierError('')
    }
  }

  const handleCheckUrl = () => {
    if (!validateUrl(orgUrl)) {
      setIsValidUrl('Please enter a valid URL')
    }
  }

  const handleCheckEmail = () => {
    if (!validateEmail(supEmail)) {
      setEmailError('Email is invalid')
    }
  }

  const onUrlChange = (e) => {
    const { value } = e.target
    setOrgUrl(value)
    setIsValidUrl('')
  }

  const isInvalid =
    orgName === '' ||
    supplierError !== '' ||
    (supEmail !== '' && !validateEmail(supEmail)) ||
    (orgUrl !== '' && !validateUrl(orgUrl))

  const [createSupplier] = useMutation(supplierCreate)
  const [updateSupplier] = useMutation(supplierUpdate)
  const [healthRecheck] = useMutation(recheckHealth)

  useEffect(() => {
    if (suppliers && suppliers.length > 0) {
      setOrgName(suppliers[0].name || '')
      setOrgUrl(suppliers[0].url || '')
      setSupName(suppliers[0].contactName || '')
      setSupEmail(suppliers[0].contactEmail || '')
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
      .then(() => {
        if (checkId) {
          healthRecheck({
            variables: { sbomId: sbomId, checkId: checkId }
          }).then((res) => res?.data && refetch())
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
    })
      .then((res) => res?.data && refetch())
      .finally(() => onClose())
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
              <FormControl isRequired>
                <FormLabel fontSize={'sm'}>Organization Name</FormLabel>
                <Input
                  placeholder='Enter organization name'
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              </FormControl>
              {/* ORG URL */}
              <FormControl
                isInvalid={
                  (orgUrl !== '' && !validateUrl(orgUrl)) || containsSpace
                }
              >
                <FormLabel fontSize={'sm'}>URL</FormLabel>
                <Input
                  placeholder='Enter URL'
                  value={orgUrl}
                  onBlur={handleCheckUrl}
                  onChange={onUrlChange}
                />
                <FormErrorMessage>{isValidUrl}</FormErrorMessage>
              </FormControl>
              {/* SUPPLIER NAME */}
              <FormControl isInvalid={supplierError}>
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
                isInvalid={supEmail !== '' && !validateEmail(supEmail)}
              >
                <FormLabel fontSize={'sm'}>Contact Email</FormLabel>
                <Input
                  placeholder='Enter supplier email'
                  value={supEmail}
                  onBlur={handleCheckEmail}
                  onChange={(e) => {
                    setSupEmail(e.target.value)
                    setEmailError('')
                  }}
                />
                <FormErrorMessage>{emailError}</FormErrorMessage>
              </FormControl>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Flex
              gap={2}
              width={'100%'}
              justifyContent={'flex-end'}
              alignItems={'center'}
            >
              <Button colorScheme='gray' mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme='blue'
                onClick={suppliers?.length > 0 ? handleUpdate : handleSave}
                disabled={isInvalid}
              >
                {suppliers?.length > 0 ? 'Update' : 'Save'}
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default PriSupplierModal
