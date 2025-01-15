import { useMutation } from '@apollo/client'
import { PackageURL } from 'packageurl-js'
import { useEffect, useState } from 'react'
import { validateCpe } from 'utils/cpeUtils'

import {
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Icon,
  IconButton,
  Input,
  Stack,
  Text
} from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'
import LynkDate from 'components/LynkDate'
import LynkModal from 'components/LynkModal'

import { useThemeColor } from 'hooks/useThemeColors'

import {
  CreateCompSupportOverride as CreateSupport,
  UpdateCompSupportOverride as UpdateSupport
} from 'graphQL/Mutation'

import { BsHeartPulse } from 'react-icons/bs'
import { FaPlus } from 'react-icons/fa'
import { MdDeleteOutline } from 'react-icons/md'

const SupportModal = ({ supports, data, isOpen, onClose }) => {
  const initialData = {
    idUri: '',
    name: '',
    version: '',
    eos: null,
    eol: null,
    deprecated: false,
    outdated: false
  }
  const [formData, setFormData] = useState(initialData)
  const [IDs, setIDs] = useState([{ id: 1, value: '', error: '' }])
  const [error, setError] = useState('')

  const { idUri, name, version } = formData || {}

  const [createSupport, { loading: crLoading }] = useMutation(CreateSupport)
  const [updateSupport, { loading: upLoading }] = useMutation(UpdateSupport)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    setError('')
  }

  const { primaryErrorColor, grayBorderColor } = useThemeColor([
    'primaryErrorColor',
    'grayBorderColor'
  ])

  const hasSimilarRow = (data) => {
    for (let i = 0; i < data.length; i++) {
      for (let j = i + 1; j < data.length; j++) {
        if (data[i].value === data[j].value) {
          return true
        }
      }
    }
    return false
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
    if (formData?.idUri !== '') {
      if (formData?.idUri?.startsWith(`cpe`)) {
        const matches = validateCpe(formData?.idUri)
        if (matches) {
          setError('')
        } else {
          setError('Please enter a valid CPE')
        }
      } else if (formData?.idUri?.startsWith(`pkg`)) {
        try {
          PackageURL.fromString(formData?.idUri)
          setError('')
        } catch (ex) {
          setError(`Please enter a valid PURL`)
        }
      }
    }
  }

  const handleDateChange = (type, newDate) => {
    const isValidDate = newDate && !isNaN(newDate)
    if (type === 'eos') {
      setFormData((prev) => ({ ...prev, eos: newDate?._d }))
    } else {
      setFormData((prev) => ({ ...prev, eol: newDate?._d }))
    }
    if (newDate && !isValidDate) {
      setError('Please enter a valid date')
    } else {
      setError('')
    }
  }

  const isInvalid =
    error !== '' || idUri === '' || idUri === name || idUri === version

  const handleCreate = () => {
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
                enabled: true,
                idUri: item?.value,
                name: formData?.name,
                eol: formData?.eol || undefined,
                eos: formData?.eos || undefined,
                version: formData?.version,
                outdated: formData?.outdated,
                deprecated: formData?.deprecated
              }
            }).then((res) => {
              const errors = res?.data?.componentSupportOverrideCreate?.errors
              if (errors?.length > 0) {
                setError(errors[0])
              } else {
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

  const handleUpdate = () => {
    if (
      formData?.idUri !== '' &&
      (formData?.idUri?.startsWith('pkg') || formData?.idUri?.startsWith('cpe'))
    ) {
      updateSupport({
        variables: {
          id: data?.id,
          name: formData?.name,
          enabled: data?.enabled,
          idUri: formData?.idUri,
          eol: formData?.eol || '',
          eos: formData?.eos || '',
          version: formData?.version,
          outdated: formData?.outdated,
          deprecated: formData?.deprecated
        }
      }).then((res) => {
        const errors = res?.data?.componentSupportOverrideUpdate?.errors
        if (errors?.length > 0) {
          setError(errors[0])
        } else {
          setFormData(initialData)
          onClose()
        }
      })
    } else {
      setError('Invalid PURL or CPE')
    }
  }

  useEffect(() => {
    if (data) {
      setFormData(() => ({
        idUri: data?.idUri,
        name: data?.productName,
        outdated: data?.outdated,
        deprecated: data?.deprecated,
        version: data?.productVersion,
        eol: data?.eol ? new Date(data?.eol) : null,
        eos: data?.eos ? new Date(data?.eos) : null
      }))
    }
  }, [data])

  return (
    <>
      <LynkModal
        isOpen={isOpen}
        onClose={onClose}
        Icon={BsHeartPulse}
        buttonText={data ? 'Update' : 'Save'}
        isLoading={data ? upLoading : crLoading}
        onSubmit={data ? handleUpdate : handleCreate}
        title={`${data ? 'Edit' : 'Create'} Support`}
        disabled={data ? isInvalid : errorMessage || error !== ''}
      >
        <Flex width={'100%'} direction={'column'} gap={4}>
          <FormControl isInvalid={name !== '' && idUri === name}>
            <FormLabel htmlFor='name'>Product name</FormLabel>
            <Input
              type='text'
              name='name'
              fontSize={14}
              value={formData?.name}
              onChange={handleChange}
              placeholder='Enter Product Name'
            />
            <FormErrorMessage>Invalid name</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={version !== '' && idUri === version}>
            <FormLabel htmlFor='version'>Product version</FormLabel>
            <Input
              type='text'
              fontSize={14}
              name='version'
              onChange={handleChange}
              value={formData?.version}
              placeholder='Enter Product Version'
            />
            <FormErrorMessage>Invalid version</FormErrorMessage>
          </FormControl>
          <FormControl>
            <FormLabel htmlFor='eol'>End of life</FormLabel>
            <LynkDate
              value={formData?.eol}
              onChange={(newDate) => handleDateChange('eol', newDate)}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor='eos'>End of service</FormLabel>
            <LynkDate
              value={formData?.eos}
              onChange={(newDate) => handleDateChange('eos', newDate)}
            />
          </FormControl>
          <HStack>
            <FormControl>
              <Checkbox
                name='deprecated'
                onChange={handleChange}
                isChecked={formData?.deprecated}
              >
                <Text fontSize={12} fontWeight={400}>
                  Deprecated
                </Text>
              </Checkbox>
            </FormControl>
            <FormControl>
              <Checkbox
                name='outdated'
                onChange={handleChange}
                isChecked={formData?.outdated}
              >
                <Text fontSize={12} fontWeight={400}>
                  Outdated
                </Text>
              </Checkbox>
            </FormControl>
          </HStack>
          <Stack alignItems={'flex-start'} gap={2}>
            <FormControl isRequired>
              <FormLabel>IDs</FormLabel>
              {data ? (
                <Input
                  type='text'
                  name='idUri'
                  onBlur={onUriBlur}
                  value={formData?.idUri}
                  onChange={handleChange}
                />
              ) : (
                <Flex flexDirection={'column'} gap={2}>
                  {IDs?.length > 0 &&
                    IDs?.map((item) => (
                      <Flex
                        key={item?.id}
                        justifyContent={'space-between'}
                        sx={{ w: '100%', gap: 2, alignItems: 'items-start' }}
                      >
                        <Stack width={'100%'}>
                          <Input
                            type='text'
                            fontSize={14}
                            value={item?.value}
                            onBlur={() => onIdBlur(item)}
                            placeholder='Enter PURL / CPE'
                            onChange={(e) =>
                              handleIdChange(e.target.value, item.id)
                            }
                          />
                          {item?.error !== '' && (
                            <Text
                              mt={1}
                              color={primaryErrorColor}
                              fontSize={'sm'}
                            >
                              {item?.error}
                            </Text>
                          )}
                        </Stack>
                        <IconButton
                          border='1px solid'
                          colorScheme='white'
                          borderColor={grayBorderColor}
                          aria-label='Remove id'
                          onClick={() => deleteRow(item?.id)}
                          display={item?.id === 1 ? 'none' : 'flex'}
                          icon={
                            <Icon
                              as={MdDeleteOutline}
                              sx={{ w: 6, h: 6, color: primaryErrorColor }}
                            />
                          }
                        />
                      </Flex>
                    ))}
                </Flex>
              )}
            </FormControl>
            <Button
              hidden={data}
              variant='link'
              onClick={addRow}
              colorScheme='blue'
              leftIcon={<FaPlus />}
              title='Add support ID'
              sx={{ fontSize: 'sm', fontWeight: 'medium' }}
            >
              Add ID
            </Button>
          </Stack>
          {error !== '' && <LynkAlert msg={error} />}
        </Flex>
      </LynkModal>
    </>
  )
}

export default SupportModal
