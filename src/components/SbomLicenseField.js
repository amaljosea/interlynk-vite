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
import { useEffect, useState } from 'react'
import ReactSelect from 'react-select'
import CreatableSelect from 'react-select/creatable'
import { CpeAutoComplete } from 'graphQL/Queries'
import { useLazyQuery } from '@apollo/client'
import spdxValidate from 'spdx-expression-validate'
import { MdArrowOutward } from 'react-icons/md'
import { useGlobalState } from 'hooks/useGlobalState'

const SbomLicenseField = ({ isValid, setIsValid }) => {
  const { sbomState, dispatch } = useGlobalState()
  const { licenseType, spdxList, customList, expLicense } = sbomState
  const { sbomDispatch } = dispatch

  const [licenseList, setLicenseList] = useState([])
  const [getCpe] = useLazyQuery(CpeAutoComplete)

  const onLicenseChange = (selected) => {
    console.log('selected', selected)
    if (selected) {
      sbomDispatch({ type: 'SET_SPDX_LICENSES', payload: selected })
    } else {
      sbomDispatch({ type: 'SET_SPDX_LICENSES', payload: [] })
    }
  }

  const onCustomChange = (selected) => {
    if (selected) {
      sbomDispatch({ type: 'SET_CUSTOM_LICENSES', payload: selected })
    } else {
      sbomDispatch({ type: 'SET_CUSTOM_LICENSES', payload: [] })
    }
  }

  const handleCreate = (inputValue) => {
    console.log('inputValue', inputValue)
    sbomDispatch({ type: 'CREATE_CUSTOM_LICENSES', payload: inputValue })
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

  const [exp, setExp] = useState('')

  useEffect(() => {
    if (expLicense) {
      setExp(expLicense)
    }
  }, [expLicense])

  const handleExpChange = (e) => {
    const { value } = e.target
    setExp(value)
    setIsValid(true)
  }

  const handleExpBlur = () => sbomDispatch({ type: 'SET_EPX_LICENSE', payload: exp })

  const handleTypeChange = (value) => {
    sbomDispatch({ type: 'SET_LICENSE_TYPE', payload: value })
  }


  return (
    <VStack spacing={4} alignItems={'flex-start'}>
      <FormControl>
        <FormLabel htmlFor={'licenseType'}>
          <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
            <Text>Licenses</Text>
            <Tooltip label='Data licence is a legal arrangement between the creator of the data and the end-user, or the place the data will be deposited, specifying what users can do with the data'>
              <Icon as={InfoIcon} color={'blue.500'} />
            </Tooltip>
          </Flex>
        </FormLabel>
        {/* LICENSE TYPE */}
        <RadioGroup size='sm' value={licenseType} onChange={handleTypeChange}>
          <Stack direction='row' my={4} spacing={0} alignItems={'center'}>
            <Radio value='license_spdx' display={'none'}>
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
                placeholder={'Enter SPDX License ID'}
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
            <Radio value='license_custom' display={'none'}>
              Custom
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
              value={exp}
              fontSize={'sm'}
              onBlur={handleExpBlur}
              onChange={handleExpChange}
              placeholder='Enter valid SPDX Expression'
            />
            {exp !== '' && !isValid && (
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

export default SbomLicenseField
