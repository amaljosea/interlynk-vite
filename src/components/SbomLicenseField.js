import { InfoIcon } from '@chakra-ui/icons'
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
import { MdArrowOutward } from 'react-icons/md'

const SbomLicenseField = ({ data }) => {
  const {
    sbomSpdxList,
    setSbomSpdxList,
    sbomCustomList,
    setSbomCustomList,
    sbomLicenseType,
    setSbomLicenseType,
    sbomSpdxLicense,
    setSbomSpdxLicense,
    sbomLicenseExp,
    setSbomLicenseExp,
    sbomCustomLicense,
    setSbomCustomLicense
  } = useContext(GlobalContext)

  const [licenseList, setLicenseList] = useState([])
  const [isValid, setIsValid] = useState(true)
  const [getCpe] = useLazyQuery(CpeAutoComplete)

  const onLicenseChange = (selected) => {
    console.log(selected)
    setSbomSpdxList(selected)
    if (selected) {
      const selectedIds = selected.map((option) => option.value)
      setSbomSpdxLicense(selectedIds)
    } else {
      setSbomSpdxLicense([])
    }
  }

  const onCustomChange = (selected) => {
    console.log(selected)
    setSbomCustomList(selected)
    if (selected) {
      const selectedIds = selected.map((option) => option.value)
      setSbomCustomLicense(selectedIds)
    } else {
      setSbomCustomLicense([])
    }
  }

  const createOption = (label) => ({
    label,
    value: label.toLowerCase().replace(/\W/g, '')
  })

  const handleCreate = (inputValue) => {
    console.log('inputValue', inputValue)
    const newOption = createOption(inputValue)
    setSbomCustomList((prev) => [newOption, ...prev])
    setSbomCustomLicense((prev) => [inputValue, ...prev])
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
    setSbomLicenseExp(value)
  }

  const handleKeyDown = () => {
    if (sbomLicenseExp !== '') {
      const trimmedInput =
        typeof sbomLicenseExp === 'string' ? sbomLicenseExp.trim() : ''
      const isLicenseValid = spdxValidate(trimmedInput)
      setIsValid(isLicenseValid)
    } else {
      setIsValid(true)
    }
  }

  const handleTypeChange = (value) => {
    setSbomLicenseType(value)
  }

  return (
    <VStack spacing={4} alignItems={'flex-start'}>
      <FormControl>
        <FormLabel htmlFor={'sbomLicenseType'}>
          <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
            <Text>Licenses</Text>
            <Tooltip label='List of licenses applicable to the component'>
              <Icon as={InfoIcon} color={'blue.500'} />
            </Tooltip>
          </Flex>
        </FormLabel>
        {/* LICENSE TYPE */}
        <RadioGroup
          size='sm'
          value={sbomLicenseType}
          onChange={handleTypeChange}
        >
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
        {sbomLicenseType === 'license_spdx' && (
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
            value={sbomSpdxList}
            options={licenseList}
            onChange={onLicenseChange}
            onInputChange={handleInputChange}
            placeholder={''}
            className='react-select'
          />
        )}
        {/* LICENSE EXPRESSION */}
        {sbomLicenseType === 'license_exp' && (
          <>
            <Input
              type='text'
              value={sbomLicenseExp}
              fontSize={'sm'}
              onChange={handleExpChange}
              onKeyDown={handleKeyDown}
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
        {sbomLicenseType === 'license_custom' && (
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
            value={sbomCustomList}
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

export default SbomLicenseField
