import { useMutation } from '@apollo/client'
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, Flex, FormControl, FormLabel, Input, Alert, AlertIcon, AlertDescription, Checkbox, FormErrorMessage } from '@chakra-ui/react'
import { UpdateCompSupportOverride } from 'graphQL/Mutation'
import { CreateCompSupportOverride } from 'graphQL/Mutation'
import { useGlobalState } from 'hooks/useGlobalState'
import { useEffect, useState } from 'react'
import Datetime from 'react-datetime'
import 'react-datetime/css/react-datetime.css'

const SupportModal = ({ data, isOpen, onClose, refetch }) => {
  const { totalRows, supportState } = useGlobalState()
  const { searchInput, field, direction } = supportState

  const [idUri, setIdUri] = useState('')
  const [productName, setProductName] = useState('')
  const [productVersion, setProductVersion] = useState('')
  const [error, setError] = useState('')
  const [eol, setEol] = useState(null)
  const [isValidEol, setIsValidEol] = useState(true)
  const [eos, setEos] = useState(null)
  const [isValidEos, setIsValidEos] = useState(true)
  const [deprecated, setDeprecated] = useState(false)
  const [outdated, setOutdated] = useState(false)

  const [createSupport] = useMutation(CreateCompSupportOverride)
  const [updateSupport] = useMutation(UpdateCompSupportOverride)

  const handleRefetch = () => {
    refetch({ variables: { search: searchInput === '' ? undefined : searchInput, first: totalRows, field: field, direction: direction } })
  }

  const handleEolChange = (newDate) => {
    const currentDate = new Date()
    console.log('newDate', newDate)
    const isValidDate = newDate && !isNaN(newDate) && newDate?._d > currentDate
    setEol(newDate._d)
    if (isValidDate) {
      setIsValidEol(true)
    } else {
      if (typeof newDate === 'string' && newDate === '') {
        setIsValidEol(true)
      } else {
        setIsValidEol(false)
      }
    }
  }

  const handleEosChange = (newDate) => {
    const currentDate = new Date()
    const isValidDate = newDate && !isNaN(newDate) && newDate?._d > currentDate
    setEos(newDate._d)
    if (isValidDate) {
      setIsValidEos(true)
    } else {
      if (typeof newDate === 'string' && newDate === '') {
        setIsValidEos(true)
      } else {
        setIsValidEos(false)
      }
    }
  }

  const isInvalid = idUri === '' || productName === '' || error !== '' || !isValidEol || !isValidEos

  const handleCreate = async (e) => {
    e.preventDefault()
    await createSupport({
      variables: { idUri, name: productName, version: productVersion === '' ? undefined : productVersion, eol: eol ? eol : undefined, eos: eos ? eos : undefined, enabled: true, deprecated, outdated }
    }).then((res) => {
      if (res?.data) {
        handleRefetch()
        setIdUri('')
        setProductName('')
        setProductVersion('')
        setEol(null)
        setEos(null)
        setDeprecated(false)
        setOutdated(false)
        onClose()
      }
    })
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    await updateSupport({
      variables: { id: data?.id, idUri, name: productName, version: productVersion === '' ? undefined : productVersion, eol: eol ? eol : undefined, eos: eos ? eos : undefined, enabled: data?.enabled, deprecated, outdated }
    }).then((res) => {
      if (res?.data) {
        handleRefetch()
        setIdUri('')
        setProductName('')
        setProductVersion('')
        setEol(null)
        setEos(null)
        setDeprecated(false)
        setOutdated(false)
        onClose()
      }
    })
  }

  useEffect(() => {
    if (data) {
      setIdUri(data?.idUri || '')
      setProductName(data?.productName || '')
      setProductVersion(data?.productVersion || '')
      setEos(data?.eos ? new Date(data?.eos) : null)
      setEol(data?.eol ? new Date(data?.eol) : null)
      setDeprecated(data?.deprecated)
      setOutdated(data?.outdated)
    }
  }, [data])

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <form onSubmit={data ? handleUpdate : handleCreate}>
          <ModalContent>
            <ModalHeader>{data ? 'Edit' : 'Create'} Support</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex width={'100%'} direction={'column'} gap={4}>
                {error !== '' && (
                  <Alert status='error' borderRadius={4}>
                    <AlertIcon />
                    <AlertDescription fontSize={'sm'} pr={2}>{error}</AlertDescription>
                  </Alert>
                )}
                <FormControl isRequired>
                  <FormLabel>URI</FormLabel>
                  <Input type='text' value={idUri}
                    onChange={(e) => {
                      setIdUri(e.target.value)
                      setError('')
                    }}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Product name</FormLabel>
                  <Input type='text' value={productName}
                    onChange={(e) => {
                      setProductName(e.target.value)
                      setError('')
                    }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Product version</FormLabel>
                  <Input type='text' value={productVersion} onChange={(e) => setProductVersion(e.target.value)} />
                </FormControl>
                <FormControl isInvalid={!isValidEol}>
                  <FormLabel mb={1} htmlFor='expire'>End of life</FormLabel>
                  <Datetime value={eol} timeFormat={false} onChange={handleEolChange} inputProps={{ onCopy: (e) => e.preventDefault(), onPaste: (e) => e.preventDefault() }} />
                  {!isValidEol && <FormErrorMessage> Please enter a valid expiry date </FormErrorMessage>}
                </FormControl>
                <FormControl isInvalid={!isValidEos}>
                  <FormLabel mb={1} htmlFor='expire'>End of service</FormLabel>
                  <Datetime value={eos} timeFormat={false} onChange={handleEosChange} inputProps={{ onCopy: (e) => e.preventDefault(), onPaste: (e) => e.preventDefault() }} />
                  {!isValidEos && <FormErrorMessage>Please enter a valid expiry date</FormErrorMessage>}
                </FormControl>
                <FormControl>
                  <Checkbox isChecked={deprecated} onChange={(e) => setDeprecated(e.target.checked)}>
                    Deprecated
                  </Checkbox>
                </FormControl>
                <FormControl>
                  <Checkbox isChecked={outdated} onChange={(e) => setOutdated(e.target.checked)} >
                    Outdated
                  </Checkbox>
                </FormControl>
              </Flex>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme='gray' mr={3} onClick={onClose}>Cancel</Button>
              <Button colorScheme='blue' type='submit' disabled={isInvalid}>{data ? 'Update' : 'Save'}</Button>
            </ModalFooter>
          </ModalContent>
        </form>
      </Modal>
    </>
  )
}

export default SupportModal
