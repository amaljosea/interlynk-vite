import { useLazyQuery } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { useCallback, useContext, useEffect, useState } from 'react'
import { components } from 'react-select'
import { infoData } from 'variables/general'

import { InfoIcon } from '@chakra-ui/icons'
import {
  Flex,
  FormControl,
  FormLabel,
  Tag,
  TagLabel,
  Text,
  Tooltip,
  VStack
} from '@chakra-ui/react'

import LynkSelect from 'components/LynkSelect'

import { useDebounce } from 'hooks/useDebounce'
import { useGlobalState } from 'hooks/useGlobalState'

import { LicenseAutoComplete } from 'graphQL/Queries'

const LicenseField = ({ resolved, sbomView, license }) => {
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')
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
    selected = [selected]

    if (sbomView) {
      sbomDispatch({ type: 'SET_LICENSE_FIELD', payload: selected })
    } else {
      handleChange('details', 'licenses', selected)
    }

    setLicenseType(selected[0]?.type)
  }

  const handleInputChange = useCallback(
    (value) => {
      if (value !== '') {
        if (sbomView) {
          sbomDispatch({ type: 'SET_LICENSE_FIELD', payload: [] })
        } else {
          setTabData((prev) => ({
            ...prev,
            details: { ...prev.details, licenses: [] }
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
                  label: license.value,
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

  useEffect(() => {
    if (license) {
      const payload = {
        value: license,
        label: license
      }
      if (sbomView) {
        sbomDispatch({ type: 'SET_LICENSE_FIELD', payload: [payload] })
      } else {
        setTabData((prev) => ({
          ...prev,
          details: { ...prev.details, licenses: [payload] }
        }))
      }
    } else {
      if (sbomView) {
        sbomDispatch({ type: 'SET_LICENSE_FIELD', payload: [] })
      } else {
        setTabData((prev) => ({
          ...prev,
          details: { ...prev.details, licenses: [] }
        }))
      }
    }
  }, [license, sbomDispatch, sbomView, setTabData])

  const Option = (props) => {
    return (
      <components.Option {...props}>
        <Flex justifyContent={'space-between'} alignItems={'center'}>
          <Text>{props.data.label}</Text>
          <Tag
            width={'fit-content'}
            size={'sm'}
            variant='subtle'
            colorScheme={colorScheme[props.data.type]}
          >
            <TagLabel fontSize={'10px'}>{props.data.type}</TagLabel>
          </Tag>
        </Flex>
      </components.Option>
    )
  }

  const Menu = (props) => {
    console.log(props)
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
                  <InfoIcon color={'blue.500'} />
                </Tooltip>
              )}
            </Flex>
          </FormLabel>
          {/* LICENSE */}
          <LynkSelect
            isClearable={resolved ? false : true}
            isSearchable={resolved ? false : true}
            isDisabled={signedUrlParams}
            isLoading={loading}
            noOptionsMessage={() =>
              signedUrlParams ? null : `Please search...`
            }
            components={{
              DropdownIndicator: () => null,
              Menu,
              MenuList,
              Option
            }}
            value={licenseString}
            options={licenseList}
            onChange={onLicenseChange}
            onInputChange={setSearchText}
            placeholder={'Enter License'}
          />
          {licenseType && (
            <Flex justifyContent='flex-end'>
              <Tag
                width={'fit-content'}
                size={'sm'}
                my={2}
                variant='subtle'
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
