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
  Input
} from '@chakra-ui/react'
import { useContext, useState } from 'react'
import ReactSelect from 'react-select'
import GlobalContext from 'context/GlobalContext'
import { CpeAutoComplete } from 'graphQL/Queries'
import { useLazyQuery } from '@apollo/client'
import spdxValidate from 'spdx-expression-validate'

const LicenseField = ({ exp, expLicense, setExpLicense }) => {
  const { spdxList, setSpdxList, licenseType, setLicenseType, setSpdxLicense } =
    useContext(GlobalContext)

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
    if (value === 'license_exp') {
      setSpdxLicense([])
      setSpdxList([])
      setIsValid(true)
      setExpLicense(exp ? exp : '')
    } else if (value === 'license_spdx') {
      setExpLicense('')
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
          <Stack direction='row' my={4} spacing={3}>
            <Radio value='license_spdx'>SPDX ID</Radio>
            <Radio value='license_exp'>SPDX Expression</Radio>
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
          <>
            <Alert status='info' fontSize={'sm'} borderRadius={4} py={2}>
              <AlertIcon width={4} />
              Coming Soon
            </Alert>
          </>
        )}
      </FormControl>
    </VStack>
  )
}

export default LicenseField
