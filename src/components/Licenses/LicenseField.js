import { useLazyQuery } from '@apollo/client'
import { useCallback, useEffect, useState } from 'react'
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
  const { prodCompState, dispatch, sbomState } = useGlobalState()

  const { prodCompDispatch, sbomDispatch } = dispatch

  const licenseString = sbomView
    ? sbomState.licenseString
    : prodCompState.licenseString

  const dispatcher = sbomView ? sbomDispatch : prodCompDispatch

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

    dispatcher({ type: 'SET_LICENSE_FIELD', payload: selected })

    setLicenseType(selected[0]?.type)
  }

  const handleInputChange = useCallback(
    (value) => {
      if (value !== '') {
        const formattedValue = formatLicenseString(value)

        dispatcher({ type: 'SET_LICENSE_FIELD', payload: [] }) // clear license field

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
    [dispatcher, getLicense]
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

  useEffect(() => {
    if (license) {
      const payload = {
        value: license,
        label: license
      }
      dispatcher({ type: 'SET_LICENSE_FIELD', payload: [payload] })
    }
    return () => {
      dispatcher({ type: 'SET_LICENSE_FIELD', payload: [] }) // clear license field while unmounting
    }
  }, [dispatcher, license])

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
            isLoading={loading}
            noOptionsMessage={() => `Please search...`}
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
