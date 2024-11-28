import { useLazyQuery } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { useCallback, useContext, useEffect, useState } from 'react'
import ReactSelect, { components } from 'react-select'
import { getSignedUrlParams, parseLicenseString } from 'utils'
import { infoData } from 'variables/general'

import { InfoIcon } from '@chakra-ui/icons'
import { Flex, Stack, Text, Tooltip, VStack } from '@chakra-ui/react'
import { Tag, TagLabel } from '@chakra-ui/react'
import { FormControl, FormLabel } from '@chakra-ui/react'

import { useDebounce } from 'hooks/useDebounce'
import { useGlobalState } from 'hooks/useGlobalState'
import { useSelect } from 'hooks/useSelect'
import { useThemeColor } from 'hooks/useThemeColors'

import { LicenseAutoComplete } from 'graphQL/Queries'

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
  const { primaryBlueText } = useThemeColor(['primaryBlueText'])

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
    if (sbomView) {
      sbomDispatch({ type: 'SET_LICENSE_FIELD', payload: selected })
    } else {
      handleChange('details', 'licenses', selected ? [selected] : [])
    }
    setLicenseType(selected?.type || '')
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
        }).then((res) => {
          if (res.data) {
            const licenses = res.data.licenseAutoComplete?.result?.map(
              (license) => {
                return {
                  value: license.value,
                  label: license.label,
                  type: license.type
                }
              }
            )

            //Remove duplicates values if any. Doing this since filtering over 25 entries is not expensive
            const uniqueLicenses = licenses?.filter(
              (v, i, a) => a.findIndex((t) => t.value === v.value) === i
            )
            setLicenseList(uniqueLicenses)
          }
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

  return (
    <>
      <VStack spacing={4} alignItems={'flex-start'}>
        <FormControl>
          <FormLabel htmlFor={licenseType}>
            <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
              <Text>License</Text>
              {!sbomView && (
                <Tooltip label={onCheck(`Component License`)}>
                  <InfoIcon color={primaryBlueText} />
                </Tooltip>
              )}
            </Flex>
          </FormLabel>
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
