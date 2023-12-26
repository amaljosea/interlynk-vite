import { ExternalLinkIcon, InfoIcon } from '@chakra-ui/icons'
import {
  Flex,
  FormControl,
  FormLabel,
  Tooltip,
  Icon,
  Text,
  VStack,
  Stack,
  RadioGroup,
  Radio,
  Alert,
  AlertIcon,
  Input,
  Link
} from '@chakra-ui/react'
import { useState } from 'react'
import ReactSelect from 'react-select'
import CreatableSelect from 'react-select/creatable'
import { CpeAutoComplete } from 'graphQL/Queries'
import { useLazyQuery } from '@apollo/client'
import spdxValidate from 'spdx-expression-validate'
import { MdArrowOutward } from 'react-icons/md'
import { useGlobalState } from 'hooks/useGlobalState'

const LicenseField = () => {
  const { prodCompState, dispatch } = useGlobalState()
  const { licenseType, spdxList, customList, expLicense } = prodCompState
  const { prodCompDispatch } = dispatch

  const [licenseList, setLicenseList] = useState([])
  const [isValid, setIsValid] = useState(true)
  const [getCpe] = useLazyQuery(CpeAutoComplete)

  const onLicenseChange = (selected) => {
    if (selected) {
      prodCompDispatch({ type: 'SET_SPDX_LICENSES', payload: selected })
    } else {
      prodCompDispatch({ type: 'SET_SPDX_LICENSES', payload: [] })
    }
  }

  const onCustomChange = (selected) => {
    if (selected) {
      prodCompDispatch({ type: 'SET_CUSTOM_LICENSES', payload: selected })
    } else {
      prodCompDispatch({ type: 'SET_CUSTOM_LICENSES', payload: [] })
    }
  }

  const createOption = (label) => ({
    label,
    value: label.toLowerCase().replace(/\W/g, '')
  })

  const handleCreate = (inputValue) => {
    console.log('inputValue', inputValue)
    prodCompDispatch({ type: 'CREATE_CUSTOM_LICENSES', payload: inputValue })
  }

  const handleInputChange = (value) => {
    if (value !== '') {
      getCpe({
        variables: {
          input: {
            idType: 'spdx',
            ecosystem: 'spdx',
            search: {
              shortId: value
            }
          }
        }
      }).then((res) => {
        if (res.data) {
          const licenses = res.data.idAutoComplete.result.map((value) => ({
            value: value,
            label: value
          }))
          setLicenseList(licenses)
        }
      })
    } else {
      setLicenseList([])
    }
  }

  const handleExpChange = (e) => {
    const { value } = e.target
    prodCompDispatch({ type: 'SET_EPX_LICENSE', payload: value })
    if (value !== '') {
      const trimmedInput = typeof value === 'string' ? value.trim() : ''
      const isLicenseValid = spdxValidate(trimmedInput)
      setIsValid(isLicenseValid)
    } else {
      setIsValid(true)
    }
  }

  const handleTypeChange = (value) => {
    prodCompDispatch({ type: 'SET_LICENSE_TYPE', payload: value })
  }

  return (
    <VStack spacing={4} alignItems={'flex-start'}>
      <FormControl>
        <FormLabel htmlFor={licenseType}>
          <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
            <Text>Licenses</Text>
            <Tooltip label='List of licenses applicable to the component'>
              <Icon as={InfoIcon} color={'blue.500'} />
            </Tooltip>
          </Flex>
        </FormLabel>
        {/* LICENSE TYPE */}
        <RadioGroup size='sm' value={licenseType} onChange={handleTypeChange}>
          <Stack direction='row' my={4} spacing={3} alignItems={'center'}>
            <Radio value='license_spdx'>
              License ID
              <Link
                href={
                  'https://spdx.github.io/spdx-spec/v2.3/SPDX-license-list/'
                }
                target={'_blank'}
                ml={1}
              >
                <Icon
                  as={MdArrowOutward}
                  h={'16px'}
                  w={'16px'}
                  color={'blue.500'}
                />
              </Link>
            </Radio>
            <Radio value='license_exp'>
              License Expression
              <Link
                href={
                  'https://spdx.github.io/spdx-spec/v2.3/SPDX-license-expressions'
                }
                target={'_blank'}
                ml={1}
              >
                <Icon
                  as={MdArrowOutward}
                  h={'16px'}
                  w={'16px'}
                  color={'blue.500'}
                />
              </Link>
            </Radio>
            <Radio value='license_custom'>Custom</Radio>
          </Stack>
        </RadioGroup>
        {/* SPDX LICENSE */}
        {licenseType === 'license_spdx' && (
          <ReactSelect
            styles={{
              control: (baseStyles, state) => ({
                ...baseStyles,
                borderColor: state.isFocused ? 'inherit' : 'inherit',
                fontSize: '14px',
                padding: '2px 0',
                '&:hover': {
                  borderColor: '#CBD5E0'
                }
              })
            }}
            isMulti
            components={{
              DropdownIndicator: () => null,
              IndicatorSeparator: () => null
            }}
            value={spdxList}
            options={licenseList}
            onChange={onLicenseChange}
            onInputChange={handleInputChange}
            placeholder={'Enter SPDX License ID'}
            className='react-select'
          />
        )}
        {/* LICENSE EXPRESSION */}
        {licenseType === 'license_exp' && (
          <>
            <Input
              type='text'
              value={expLicense}
              fontSize={'sm'}
              onChange={handleExpChange}
              placeholder='Enter a valid SPDX Expression'
            />
            {!isValid && (
              <Alert
                fontSize={'sm'}
                mt='2'
                status='error'
                py={2}
                borderRadius={4}
              >
                <AlertIcon width={4} />
                Invalid license expression
              </Alert>
            )}
          </>
        )}
        {/* CUSTOM LICENSE */}
        {licenseType === 'license_custom' && (
          <CreatableSelect
            styles={{
              control: (baseStyles, state) => ({
                ...baseStyles,
                borderColor: state.isFocused ? 'inherit' : 'inherit',
                fontSize: '14px',
                padding: '2px 0',
                '&:hover': {
                  borderColor: '#CBD5E0'
                }
              })
            }}
            isMulti
            components={{
              DropdownIndicator: () => null,
              IndicatorSeparator: () => null
            }}
            formatCreateLabel={(value) => `${value}`}
            value={customList}
            onChange={onCustomChange}
            onCreateOption={handleCreate}
            placeholder={'Enter Custom License Name'}
            className='react-select'
          />
        )}
      </FormControl>
    </VStack>
  )
}

export default LicenseField
