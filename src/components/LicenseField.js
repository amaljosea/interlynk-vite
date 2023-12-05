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
import { useContext, useState } from 'react'
import ReactSelect from 'react-select'
import CreatableSelect from 'react-select/creatable'
import GlobalContext from 'context/GlobalContext'
import { CpeAutoComplete } from 'graphQL/Queries'
import { useLazyQuery } from '@apollo/client'
import spdxValidate from 'spdx-expression-validate'
import { MdArrowOutward } from "react-icons/md";

const LicenseField = ({ data, expLicense, setExpLicense }) => {
  const {
    spdxList,
    setSpdxList,
    licenseType,
    setLicenseType,
    setSpdxLicense,
    customLicense,
    setCustomLicense,
    customList,
    setCustomList
  } = useContext(GlobalContext)

  const [licenseList, setLicenseList] = useState([])
  const [isValid, setIsValid] = useState(true)
  const [getCpe] = useLazyQuery(CpeAutoComplete)

  const onLicenseChange = (selected) => {
    console.log(selected)
    setSpdxList(selected)
    if (selected) {
      const selectedIds = selected.map((option) => option.value)
      setSpdxLicense(selectedIds)
    } else {
      setSpdxLicense([])
    }
  }

  const onCustomChange = (selected) => {
    console.log(selected)
    setCustomList(selected)
    if (selected) {
      const selectedIds = selected.map((option) => option.value)
      setCustomLicense(selectedIds)
    } else {
      setCustomLicense([])
    }
  }

  const createOption = (label) => ({
    label,
    value: label.toLowerCase().replace(/\W/g, '')
  })

  const handleCreate = (inputValue) => {
    console.log('inputValue', inputValue)
    const newOption = createOption(inputValue)
    setCustomList((prev) => [newOption, ...prev])
    setCustomLicense((prev) => [inputValue, ...prev])
  }

  const handleInputChange = (value) => {
    console.log('value', value)
    if (value !== '') {
      getCpe({
        variables: {
          input: {
            idType: 'spdx',
            ecosystem: 'spdx',
            search: {
              name: value
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
    setExpLicense(value)
    if (value !== '') {
      const trimmedInput = typeof value === 'string' ? value.trim() : ''
      const isLicenseValid = spdxValidate(trimmedInput)
      setIsValid(isLicenseValid)
    } else {
      setIsValid(true)
    }
  }

  const handleTypeChange = (value) => {
    setLicenseType(value)
    if (value === 'license_spdx') {
      const filterData = data.licenses.map((option) => ({
        value: option,
        label: option
      }))
      setSpdxList(filterData)
      setSpdxLicense(data.licenses)
    } else if (value === 'license_exp') {
      setExpLicense(data.licensesExp)
    } else if (value === 'license_custom') {
      const filterData = data.licensesCustom.map((option) => ({
        value: option,
        label: option
      }))
      setCustomList(filterData)
      setCustomLicense(data.licensesCustom)
    }
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
              SPDX ID
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
            <Radio value='license_exp'>
              SPDX Expression
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
            <Radio value='license_custom'>
              Custom
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
            placeholder={''}
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
            value={customList}
            onChange={onCustomChange}
            onCreateOption={handleCreate}
            placeholder={'Enter License Name'}
            className='react-select'
          />
        )}
      </FormControl>
    </VStack>
  )
}

export default LicenseField
