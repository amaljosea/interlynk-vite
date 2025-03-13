import { useLazyQuery } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { useCallback, useContext, useEffect, useState } from 'react'
import ReactSelect, { components } from 'react-select'
import { getSignedUrlParams, parseLicenseString } from 'utils'
import { infoData } from 'variables/general'

import { Flex, Stack, Text, VStack } from '@chakra-ui/react'
import { Tag, TagLabel } from '@chakra-ui/react'
import { FormControl } from '@chakra-ui/react'

import LynkFormLabel from 'components/Misc/LynkLabel'

import { useDebounce } from 'hooks/useDebounce'
import { useGlobalState } from 'hooks/useGlobalState'
import { useSelect } from 'hooks/useSelect'
import { useThemeColor } from 'hooks/useThemeColors'

import { LicenseAutoComplete } from 'graphQL/Queries'

import { MdClose } from 'react-icons/md'

const LicenseField = ({ resolved, sbomView, license }) => {
  const { style } = useSelect('field')
  const signedUrlParams = getSignedUrlParams()
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
  const { primaryTextColor } = useThemeColor(['primaryTextColor'])

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
      sbomDispatch({ type: 'SET_LICENSE_FIELD', payload: license })
    } else {
      handleChange('details', 'licenses', selected ? [license] : [])
    }
    setLicenseType(license?.type || '')
  }

  const handleInputChange = useCallback(
    (value) => {
      if (value !== '') {
        if (sbomView) {
          sbomDispatch({ type: 'SET_LICENSE_FIELD', payload: null })
        } else {
          setTabData((prev) => ({
            ...prev,
            details: { ...prev.details, licenses: null }
          }))
        }
        const formattedValue = formatLicenseString(value)
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
      } else {
        setLicenseList([])
      }
    },
    [getLicense, sbomDispatch, sbomView, setTabData]
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

  const licenseString = sbomView ? sbomState.licenseString : details?.licenses

  const normalizedLicenseString = sbomView
    ? licenseString
    : licenseString?.[0] || null

  useEffect(() => {
    const payload = license ? [{ value: license, label: license }] : []
    if (sbomView) {
      sbomDispatch({
        type: 'SET_LICENSE_FIELD',
        payload: payload.length ? payload[0] : ''
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

  const ClearIndicator = (props) => {
    return (
      <components.ClearIndicator {...props}>
        <MdClose fontSize={16} color={primaryTextColor} cursor='pointer' />
      </components.ClearIndicator>
    )
  }

  return (
    <>
      <VStack spacing={4} alignItems={'flex-start'}>
        <FormControl isDisabled={signedUrlParams}>
          <LynkFormLabel
            label='License'
            htmlFor={licenseType}
            info={!sbomView ? onCheck(`Component License`) : null}
          />
          {/* LICENSE */}
          <ReactSelect
            name='license'
            styles={style}
            className='react-select'
            isClearable={resolved ? false : true}
            isSearchable={resolved ? false : true}
            isDisabled={signedUrlParams}
            isLoading={loading}
            noOptionsMessage={() =>
              resolved || signedUrlParams ? null : `Please search...`
            }
            components={{
              ClearIndicator,
              DropdownIndicator: () => null,
              IndicatorSeparator: () => null,
              Menu,
              MenuList,
              Option
            }}
            value={
              normalizedLicenseString
                ? {
                    value: normalizedLicenseString.value,
                    label: parseLicenseString(normalizedLicenseString.label)
                  }
                : null
            }
            options={licenseList.map((license) => ({
              ...license,
              label:
                license.type === 'Custom License'
                  ? parseLicenseString(license.label)
                  : license.label
            }))}
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
