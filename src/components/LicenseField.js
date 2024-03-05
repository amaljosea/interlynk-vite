import { InfoIcon } from '@chakra-ui/icons'
import {
  Flex,
  FormControl,
  FormLabel,
  Tooltip,
  Icon,
  Text,
  VStack,
  useDisclosure
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import ReactSelect from 'react-select'

import { LicenseAutoComplete } from 'graphQL/Queries'

import { useLazyQuery } from '@apollo/client'
import { useGlobalState } from 'hooks/useGlobalState'
import InfoModal from './InfoModal'

const LicenseField = ({ isValid, setIsValid }) => {
  const { prodCompState, activeSbomTab, dispatch } = useGlobalState()
  const { licenseType, spdxList } = prodCompState
  const { prodCompDispatch } = dispatch

  const [licenseList, setLicenseList] = useState([])
  const [infoHeading, setInfoHeading] = useState('')
  const [infoText, setInfoText] = useState('')
  const [infoUrl, setInfoUrl] = useState('')

  const [getLicense] = useLazyQuery(LicenseAutoComplete, {  fetchPolicy: 'network-only' })

  const { isOpen: isInfoOpen, onOpen: onInfoOpen, onClose: onInfoClose } = useDisclosure()

  const onLicenseChange = (selected) => {
    selected = selected || []
      prodCompDispatch({ type: 'SET_LICENSE_FIELD', payload: selected })
  }

  const handleInputChange = (value) => {
    if (value !== '') {
      getLicense({
        variables: {
          search: value
        }
      }).then((res) => {
        if (res.data) {
          const licenses = res.data.licenseAutoComplete.result.map((value) => ({
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

  const licenseInfo = `Component license refers to the licensing terms and conditions associated with a specific software component listed in the SBOM document.`

  const onCheckLicesne = () => {
    setInfoHeading(`License`)
    setInfoText(licenseInfo)
    setInfoUrl(``)
    onInfoOpen()
  }

  return (
    <>
      <VStack spacing={4} alignItems={'flex-start'}>
      <FormControl>
        <FormLabel htmlFor={licenseType}>
          <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
            <Text>Licenses</Text>
            {activeSbomTab === 4 ? (
              <Tooltip label={licenseInfo}><Icon as={InfoIcon} color={'blue.500'} /></Tooltip>
            ) : (
              <Icon as={InfoIcon} color={'blue.500'} cursor={'pointer'} onClick={onCheckLicesne} />
            )}
          </Flex>
        </FormLabel>
        {/* LICENSE */}
        {licenseType === 'license_exp' && (
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
            placeholder={'Enter License'}
            className='react-select'
          />
        )}
      </FormControl>
      </VStack>

      {/* INFO MODAL */}
      {isInfoOpen && (
        <InfoModal
          isOpen={isInfoOpen}
          onClose={onInfoClose}
          heading={infoHeading}
          body={infoText}
          url={infoUrl}
        />
      )}
    </>
    
  )
}

export default LicenseField
