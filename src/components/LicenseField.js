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
  AlertIcon
} from '@chakra-ui/react'
import { useContext, useState } from 'react'
import CreatableSelect from 'react-select/creatable'
import ReactSelect from 'react-select'
import GlobalContext from 'context/GlobalContext'
import { CpeAutoComplete } from 'graphQL/Queries'
import { useLazyQuery } from '@apollo/client'

const LicenseField = ({ exp }) => {
  const {
    spdxList,
    setSpdxList,
    expList,
    setExpList,
    customList,
    setCustomList,
    licenseType,
    setLicenseType,
    setSpdxLicense,
    setLicenseExp,
    setCustomLicense
  } = useContext(GlobalContext)

  const [licenseList, setLicenseList] = useState([])

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

  const onExpChange = (selected) => {
    setExpList(selected)

    if (selected) {
      const selectedIds = selected.map((option) => option.value)
      setLicenseExp(selectedIds)
    } else {
      setLicenseExp([])
    }
  }

  const onCustomChange = (selected) => {
    setCustomList(selected)
    if (selected) {
      const selectedIds = selected.map((option) => option.value)
      setCustomLicense(selectedIds)
    } else {
      setCustomLicense([])
    }
  }

  const handleTypeChange = (value) => {
    setLicenseType(value)
    switch (value) {
      case 'license_exp':
        if (exp && exp.length > 0) {
          const filterData = exp.map((option) => ({
            value: option,
            label: option
          }))
          setExpList(filterData)
          const selectedIds = filterData.map((option) => option.value)
          setLicenseExp(selectedIds)
        }
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
            value={expList}
            onChange={onExpChange}
            placeholder={'Enter a valid SPDX Expression'}
            className='react-select'
          />
        )}
        {/* CUSTOM LICENSE */}
        {licenseType === 'license_custom' && (
          <>
            <Alert status='info' fontSize={'sm'} borderRadius={4} py={2}>
              <AlertIcon width={4} />
              Coming Soon
            </Alert>
            <CreatableSelect
              styles={{
                control: (baseStyles, state) => ({
                  ...baseStyles,
                  borderColor: state.isFocused ? 'inherit' : 'inherit',
                  fontSize: '14px',
                  padding: '2px 0',
                  display: 'none',
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
              className='react-select'
              value={customList}
              onChange={onCustomChange}
              placeholder={'Enter License Name'}
            />
          </>
        )}
      </FormControl>
    </VStack>
  )
}

export default LicenseField
