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
  Text,
  Tag
} from '@chakra-ui/react'
import { CreateAutomation } from 'graphQL/Mutation'
import { updateComSupplier } from 'graphQL/Mutation'
import { recheckHealth } from 'graphQL/Mutation'
import { addComSupplier } from 'graphQL/Mutation'
import { useGlobalState } from 'hooks/useGlobalState'
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { validateUrl } from 'utils'
import { validateEmail } from 'utils'

const SupplierModal = ({
  id,
  isOpen,
  onClose,
  refetch,
  data,
  checkId,
  filterRefetch,
  activeCheck
}) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('id')
  const sbomId = queryParams.get('sbom')

  const { dispatch } = useGlobalState()
  const { prodCompDispatch, prodCheckDispatch } = dispatch

  const [orgName, setOrgName] = useState('')
  const [orgUrl, setOrgUrl] = useState('')
  const [isValidUrl, setIsValidUrl] = useState('')
  const [supName, setSupName] = useState('')
  const [supEmail, setSupEmail] = useState('')
  const [emailError, setEmailError] = useState('')

  const containsSpace = /\s/.test(orgUrl)

  const onFilterRefetch = () => {
    filterRefetch({
      projectId: productId,
      sbomId: sbomId
    }).then(
      (res) =>
        res.data &&
        prodCompDispatch({
          type: 'ADD_FILTER_HEADS',
          payload: res.data.sbom.filters
        })
    )
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
    if (data && data.suppliers.length > 0) {
      const { suppliers } = data
      setOrgName(suppliers[0].name)
      setOrgUrl(suppliers[0].url)
      setSupName(suppliers[0].contactName)
      setSupEmail(suppliers[0].contactEmail)
    }
  }, [])

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
        if (res.data) {
          if (checkId) {
            prodCheckDispatch({ type: 'FETCH_DATA_SUCCESS' })
            healthRecheck({
              variables: {
                sbomId: sbomId,
                checkId: checkId,
                compId: activeCheck.id
              }
            })
          }
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
    supName === '' || emailError != '' || (orgUrl !== '' && isValidUrl !== '')

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
                width='100%'
                direction={'row'}
                alignItems={'center'}
                justifyContent={'flex-start'}
                wrap={'wrap'}
                gap={2}
                mb={4}
              >
                <Text fontWeight={'medium'}>{data.name}</Text>
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
              <FormControl>
                <FormLabel fontSize={'sm'}>Organization Name</FormLabel>
                <Input
                  placeholder='Enter organization name'
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              </FormControl>
              {/* ORG URL */}
              <FormControl isInvalid={orgUrl !== '' && !validateUrl(orgUrl) && containsSpace}>
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
              <FormControl isRequired>
                <FormLabel fontSize={'sm'}>Contact Name</FormLabel>
                <Input
                  placeholder='Enter supplier name'
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                />
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
                <Button colorScheme='gray' onClick={onClose}>
                  Cancel
                </Button>
                {data && data.suppliers?.length > 0 ? (
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

export default SupplierModal
