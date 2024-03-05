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
  Link,
  useDisclosure
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import ReactSelect from 'react-select'
import CreatableSelect from 'react-select/creatable'
import { idAutoComplete } from 'graphQL/Queries'
import { useLazyQuery } from '@apollo/client'
import { MdArrowOutward } from 'react-icons/md'
import { useGlobalState } from 'hooks/useGlobalState'
import InfoModal from './InfoModal'

const LicenseField = ({ isValid, setIsValid }) => {
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')
  const { prodCompState, activeSbomTab, dispatch } = useGlobalState()
  const { licenseType, spdxList, customList, expLicense } = prodCompState
  const { prodCompDispatch } = dispatch

  const [licenseList, setLicenseList] = useState([])
  const [infoHeading, setInfoHeading] = useState('')
  const [infoText, setInfoText] = useState('')
  const [infoUrl, setInfoUrl] = useState('')
  const [getCpe] = useLazyQuery(idAutoComplete)

  const { isOpen: isInfoOpen, onOpen: onInfoOpen, onClose: onInfoClose } = useDisclosure()

  const onLicenseChange = (selected) => {
    if (selected) {
      prodCompDispatch({ type: 'SET_SPDX_LICENSES', payload: selected })
    } else {
      prodCompDispatch({ type: 'SET_SPDX_LICENSES', payload: [] })
    }
  }

  const onCustomChange = (selected) => {
    if (selected) {
      prodCompDispatch({ type: 'SET_CUSTOM_LICENSES', payload: selected })
    } else {
      prodCompDispatch({ type: 'SET_CUSTOM_LICENSES', payload: [] })
    }
  }

  const handleCreate = (inputValue) => {
    console.log('inputValue', inputValue)
    prodCompDispatch({ type: 'CREATE_CUSTOM_LICENSES', payload: inputValue })
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

  const handleExpBlur = () =>
    prodCompDispatch({ type: 'SET_EPX_LICENSE', payload: exp })

  const handleTypeChange = (value) => {
    setIsValid(true)
    prodCompDispatch({ type: 'SET_LICENSE_TYPE', payload: value })
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
        {/* LICENSE TYPE */}
        <RadioGroup
          size='sm'
          value={licenseType}
          onChange={handleTypeChange}
          isDisabled={!isValid}
        >
          <Stack direction='row' my={4} spacing={0} alignItems={'center'}>
            <Radio value='license_spdx' display='none'>
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
            placeholder={'Enter SPDX License ID'}
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
              isReadOnly={signedUrlParams}
              placeholder='Enter a valid SPDX Expression'
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
