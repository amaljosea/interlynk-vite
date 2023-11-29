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
import { useState, useEffect, useContext } from 'react'
import { licenseOptions } from 'variables/licenses'
import CreatableSelect from 'react-select/creatable'
import ReactSelect from 'react-select'
import GlobalContext from 'context/GlobalContext'

const LicenseField = ({ data }) => {
  const [spdxList, setSpdxList] = useState([])
  const [expList, setExpList] = useState([])
  const [customList, setCustomList] = useState([])

  const {
    licenseType,
    setLicenseType,
    setSpdxLicense,
    setLicenseExp,
    setCustomLicense
  } = useContext(GlobalContext)

  const licenses = licenseOptions.map((option) => ({
    value: option.licenseId,
    label: option.name
  }))

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
        if (data && data.licenseExp.length > 0) {
          const filterData = data.licenseExp.map((option) => ({
            value: option,
            label: option
          }))
          setExpList(filterData)
          const selectedIds = filterData.map((option) => option.value)
          setLicenseExp(selectedIds)
        }
    }
  }

  useEffect(() => {
    if (data && data.licenses.length > 0 && licenseType === 'license_spdx') {
      const commonValues = licenseOptions.filter((item) =>
        data.licenses.includes(item.licenseId)
      )
      const filterData = commonValues.map((option) => ({
        value: option.licenseId,
        label: option.name
      }))
      setSpdxList(filterData)
      const selectedIds = filterData.map((option) => option.value)
      setSpdxLicense(selectedIds)
    } else {
      setSpdxList([
        {
          value: 'CC0-1.0',
          label: 'Creative Commons Zero v1.0 Universal'
        }
      ])
      setSpdxLicense(['CC0-1.0'])
    }
  }, [data])

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
            options={licenses}
            onChange={onLicenseChange}
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
              className='react-select'
            />
          </>
        )}
      </FormControl>
    </VStack>
  )
}

export default LicenseField
