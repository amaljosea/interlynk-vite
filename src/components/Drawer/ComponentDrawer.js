import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { PackageURL } from 'packageurl-js'
import React, { useContext, useEffect, useRef, useState } from 'react'
import Datetime from 'react-datetime'
import 'react-datetime/css/react-datetime.css'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { infoData } from 'variables/general'
import CpeInputs from 'views/Dashboard/Products/components/CpeInputs'
import PurlInputs from 'views/Dashboard/Products/components/PurlInputs'

import { CheckIcon, InfoIcon, WarningTwoIcon } from '@chakra-ui/icons'
import {
  Checkbox,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Select,
  Stack,
  Text,
  Textarea,
  Tooltip,
  chakra,
  useColorMode,
  useDisclosure
} from '@chakra-ui/react'

import CpeField from 'components/CpeField'
import LicenseField from 'components/Licenses/LicenseField'
import LynkModal from 'components/LynkModal'
import CompInfo from 'components/Misc/CompInfo'
import PrimaryWarning from 'components/Modal/PrimaryWarning'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'
import { useProductUrlContext } from 'hooks/useProductUrlContext'

import { CreateCompRelation, CreateComponent } from 'graphQL/Mutation'
import { CpeAutoComplete, GetAllComponents, GetAllSboms } from 'graphQL/Queries'
import { isCustomerView } from 'utils'

import { BiLayer } from 'react-icons/bi'

function ComponentDrawer(props) {
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const activeTab = queryParams.get('tab')
  const { showToast } = useCustomToast()
  const params = useParams()
  const productId = params.productid
  const sbomId = params.sbomid
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')
  const customerView = isCustomerView()

  const { tabData, handleChange, resetData, setTabData } =
    useContext(TabContext)
  const { details, identifiers, relations } = tabData

  const { generateProductVersionDetailPageUrlFromCurrentUrl } =
    useProductUrlContext()

  const link = generateProductVersionDetailPageUrlFromCurrentUrl({
    replaceParams: true,
    paramsObj: {
      tab: activeTab
    }
  })

  const { colorMode } = useColorMode()
  const react_datatime = colorMode === 'light' ? 'light_picker' : 'dark_picker'

  const { isOpen, onClose, data, primaryComp, shortDesc } = props
  const { prodCompState, dispatch } = useGlobalState()
  const { purlString, totalComp } = prodCompState
  const { prodCompDispatch } = dispatch

  const [addRelation] = useMutation(CreateCompRelation)

  const [getCpe] = useLazyQuery(CpeAutoComplete)
  const [createComponent, { loading }] = useMutation(CreateComponent)

  const cpeRef = useRef()

  const [cpeData, setCpeData] = useState([])
  const [allComponents, setAllComponents] = useState([])
  const [showPurl, setShowPurl] = useState(false)
  const [showCpe, setShowCpe] = useState(false)
  const [purlValue, setPurlValue] = useState('')
  const [cpeValue, setCpeValue] = useState('')

  const defaultDate = new Date()
  defaultDate.setDate(defaultDate.getDate() + 90)
  const [isValidDate, setIsValidDate] = useState(true)

  const handleDateChange = (newDate) => {
    const isValidDate = newDate && !isNaN(newDate)
    setTabData((prev) => ({
      ...prev,
      details: { ...prev?.details, endOfSupport: newDate._d }
    }))
    if (newDate) {
      if (isValidDate) {
        setIsValidDate(true)
      } else {
        setIsValidDate(false)
      }
    }
  }

  useQuery(GetAllComponents, {
    fetchPolicy: 'network-only',
    skip: activeTab === 'components' && signedUrlParams === null ? false : true,
    variables: {
      projectId: productId,
      sbomId: sbomId,
      first: totalComp
    },
    onCompleted: (data) => {
      data && setAllComponents(data?.sbom?.components?.nodes)
      setTabData((prev) => ({ ...prev, relations: { relType: '', to: '' } }))
    }
  })

  let SBOMs = []
  const { data: allSboms } = useQuery(GetAllSboms, {
    fetchPolicy: 'network-only',
    skip: signedUrlParams === null ? false : true,
    variables: {
      id: productId
    }
  })

  if (allSboms) {
    const result = allSboms?.project?.sboms?.map((item) => item?.projectVersion)
    SBOMs = result
  }

  const inputStyle = { size: 'md', fontSize: 'sm' }

  const {
    isOpen: isWarningOpen,
    onOpen: onWarningOpen,
    onClose: onWarningClose
  } = useDisclosure()

  const handlePURLInputChange = (e) => {
    const { value } = e.target
    const val = value.replace(/\s/g, '')
    handleChange('identifiers', 'purl', val)
  }

  const purlInputBlur = () => {
    if (identifiers?.purl !== '') {
      try {
        PackageURL.fromString(identifiers?.purl)
        handleChange('identifiers', 'isValidPurl', true)
      } catch (ex) {
        console.error('ex', ex)
        handleChange('identifiers', 'isValidPurl', false)
      }
    }
  }

  const handleCreateCom = () => {
    const license =
      details?.licenses?.length > 0 ? details.licenses[0].value : ''
    createComponent({
      variables: {
        id: data?.id,
        sbomId: sbomId,
        kind: details?.kind,
        name: details?.name,
        group: details?.group,
        scope: details?.scope,
        purl: identifiers?.purl,
        primary: details?.primary,
        version: details?.version,
        internal: details?.internal,
        copyright: details?.copyright,
        description: details?.description,
        licenses: { licensesExp: license },
        supportLevel: details?.supportLevel || 'NONE',
        endOfSupport: details?.endOfSupport || '',
        cpes: identifiers?.cpe !== '' ? [identifiers?.cpe] : undefined
      }
    })
      .then((res) => {
        if (res.data) {
          prodCompDispatch({ type: 'FETCH_DATA_SUCCESS' })
          if (relations?.relType !== '') {
            addRelation({
              variables: {
                from: res.data.componentCreate.component.id,
                to: relations?.to,
                relType: relations?.relType
              }
            })
          }
        }
      })
      .finally(() => {
        showToast({
          description: `Data added successfully`,
          status: 'success'
        })
        resetData()
        onClose()
      })
  }

  const handleCpeChange = (e) => {
    const { value } = e.target
    const val = value.replace(/\s/g, '')
    handleChange('identifiers', 'cpe', value)
    getCpe({
      variables: {
        input: { idType: 'cpe', ecosystem: 'cpe', search: { idUri: val } }
      }
    }).then((res) => {
      if (res?.data) {
        setCpeData(res?.data?.idAutoComplete?.result || [])
      }
    })
  }

  const onModalClose = () => {
    navigate(link)
    onClose()
  }

  const onCheck = (title) => {
    const result = infoData.find((item) => item?.title === title)
    return result?.desc
  }

  const invalidVersion =
    details?.name === primaryComp?.name &&
    details?.version === primaryComp?.version

  const isInvalid =
    details?.kind === '' ||
    details?.name === '' ||
    details?.version === '' ||
    loading

  const handlePurlExpand = () => {
    if (showPurl) setShowPurl(false)
    else {
      setPurlValue(identifiers?.purl || 'pkg:type/name@version')
      setShowPurl(true)
    }
  }

  const handleCpeExpand = () => {
    if (showCpe) setShowCpe(false)
    else {
      setCpeValue(identifiers?.cpe || 'cpe:2.3:*:*:*:*:*:*:*:*:*:*:*')
      setShowCpe(true)
    }
  }
  return (
    <>
      <LynkModal
        isOpen={isOpen}
        onClose={onModalClose}
        onSubmit={
          showPurl
            ? handlePurlExpand
            : showCpe
              ? handleCpeExpand
              : handleCreateCom
        }
        isLoading={loading}
        disabled={showPurl || showCpe ? false : isInvalid}
        hidden={signedUrlParams}
        title={signedUrlParams ? 'Component' : 'Add Component'}
        Icon={BiLayer}
        buttonText={showPurl || showCpe ? 'Back' : 'Save'}
        noFooter={showPurl || showCpe}
      >
        <Stack direction={'column'} spacing={4} pb={4}>
          {/* Name */}
          {signedUrlParams && <CompInfo data={data} />}
          {showPurl ? (
            <PurlInputs
              activeComp={data}
              value={purlValue}
              setValue={setPurlValue}
              onClose={handlePurlExpand}
            />
          ) : showCpe ? (
            <CpeInputs
              value={cpeValue}
              activeComp={data}
              setValue={setCpeValue}
              onClose={handleCpeExpand}
            />
          ) : (
            <>
              <FormControl isReadOnly={customerView}>
                <FormLabel htmlFor='name' fontSize={'sm'}>
                  <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
                    <Text>
                      Name
                      <chakra.span color={'red.500'} ml={1}>
                        *
                      </chakra.span>
                    </Text>
                    <Tooltip label={onCheck(`Component Name`)}>
                      <InfoIcon color={'blue.500'} />
                    </Tooltip>
                  </Flex>
                </FormLabel>
                <Input
                  name='name'
                  sx={inputStyle}
                  value={details?.name}
                  placeholder='Enter name'
                  onChange={(e) =>
                    handleChange('details', 'name', e.target.value)
                  }
                />
              </FormControl>
              {/* Description */}
              <FormControl isReadOnly={customerView}>
                <FormLabel htmlFor='compDescription' fontSize={'sm'}>
                  <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
                    <Text>Description</Text>
                    <Tooltip label={onCheck(`Component Description`)}>
                      <InfoIcon color={'blue.500'} />
                    </Tooltip>
                  </Flex>
                </FormLabel>
                <Textarea
                  sx={inputStyle}
                  name='description'
                  value={details?.description}
                  placeholder='Add description'
                  onChange={(e) =>
                    handleChange('details', 'description', e.target.value)
                  }
                />
              </FormControl>
              {/* Copyright */}
              <FormControl isReadOnly={customerView}>
                <FormLabel htmlFor='copyright' fontSize={'sm'}>
                  <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
                    <Text>Copyright</Text>
                    <Tooltip label={onCheck(`Component Copyright`)}>
                      <InfoIcon color={'blue.500'} />
                    </Tooltip>
                  </Flex>
                </FormLabel>
                <Textarea
                  sx={inputStyle}
                  name='copyright'
                  value={details?.copyright}
                  placeholder='Add copyright'
                  onChange={(e) =>
                    handleChange('details', 'copyright', e.target.value)
                  }
                />
              </FormControl>
              {/* Version */}
              <FormControl isReadOnly={customerView} isInvalid={invalidVersion}>
                <FormLabel htmlFor='version' fontSize={'sm'}>
                  <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
                    <Text>
                      Version{' '}
                      <chakra.span color={'red.500'} ml={1}>
                        *
                      </chakra.span>
                    </Text>
                    <Tooltip label={onCheck(`Component Version`)}>
                      <InfoIcon color={'blue.500'} />
                    </Tooltip>
                  </Flex>
                </FormLabel>
                <Input
                  name='version'
                  sx={inputStyle}
                  value={details?.version}
                  placeholder='Enter version'
                  onChange={(e) =>
                    handleChange('details', 'version', e.target.value)
                  }
                />
                <FormErrorMessage>
                  This version of the product already exists. Continuing will
                  override one of these versions.
                </FormErrorMessage>
              </FormControl>
              {/* GROUP */}
              <FormControl isReadOnly={customerView}>
                <FormLabel htmlFor='groupInfo' fontSize={'sm'}>
                  <Flex flexDirection={'row'} alignItems={'center'} gap={2}>
                    <Text>Group</Text>
                    <Tooltip label={onCheck(`Component Group`)}>
                      <InfoIcon color={'blue.500'} />
                    </Tooltip>
                  </Flex>
                </FormLabel>
                <Input
                  name='group'
                  value={details?.group}
                  sx={inputStyle}
                  placeholder='Add group'
                  onChange={(e) =>
                    handleChange('details', 'group', e.target.value)
                  }
                />
              </FormControl>
              {/* KIND */}
              <FormControl>
                <FormLabel htmlFor='componentType' fontSize={'sm'}>
                  <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
                    <Text>
                      Type{' '}
                      <chakra.span color={'red.500'} ml={1}>
                        *
                      </chakra.span>
                    </Text>
                    <Tooltip label={onCheck(`Component Type`)}>
                      <InfoIcon color={'blue.500'} />
                    </Tooltip>
                  </Flex>
                </FormLabel>
                <Select
                  name='kind'
                  value={details?.kind}
                  sx={inputStyle}
                  isDisabled={customerView}
                  textTransform={'capitalize'}
                  onChange={(e) =>
                    handleChange('details', 'kind', e.target.value)
                  }
                >
                  <option value='' style={{ background: 'lightgray' }}>
                    -- Select --
                  </option>
                  {[
                    'application',
                    'framework',
                    'library',
                    'container',
                    'platform',
                    'operating-system',
                    'device',
                    'device-driver',
                    'firmware',
                    'file',
                    'machine-learning-model',
                    'data'
                  ].map((item, index) => (
                    <option
                      key={index}
                      value={item}
                      style={{ textTransform: 'capitalize' }}
                    >
                      {item}
                    </option>
                  ))}
                </Select>
              </FormControl>
              {/* LICENSES */}
              <LicenseField
                sbomView={false}
                isDisabled={signedUrlParams}
                license={data?.licensesExp}
              />
              <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
                {shortDesc === 'Component Identifier' && purlString === '' && (
                  <WarningTwoIcon w={4} h={4} color='red.500' />
                )}
                <Text fontSize={'sm'} fontWeight={'medium'}>
                  Identifiers
                </Text>
                <Tooltip label={onCheck(`Component Identifiers`)}>
                  <InfoIcon color={'blue.500'} />
                </Tooltip>
              </Flex>
              {/* PURL INPUI */}
              <FormControl
                isReadOnly={customerView}
                isInvalid={identifiers?.purl && !identifiers?.isValidPurl}
              >
                <FormLabel fontSize={12} htmlFor='text'>
                  Package URL
                  <Link
                    color={'blue.500'}
                    mx={2}
                    _hover={{ textDecoration: 'underline' }}
                    fontWeight={'medium'}
                    fontSize={'11px'}
                    onClick={handlePurlExpand}
                    hidden={customerView}
                  >
                    {showPurl ? '(Collapse)' : '(Expand)'}
                  </Link>
                </FormLabel>
                <InputGroup>
                  <Input
                    type='text'
                    size='md'
                    id='purl'
                    name='purl'
                    fontSize={'sm'}
                    placeholder='PURL'
                    value={identifiers?.purl}
                    autoComplete='off'
                    onChange={handlePURLInputChange}
                    onBlur={purlInputBlur}
                  />
                  <InputRightElement align='center' zIndex={-1}>
                    {identifiers?.purl != null && identifiers?.purl !== '' ? (
                      identifiers?.isValidPurl ? (
                        <CheckIcon color='green' />
                      ) : (
                        <WarningTwoIcon color='red' />
                      )
                    ) : null}
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              {/* CPE INPUT */}
              <FormControl>
                <FormLabel fontSize={12} htmlFor='text'>
                  CPE
                  <Link
                    color={'blue.500'}
                    mx={2}
                    _hover={{ textDecoration: 'underline' }}
                    fontWeight={'medium'}
                    fontSize={'11px'}
                    onClick={handleCpeExpand}
                    hidden={customerView}
                  >
                    {showCpe ? '(Collapse)' : '(Expand)'}
                  </Link>
                </FormLabel>
                <CpeField
                  inputRef={cpeRef}
                  cpeList={cpeData}
                  setCpeList={setCpeData}
                  onChange={handleCpeChange}
                />
              </FormControl>

              {/* SCOPE */}
              <FormControl>
                <FormLabel htmlFor='compScope'>
                  <Flex flexDirection={'row'} alignItems={'center'} gap={2}>
                    <Text>Scope</Text>
                    <Tooltip label={onCheck(`Component Scope`)}>
                      <InfoIcon color={'blue.500'} />
                    </Tooltip>
                  </Flex>
                </FormLabel>
                <Select
                  name='scope'
                  value={details?.scope}
                  sx={inputStyle}
                  isDisabled={customerView}
                  onChange={(e) =>
                    handleChange('details', 'scope', e.target.value)
                  }
                >
                  <option value='' style={{ background: 'lightgray' }}>
                    -- Select --
                  </option>
                  <option value='excluded'>Excluded</option>
                  <option value='optional'>Optional</option>
                  <option value='required'>Required</option>
                </Select>
              </FormControl>
              {/* SUPPRT LEVEL */}
              <FormControl hidden={signedUrlParams}>
                <FormLabel htmlFor='compScope'>
                  <Flex flexDirection={'row'} alignItems={'center'} gap={2}>
                    <Text>Support Level</Text>
                    <Tooltip label={onCheck(`Support Level`)}>
                      <InfoIcon color={'blue.500'} />
                    </Tooltip>
                  </Flex>
                </FormLabel>
                <Select
                  sx={inputStyle}
                  name='supportLevel'
                  value={details?.supportLevel}
                  isDisabled={customerView}
                  onChange={(e) =>
                    handleChange('details', 'supportLevel', e.target.value)
                  }
                >
                  <option value='' style={{ background: 'lightgray' }}>
                    -- Select --
                  </option>
                  <option value='UNSPECIFIED'>Unspecified</option>
                  <option value='ACTIVELY_MAINTAINED'>
                    Actively Maintained
                  </option>
                  <option value='NO_LONGER_MAINTAINED'>
                    No Longer Maintained
                  </option>
                  <option value='ABANDONED'>Abandoned</option>
                </Select>
              </FormControl>
              {/* END-OF-SUPPORT DATE */}
              <FormControl
                mb={5}
                isInvalid={!isValidDate}
                hidden={signedUrlParams}
              >
                <FormLabel mb={1} htmlFor='endOfSupport'>
                  <Flex flexDirection={'row'} alignItems={'center'} gap={2}>
                    <Text>End-Of-Support Date</Text>
                    <Tooltip label={onCheck(`End-of-Support Date`)}>
                      <InfoIcon color={'blue.500'} />
                    </Tooltip>
                  </Flex>
                </FormLabel>
                <Datetime
                  timeFormat={false}
                  closeOnSelect={true}
                  value={details?.endOfSupport}
                  className={`${react_datatime} endOfSupport`}
                  onChange={handleDateChange}
                  inputProps={{
                    name: 'endOfSupport',
                    placeholder: 'Add support date',
                    onCopy: (e) => e.preventDefault(),
                    onPaste: (e) => e.preventDefault(),
                    style: {
                      background: 'none',
                      fontSize: '14px'
                    }
                  }}
                />
                {!isValidDate && (
                  <FormErrorMessage>
                    Please enter a valid datetime
                  </FormErrorMessage>
                )}
              </FormControl>
              {/* PRIMARY COMPONENT */}
              <FormControl isReadOnly={customerView}>
                <Flex alignItems={'center'} gap={2}>
                  <Checkbox
                    size='sm'
                    name='primary'
                    colorScheme='blue'
                    onChange={onWarningOpen}
                    isChecked={details?.primary}
                  >
                    Primary component
                  </Checkbox>
                  <Tooltip label={onCheck(`Primary Component`)}>
                    <InfoIcon fontSize={14} color={'blue.500'} />
                  </Tooltip>
                </Flex>
              </FormControl>
              {/* INTERNAL COMPONENT */}
              <FormControl isReadOnly={customerView}>
                <Flex alignItems={'center'} gap={2}>
                  <Checkbox
                    size='sm'
                    name='internal'
                    colorScheme='blue'
                    isChecked={details?.internal}
                    onChange={(e) =>
                      handleChange('details', 'internal', e.target.checked)
                    }
                  >
                    Internal component
                  </Checkbox>
                  <Tooltip label={onCheck(`Internal Component`)}>
                    <InfoIcon fontSize={14} color={'blue.500'} />
                  </Tooltip>
                </Flex>
              </FormControl>
              {/* ADD RELATION */}
              <Text
                fontSize={'sm'}
                fontWeight={'medium'}
                hidden={signedUrlParams}
              >
                Relationships
              </Text>
              <FormControl hidden={signedUrlParams}>
                <FormLabel htmlFor='relation' color='gray.600'>
                  Type
                </FormLabel>
                <Select
                  size='md'
                  id='relation'
                  fontSize={'sm'}
                  value={relations?.relType}
                  onChange={(e) =>
                    handleChange('relations', 'relType', e.target.value)
                  }
                >
                  <option value=''>-- Select --</option>
                  {[{ value: 'depends_on', label: 'Depends On' }].map(
                    (item, idx) => (
                      <option key={idx} value={item.value}>
                        {item.label}
                      </option>
                    )
                  )}
                </Select>
              </FormControl>
              <FormControl hidden={signedUrlParams}>
                <FormLabel htmlFor='component' color='gray.600'>
                  Component
                </FormLabel>
                <Select
                  size='md'
                  id='component'
                  fontSize={'sm'}
                  value={relations?.to}
                  onChange={(e) =>
                    handleChange('relations', 'to', e.target.value)
                  }
                >
                  <option value=''>-- Select --</option>
                  {[...allComponents]
                    .sort((a, b) => a?.name?.localeCompare(b?.name))
                    .map((item, idx) => (
                      <option key={idx} value={item.id}>
                        {item.name}-{item.version}
                      </option>
                    ))}
                </Select>
              </FormControl>
            </>
          )}
        </Stack>
      </LynkModal>

      {/* PRIMARY COMPONENT WARNING */}
      {isWarningOpen && (
        <PrimaryWarning
          isOpen={isWarningOpen}
          onClose={onWarningClose}
          primaryComp={primaryComp}
        />
      )}
    </>
  )
}

export default ComponentDrawer
