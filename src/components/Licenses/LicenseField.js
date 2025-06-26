import { useLazyQuery } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { useCallback, useContext, useEffect, useState } from 'react'
import { components } from 'react-select'
import { parseLicenseString } from 'utils'
import { infoData } from 'variables/general'

import { Flex, Stack, Text, VStack } from '@chakra-ui/react'
import { Tag, TagLabel } from '@chakra-ui/react'
import { FormControl } from '@chakra-ui/react'

import LynkSelect from 'components/LynkSelect'
import LynkFormLabel from 'components/Misc/LynkLabel'

import { useDebounce } from 'hooks/useDebounce'
import { useGlobalState } from 'hooks/useGlobalState'
import { useRouteFlags } from 'hooks/useRouteFlags'
import { useSelect } from 'hooks/useSelect'

import { LicenseAutoComplete } from 'graphQL/Queries'

const LicenseField = ({
  resolved,
  sbomView,
  license,
  disabled,
  label = 'License'
}) => {
  const { style } = useSelect('field')
  const { isCustomerView } = useRouteFlags()
  const { tabData, setTabData, handleChange } = useContext(TabContext)
  const { details } = tabData
  const { dispatch, sbomState } = useGlobalState()

  const { sbomDispatch } = dispatch

  const [licenseList, setLicenseList] = useState([])
  const [licenseType, setLicenseType] = useState('')

  const [getLicense, { loading }] = useLazyQuery(LicenseAutoComplete, {
    fetchPolicy: 'network-only'
  })

  const [searchText, setSearchText] = useState('')
  const debouncedSearchTerm = useDebounce(searchText, 300)

  const formatLicenseString = (str = '') => {
    const matchingWords = ['or', 'and', 'with']

    return str
      .split(' ')
      .map((word) => {
        if (matchingWords.includes(word)) {
          return word.toUpperCase()
        }
        return word
      })
      .join(' ')
  }

  const onLicenseChange = (selected) => {
    const license = {
      value: selected?.value,
      label: selected?.value,
      type: selected?.type
    }
    if (sbomView) {
      sbomDispatch({
        type: 'SET_LICENSE',
        payload: selected ? [license] : []
      })
    } else {
      handleChange('details', 'licenses', selected ? [license] : [])
    }
    setLicenseType(license?.type || '')
  }

  const handleInputChange = useCallback(
    (value) => {
      if (value !== '') {
        if (sbomView) {
          sbomDispatch({ type: 'SET_LICENSE', payload: [] })
        } else {
          setTabData((prev) => ({
            ...prev,
            details: { ...prev.details, licenses: null }
          }))
        }
        const formattedValue = formatLicenseString(value)
        if (!isCustomerView) {
          getLicense({
            variables: {
              search: formattedValue
            }
          })
            .then((res) => {
              if (res.data?.licenseAutoComplete?.result) {
                const licenses = res.data.licenseAutoComplete.result.map(
                  (license) => ({
                    value: license.value,
                    label: license.label,
                    type: license.type
                  })
                )

                //Remove duplicates values if any. Doing this since filtering over 25 entries is not expensive
                const uniqueLicenses = licenses.filter(
                  (v, i, a) => a.findIndex((t) => t.value === v.value) === i
                )
                setLicenseList(uniqueLicenses)
              } else {
                setLicenseList([])
              }
            })
            .catch((error) => {
              console.warn('Error fetching licenses:', error)
              setLicenseList([])
            })
        }
      } else {
        setLicenseList([])
      }
    },
    [getLicense, isCustomerView, sbomDispatch, sbomView, setTabData]
  )

  useEffect(() => {
    handleInputChange(debouncedSearchTerm)
  }, [debouncedSearchTerm, handleInputChange])

  const onCheck = (title) => {
    const result = infoData.find((item) => item?.title === title)
    return result?.desc
  }

  const colorScheme = {
    'SPDX License Expression': 'cyan',
    'Custom License Expression / Custom License': 'orange',
    'SPDX License ID': 'green',
    'Custom License': 'orange'
  }

  const licenseString = sbomView ? sbomState?.license : details?.licenses

  const normalizedLicenseString =
    licenseString?.length > 0 ? licenseString[0] : null

  useEffect(() => {
    const payload = license ? [{ value: license, label: license }] : []
    if (sbomView) {
      sbomDispatch({
        type: 'SET_LICENSE',
        payload: payload
      })
    } else {
      setTabData((prev) => ({
        ...prev,
        details: {
          ...prev.details,
          licenses: payload
        }
      }))
    }
  }, [license, setTabData, sbomDispatch, sbomView])

  const Option = (props) => {
    return (
      <components.Option {...props}>
        <Stack spacing={0}>
          <Text>{props.data.label}</Text>
          <Tag
            w={'fit-content'}
            variant='subtle'
            colorScheme={colorScheme[props.data.type]}
          >
            <TagLabel fontSize={'12px'}>{props.data.value}</TagLabel>
          </Tag>
        </Stack>
      </components.Option>
    )
  }

  const Menu = (props) => {
    return resolved ? null : (
      <components.Menu {...props}>{props.children}</components.Menu>
    )
  }

  const MenuList = (props) => {
    return resolved ? null : (
      <components.MenuList {...props}>{props.children}</components.MenuList>
    )
  }

  const formattedOptions = licenseList.map((license) => ({
    ...license,
    label:
      license.type === 'Custom License'
        ? parseLicenseString(license?.label)
        : license.label
  }))

  return (
    <>
      <VStack spacing={4} alignItems={'flex-start'}>
        <FormControl isDisabled={isCustomerView}>
          <LynkFormLabel
            label={label}
            htmlFor={licenseType}
            info={!sbomView ? onCheck(`Component License`) : null}
          />
          {/* LICENSE */}
          <LynkSelect
            name='license'
            styles={style}
            className='react-select'
            isClearable={!resolved}
            isSearchable={!resolved}
            isDisabled={isCustomerView || disabled}
            isLoading={loading}
            noOptionsMessage={() =>
              resolved || isCustomerView ? null : `Please search...`
            }
            components={{
              Menu,
              MenuList,
              Option
            }}
            value={normalizedLicenseString}
            options={formattedOptions}
            onChange={onLicenseChange}
            onInputChange={setSearchText}
            placeholder={'Search for a License'}
            filterOption={null}
          />
          {licenseType && (
            <Flex justifyContent='flex-end'>
              <Tag
                my={2}
                size={'sm'}
                variant='subtle'
                width={'fit-content'}
                colorScheme={colorScheme[licenseType]}
              >
                <TagLabel>{licenseType}</TagLabel>
              </Tag>
            </Flex>
          )}
        </FormControl>
      </VStack>
    </>
  )
}

export default LicenseField
