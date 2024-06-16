import { useMutation } from '@apollo/client'
import { PackageURL } from 'packageurl-js'
import { useEffect, useState } from 'react'
import Datetime from 'react-datetime'
import 'react-datetime/css/react-datetime.css'
import { validateCpe } from 'utils'

import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useColorMode
} from '@chakra-ui/react'

import {
  CreateCompSupportOverride,
  UpdateCompSupportOverride
} from 'graphQL/Mutation'

import { FaPlus, FaTrash } from 'react-icons/fa'

const SupportModal = ({ supports, data, isOpen, onClose, refetch }) => {
  const [idUri, setIdUri] = useState('')
  const [productName, setProductName] = useState('')
  const [productVersion, setProductVersion] = useState('')
  const [error, setError] = useState('')
  const [eol, setEol] = useState(null)
  const [eos, setEos] = useState(null)
  const [deprecated, setDeprecated] = useState(false)
  const [outdated, setOutdated] = useState(false)
  const [IDs, setIDs] = useState([{ id: 1, value: '', error: '' }])

  const { colorMode } = useColorMode()
  const react_datatime = colorMode === 'light' ? 'light_picker' : 'dark_picker'

  const [createSupport] = useMutation(CreateCompSupportOverride)
  const [updateSupport] = useMutation(UpdateCompSupportOverride)

  const hasSimilarRow = (data) => {
    for (let i = 0; i < data.length; i++) {
      for (let j = i + 1; j < data.length; j++) {
        if (data[i].value === data[j].value) {
          return true // Similar row found
        }
      }
    }
    return false // No similar rows found
  }

  const checkDataValidity = (data) => {
    for (let i = 0; i < data.length; i++) {
      const { value, error } = data[i]
      if (value === '' || error !== '') {
        return 'Error: Some properties are empty'
      }
    }
    return null
  }

  const errorMessage = checkDataValidity(IDs)

  const addRow = () => {
    if (hasSimilarRow(IDs)) {
      setError(
        `Field with empty or same values already exists. Please update or remove it before continue.`
      )
    } else {
      setError('')
      const newId = IDs?.length + 1
      setIDs([...IDs, { id: newId, value: '', error: '' }])
    }
  }

  const deleteRow = (id) => {
    setError('')
    const newData = IDs?.filter((item) => item.id !== id)
    setIDs(newData)
  }

  const handleIdChange = (value, id) => {
    setError('')
    const newData = IDs.map((item) => {
      if (item.id === id) {
        return { ...item, value: value, error: '' }
      }
      return item
    })
    setIDs(newData)
  }

  const onIdBlur = (rule) => {
    const newData = IDs.map((item) => {
      if (item.id === rule?.id) {
        const { value } = rule
        if (value?.startsWith(`cpe`)) {
          const matches = validateCpe(value)
          if (matches) {
            return { ...item, value: value, error: '' }
          } else {
            return { ...item, value: value, error: 'Please enter a valid CPE' }
          }
        } else if (value?.startsWith(`pkg`)) {
          try {
            PackageURL.fromString(value)
            return { ...item, error: '' }
          } catch (ex) {
            return { ...item, error: 'Please enter a valid PURL' }
          }
        } else {
          return { ...item, error: '' }
        }
      }
      return item
    })
    setIDs(newData)
  }

  const onUriBlur = () => {
    if (idUri !== '') {
      if (idUri?.startsWith(`cpe`)) {
        const matches = validateCpe(idUri)
        if (matches) {
          setError('')
        } else {
          setError('Please enter a valid CPE')
        }
      } else if (idUri?.startsWith(`pkg`)) {
        try {
          PackageURL.fromString(idUri)
          setError('')
        } catch (ex) {
          setError(`Please enter a valid PURL`)
        }
      }
    }
  }

  const handleEolChange = (newDate) => {
    setEol(newDate._d)
  }

  const handleEosChange = (newDate) => {
    setEos(newDate._d)
  }

  const isInvalid =
    idUri === '' ||
    error !== '' ||
    idUri === productName ||
    idUri === productVersion

  const handleCreate = (e) => {
    e.preventDefault()
    if (IDs?.length > 0) {
      IDs?.map((item) => {
        if (
          item?.value !== '' &&
          item?.error === '' &&
          (item?.value?.startsWith('pkg') || item?.value?.startsWith('cpe'))
        ) {
          const existingIDs = supports?.some((sp) =>
            item?.value?.startsWith(sp?.idUri)
          )
          if (existingIDs) {
            setError('ID already exists')
          } else {
            createSupport({
              variables: {
                idUri: item?.value,
                name: productName,
                version: productVersion === '' ? undefined : productVersion,
                eol: eol ? eol : undefined,
                eos: eos ? eos : undefined,
                enabled: true,
                deprecated,
                outdated
              }
            }).then((res) => {
              const errors = res?.data?.componentSupportOverrideCreate?.errors
              if (errors?.length > 0) {
                setError(errors[0])
              } else {
                refetch()
                onClose()
              }
            })
          }
        } else {
          setError('Invalid PURL or CPE')
        }
      })
    } else {
      setError('Please enter atleast one ID')
    }
  }

  const handleUpdate = (e) => {
    e.preventDefault()
    if (
      idUri !== '' &&
      (idUri?.startsWith('pkg') || idUri?.startsWith('cpe'))
    ) {
      updateSupport({
        variables: {
          id: data?.id,
          idUri,
          name: productName,
          version: productVersion === '' ? undefined : productVersion,
          eol: eol ? eol : undefined,
          eos: eos ? eos : undefined,
          enabled: data?.enabled,
          deprecated,
          outdated
        }
      }).then((res) => {
        const errors = res?.data?.componentSupportOverrideUpdate?.errors
        if (errors?.length > 0) {
          setError(errors[0])
        } else {
          refetch()
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
    } else {
      setError('Invalid PURL or CPE')
    }
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
      <Modal size='lg' isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <form onSubmit={data ? handleUpdate : handleCreate}>
          <ModalContent>
            <ModalHeader>{data ? 'Edit' : 'Create'} Support</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex width={'100%'} direction={'column'} gap={4}>
                <FormControl
                  isInvalid={productName !== '' && idUri === productName}
                >
                  <FormLabel>Product name</FormLabel>
                  <Input
                    type='text'
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                  <FormErrorMessage>Invalid name</FormErrorMessage>
                </FormControl>
                <FormControl
                  isInvalid={productVersion !== '' && idUri === productVersion}
                >
                  <FormLabel>Product version</FormLabel>
                  <Input
                    type='text'
                    value={productVersion}
                    onChange={(e) => setProductVersion(e.target.value)}
                  />
                  <FormErrorMessage>Invalid version</FormErrorMessage>
                </FormControl>
                <FormControl>
                  <FormLabel mb={1} htmlFor='expire'>
                    End of life
                  </FormLabel>
                  <Datetime
                    value={eol}
                    timeFormat={false}
                    onChange={handleEolChange}
                    className={react_datatime}
                    inputProps={{
                      onCopy: (e) => e.preventDefault(),
                      onPaste: (e) => e.preventDefault(),
                      style: {
                        background: 'none'
                      }
                    }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel mb={1} htmlFor='expire'>
                    End of service
                  </FormLabel>
                  <Datetime
                    value={eos}
                    timeFormat={false}
                    onChange={handleEosChange}
                    className={react_datatime}
                    inputProps={{
                      onCopy: (e) => e.preventDefault(),
                      onPaste: (e) => e.preventDefault(),
                      style: {
                        background: 'none'
                      }
                    }}
                  />
                </FormControl>
                <HStack>
                  <FormControl>
                    <Checkbox
                      isChecked={deprecated}
                      onChange={(e) => setDeprecated(e.target.checked)}
                    >
                      Deprecated
                    </Checkbox>
                  </FormControl>
                  <FormControl>
                    <Checkbox
                      isChecked={outdated}
                      onChange={(e) => setOutdated(e.target.checked)}
                    >
                      Outdated
                    </Checkbox>
                  </FormControl>
                </HStack>
                <Stack alignItems={'flex-start'} gap={2}>
                  <FormControl isRequired>
                    <FormLabel>IDs</FormLabel>
                    {data ? (
                      <Input
                        type='text'
                        value={idUri}
                        onChange={(e) => {
                          setIdUri(e.target.value)
                          setError('')
                        }}
                        onBlur={onUriBlur}
                      />
                    ) : (
                      <Flex flexDirection={'column'} gap={2}>
                        {IDs?.length > 0 &&
                          IDs?.map((item) => (
                            <Flex
                              key={item?.id}
                              width={'100%'}
                              gap={4}
                              justifyContent={'space-between'}
                              alignItems={'items-start'}
                            >
                              <Stack width={'100%'}>
                                <Input
                                  fontSize={'sm'}
                                  placeholder='Enter PURL / CPE'
                                  type='text'
                                  alue={item?.value}
                                  onChange={(e) =>
                                    handleIdChange(e.target.value, item.id)
                                  }
                                  onBlur={() => onIdBlur(item)}
                                />
                                {item?.error !== '' && (
                                  <Text
                                    mt={1}
                                    color={'red.500'}
                                    fontSize={'sm'}
                                  >
                                    {item?.error}
                                  </Text>
                                )}
                              </Stack>
                              <Icon
                                mt={2}
                                as={FaTrash}
                                color={'red.500'}
                                cursor={'pointer'}
                                onClick={() => deleteRow(item?.id)}
                                display={item?.id === 1 ? 'none' : 'flex'}
                              />
                            </Flex>
                          ))}
                      </Flex>
                    )}
                  </FormControl>
                  <Button
                    fontSize={'sm'}
                    colorScheme='blue'
                    variant='link'
                    fontWeight={'medium'}
                    leftIcon={<FaPlus />}
                    onClick={addRow}
                    hidden={data}
                  >
                    Add ID
                  </Button>
                </Stack>
                {error !== '' && (
                  <Alert status='error' borderRadius={4}>
                    <AlertIcon />
                    <AlertDescription fontSize={'sm'} pr={2}>
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
              </Flex>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme='gray' mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme='blue'
                type='submit'
                isDisabled={data ? isInvalid : errorMessage || error !== ''}
              >
                {data ? 'Update' : 'Save'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </form>
      </Modal>
    </>
  )
}

export default SupportModal
