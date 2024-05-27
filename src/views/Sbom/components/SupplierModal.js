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
  ModalOverlay,
  Tag,
  Text
} from '@chakra-ui/react'

import {
  addComSupplier,
  recheckHealth,
  updateComSupplier
} from 'graphQL/Mutation'

const SupplierModal = ({
  id,
  isOpen,
  onClose,
  refetch,
  data,
  checkId,
  activeCheck
}) => {
  const params = useParams()
  const sbomId = params.sbomid

  const [orgName, setOrgName] = useState('')
  const [orgUrl, setOrgUrl] = useState('')
  const [isValidUrl, setIsValidUrl] = useState('')
  const [supName, setSupName] = useState('')
  const [nameError, setNameError] = useState('')
  const [supEmail, setSupEmail] = useState('')
  const [emailError, setEmailError] = useState('')

  const containsSpace = /\s/.test(orgUrl)

  const onSupplierChange = (e) => {
    const { value } = e.target
    setSupName(value)
    if ((value.length > 0 && value.length < 4) || value.length > 256) {
      setNameError('Input must be between 4 and 256 characters')
    } else {
      setNameError('')
    }
  }

  const [createSupplier] = useMutation(addComSupplier)
  const [updateSupplier] = useMutation(updateComSupplier)
  const [healthRecheck] = useMutation(recheckHealth)

  const { suppliers } = data || ''

  useEffect(() => {
    if (data && data?.suppliers?.length > 0) {
      const { suppliers } = data
      setOrgName(suppliers[0].name || '')
      setOrgUrl(suppliers[0].url || '')
      setSupName(suppliers[0].contactName || '')
      setSupEmail(suppliers[0].contactEmail || '')
    }
  }, [data])

  const handleSave = async () => {
    await createSupplier({
      variables: {
        name: orgName,
        url: orgUrl,
        contactName: supName,
        contactEmail: supEmail,
        componentId: activeCheck ? activeCheck.id : id
      }
    })
      .then((res) => {
        res?.data && refetch()
        if (checkId) {
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
        name: orgName,
        url: orgUrl,
        contactName: supName,
        contactEmail: supEmail,
        id: data && data.suppliers && data.suppliers[0].id
      }
    })
      .then((res) => res.data && refetch())
      .finally(() => onClose())
  }

  const handleCheckEmail = () => {
    if (!validateEmail(supEmail)) {
      setEmailError('Email is invalid')
    }
  }

  const handleCheckUrl = () => {
    if (!validateUrl(orgUrl)) {
      setIsValidUrl('Please enter a valid URL')
    }
  }

  const onUrlChange = (e) => {
    const { value } = e.target
    setOrgUrl(value)
    setIsValidUrl('')
  }

  const isInvalid =
    orgName === '' ||
    nameError !== '' ||
    (supEmail !== '' && !validateEmail(supEmail)) ||
    (orgUrl !== '' && !validateUrl(orgUrl))

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {data && data.suppliers?.length > 0 ? 'Edit' : 'Add'} Supplier
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {data && (
              <Flex
                width='99%'
                direction={'row'}
                alignItems={'center'}
                justifyContent={'flex-start'}
                flexWrap={'wrap'}
                gap={2}
                mb={4}
              >
                <Text fontWeight={'medium'} wordBreak={'break-all'}>
                  {data.name}
                </Text>
                <Tag colorScheme='blue'>{data.version}</Tag>
              </Flex>
            )}
            {activeCheck && (
              <Flex
                width='100%'
                direction={'row'}
                alignItems={'center'}
                justifyContent={'flex-start'}
                wrap={'wrap'}
                gap={2}
                mb={6}
              >
                <Text wordBreak={'break-all'}>{activeCheck?.name}</Text>
                <Tag colorScheme='blue'>{activeCheck?.version}</Tag>
              </Flex>
            )}
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
              <FormControl isInvalid={supName !== '' && nameError !== ''}>
                <FormLabel fontSize={'sm'}>Contact Name</FormLabel>
                <Input
                  placeholder='Enter supplier name'
                  value={supName}
                  onChange={onSupplierChange}
                />
                <FormErrorMessage>{nameError}</FormErrorMessage>
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
              <Button colorScheme='gray' onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme='blue'
                onClick={suppliers?.length > 0 ? handleUpdate : handleSave}
                isDisabled={isInvalid}
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

export default SupplierModal
