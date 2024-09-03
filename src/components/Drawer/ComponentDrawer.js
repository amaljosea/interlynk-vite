import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { PackageURL } from 'packageurl-js'
import React, { useEffect, useRef, useState } from 'react'
import Datetime from 'react-datetime'
import 'react-datetime/css/react-datetime.css'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { validateCpe } from 'utils'
import { infoData } from 'variables/general'

import { InfoIcon, WarningTwoIcon } from '@chakra-ui/icons'
import {
  Button,
  Checkbox,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
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
import PrimaryWarning from 'components/Modal/PrimaryWarning'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'
import { useProductUrlContext } from 'hooks/useProductUrlContext'

import { CreateCompRelation, CreateComponent } from 'graphQL/Mutation'
import { CpeAutoComplete, GetAllComponents, GetAllSboms } from 'graphQL/Queries'

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
  const customerView = location.pathname.startsWith('/customer')

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

  const handleDateChange = (newDate) => {
    console.log('newDate', newDate)
    const isValidDate = newDate && !isNaN(newDate)
    setSelectedDate(newDate._d)
    if (isValidDate) {
      setIsValidDate(true)
    } else {
      setIsValidDate(false)
    }
  }

  const { isOpen, onClose, data, primaryComp, shortDesc } = props
  const { prodCompState, dispatch } = useGlobalState()
  const { purlString, expLicense, totalComp } = prodCompState
  const { prodCompDispatch } = dispatch

  const [addRelation] = useMutation(CreateCompRelation)

  const [getCpe] = useLazyQuery(CpeAutoComplete)
  const [createComponent, { loading }] = useMutation(CreateComponent)

  const cpeRef = useRef()

  const [groupInfo, setGroupInfo] = useState('')
  const [compName, setCompName] = useState('')
  const [compDesc, setCompDesc] = useState('')
  const [compVersion, setCompVersion] = useState('')
  const [compKind, setCompKind] = useState('')
  const [compScope, setCompScope] = useState('')
  const [cpeValue, setCpeValue] = useState('')
  const [cpeData, setCpeData] = useState([])
  const [purlValue, setPurlValue] = useState('')
  const [isPURLInputValid, setPURLInputValid] = useState(true)
  const [isPrimary, setIsPrimary] = useState(false)
  const [isInternal, setIsInternal] = useState(false)
  const [relation, setRelation] = useState('')
  const [component, setComponent] = useState('')
  const [isValid] = useState(true)
  const [compSupport, setCompSupport] = useState('')
  const [allComponents, setAllComponents] = useState([])

  const defaultDate = new Date()
  defaultDate.setDate(defaultDate.getDate() + 90)
  const [selectedDate, setSelectedDate] = useState('')
  const [isValidDate, setIsValidDate] = useState(true)

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
      setRelation('')
      setComponent('')
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

  const invalidVersion = compVersion !== '' && SBOMs?.includes(compVersion)

  useEffect(() => {
    if (data) {
      const {
        name,
        description,
        version,
        kind,
        cpes,
        purl,
        primary,
        internal,
        group,
        scope
      } = data || ''
      setGroupInfo(group)
      setCompName(name)
      setCompDesc(description)
      setCompVersion(version)
      console.log('purl', purl)
      if (purl !== null) {
        setPurlValue(purl)
        try {
          PackageURL.fromString(purl)
          setPURLInputValid(true)
        } catch (ex) {
          setPURLInputValid(false)
        }
      } else {
        setPurlValue('')
        setPURLInputValid(true)
      }
      if (cpes?.length > 0) {
        setCpeValue(cpes[0])
        const matches = validateCpe(cpes[0])
        if (matches && cpes[0] !== '') {
          prodCompDispatch({ type: 'SET_CPE_VALIDATION', payload: true })
        } else {
          prodCompDispatch({ type: 'SET_CPE_VALIDATION', payload: false })
        }
      }
      setCompKind(kind)
      setCompScope(scope)
      setIsPrimary(primary)
      setIsInternal(internal)
    }
  }, [data, prodCompDispatch])

  // Health Check
  useEffect(() => {
    if (shortDesc === 'Component Name') {
      setCompVersion('2.0.35')
      setCompName('')
    }
    if (
      shortDesc === 'Component Version' ||
      shortDesc === 'Primary Component Version'
    ) {
      setCompName('dropwizard-core')
      setCompVersion('')
    }
  }, [shortDesc])

  const {
    isOpen: isWarningOpen,
    onOpen: onWarningOpen,
    onClose: onWarningClose
  } = useDisclosure()

  const handlePURLInputChange = (e) => {
    const { value } = e.target
    const val = value.replace(/\s/g, '')
    setPurlValue(val)
  }

  const purlInputBlur = () => {
    if (purlValue !== '') {
      try {
        PackageURL.fromString(purlValue)
        setPURLInputValid(true)
      } catch (ex) {
        console.error('ex', ex)
        setPURLInputValid(false)
      }
    }
  }

  const handleCreateCom = () => {
    createComponent({
      variables: {
        sbomId: sbomId,
        kind: compKind,
        name: compName,
        purl: purlValue,
        scope: compScope,
        group: groupInfo,
        primary: isPrimary,
        internal: isInternal,
        version: compVersion,
        description: compDesc,
        supportLevel: compSupport,
        endOfSupport: selectedDate,
        cpes: cpeValue !== '' ? [cpeValue] : [],
        licenses: { licensesExp: expLicense || '' }
      }
    })
      .then((res) => {
        if (res.data) {
          prodCompDispatch({ type: 'FETCH_DATA_SUCCESS' })
          if (relation !== '') {
            addRelation({
              variables: {
                from: res.data.componentCreate.component.id,
                to: component,
                relType: relation
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
        onClose()
      })
  }

  const handleCpeChange = (e) => {
    const { value } = e.target
    const val = value.replace(/\s/g, '')
    setCpeValue(val)
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

  const onDrawerClose = () => {
    navigate(link)
    onClose()
  }

  const onCheck = (title) => {
    const result = infoData.find((item) => item?.title === title)
    return result?.desc
  }

  const isInvalid =
    compKind === '' || compName === '' || compVersion === '' || !isValid

  return (
    <>
      <Drawer
        size='md'
        isOpen={isOpen}
        placement='right'
        onClose={onDrawerClose}
        closeOnOverlayClick={false}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton mt={2} />
          <DrawerHeader borderBottomWidth='1px'>
            {signedUrlParams
              ? 'Component'
              : data
                ? 'Edit Component'
                : 'Add Component'}
          </DrawerHeader>
          <DrawerBody overflowX={'hidden'}>
            <Stack direction={'column'} spacing={4} pt={2} pb={4}>
              {/* Name */}
              <FormControl isReadOnly={signedUrlParams}>
                <FormLabel htmlFor='compName' fontSize={'sm'}>
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
                  size='md'
                  fontSize={'sm'}
                  placeholder='Enter name'
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                />
              </FormControl>
              {/* Description */}
              <FormControl isReadOnly={signedUrlParams}>
                <FormLabel htmlFor='compDescription' fontSize={'sm'}>
                  <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
                    <Text>Description</Text>
                    <Tooltip label={onCheck(`Component Description`)}>
                      <InfoIcon color={'blue.500'} />
                    </Tooltip>
                  </Flex>
                </FormLabel>
                <Textarea
                  size='md'
                  fontSize={'sm'}
                  placeholder='Add description'
                  value={compDesc}
                  onChange={(e) => setCompDesc(e.target.value)}
                />
              </FormControl>
              {/* Version */}
              <FormControl
                isReadOnly={signedUrlParams}
                isInvalid={invalidVersion}
              >
                <FormLabel htmlFor='compVersion' fontSize={'sm'}>
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
                  size='md'
                  fontSize={'sm'}
                  placeholder='Enter version'
                  value={compVersion}
                  onChange={(e) => setCompVersion(e.target.value)}
                />
                <FormErrorMessage>
                  This version of the product already exists. Continuing will
                  override one of these versions.
                </FormErrorMessage>
              </FormControl>
              {/* GROUP */}
              <FormControl isReadOnly={signedUrlParams}>
                <FormLabel htmlFor='groupInfo' fontSize={'sm'}>
                  <Flex flexDirection={'row'} alignItems={'center'} gap={2}>
                    <Text>Group</Text>
                    <Tooltip label={onCheck(`Component Group`)}>
                      <InfoIcon color={'blue.500'} />
                    </Tooltip>
                  </Flex>
                </FormLabel>
                <Input
                  size='md'
                  fontSize={'sm'}
                  placeholder='Add group'
                  value={groupInfo}
                  onChange={(e) => setGroupInfo(e.target.value)}
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
                  id='componentType'
                  name='componentType'
                  size='md'
                  fontSize={'sm'}
                  value={compKind}
                  isDisabled={signedUrlParams}
                  onChange={(e) => setCompKind(e.target.value)}
                  textTransform={'capitalize'}
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
                isInvalid={purlValue !== '' && !isPURLInputValid}
              >
                <Input
                  type='text'
                  size='md'
                  id='purl'
                  name='purl'
                  fontSize={'sm'}
                  placeholder='PURL'
                  value={purlValue}
                  autoComplete='off'
                  onChange={handlePURLInputChange}
                  onBlur={purlInputBlur}
                />
              </FormControl>
              {/* CPE INPUT */}
              <FormControl>
                <CpeField
                  inputRef={cpeRef}
                  inputValue={cpeValue}
                  setInputValue={setCpeValue}
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
                  id='compScope'
                  name='compScope'
                  size='md'
                  fontSize={'sm'}
                  value={compScope}
                  isDisabled={signedUrlParams}
                  onChange={(e) => setCompScope(e.target.value)}
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
              <FormControl>
                <FormLabel htmlFor='compScope'>
                  <Flex flexDirection={'row'} alignItems={'center'} gap={2}>
                    <Text>Support Level</Text>
                    <Tooltip label={onCheck(`Component Support`)}>
                      <InfoIcon color={'blue.500'} />
                    </Tooltip>
                  </Flex>
                </FormLabel>
                <Select
                  id='compSupport'
                  name='compSupport'
                  size='md'
                  fontSize={'sm'}
                  value={compSupport}
                  isDisabled={customerView}
                  onChange={(e) => {
                    setCompSupport(e.target.value)
                    setSelectedDate(defaultDate)
                  }}
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
              <FormControl mb={5} isInvalid={!isValidDate}>
                <FormLabel mb={1} htmlFor='endOfSupport'>
                  <Flex flexDirection={'row'} alignItems={'center'} gap={2}>
                    <Text>End-Of-Support Date</Text>
                    <Tooltip label={onCheck(`Component Support Date`)}>
                      <InfoIcon color={'blue.500'} />
                    </Tooltip>
                  </Flex>
                </FormLabel>
                <Datetime
                  value={selectedDate}
                  closeOnSelect={true}
                  className={`${react_datatime} endOfSupport`}
                  onChange={handleDateChange}
                  inputProps={{
                    disabled: compSupport === '',
                    onCopy: (e) => e.preventDefault(),
                    onPaste: (e) => e.preventDefault(),
                    style: {
                      background: 'none'
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
              <FormControl isReadOnly={signedUrlParams}>
                <Flex alignItems={'center'} gap={2}>
                  {shortDesc === 'Primary Component' && !isPrimary && (
                    <WarningTwoIcon w={4} h={4} color='red.500' />
                  )}
                  <Checkbox
                    size='sm'
                    colorScheme='blue'
                    isChecked={isPrimary}
                    onChange={onWarningOpen}
                  >
                    Primary component
                  </Checkbox>
                  <Tooltip label={onCheck(`Primary Component`)}>
                    <InfoIcon fontSize={14} color={'blue.500'} />
                  </Tooltip>
                </Flex>
              </FormControl>
              {/* INTERNAL COMPONENT */}
              <FormControl isReadOnly={signedUrlParams}>
                <Flex alignItems={'center'} gap={2}>
                  <Checkbox
                    size='sm'
                    colorScheme='blue'
                    isChecked={isInternal}
                    onChange={() => setIsInternal(!isInternal)}
                  >
                    Internal component
                  </Checkbox>
                  <Tooltip label={onCheck(`Internal Component`)}>
                    <InfoIcon fontSize={14} color={'blue.500'} />
                  </Tooltip>
                </Flex>
              </FormControl>
              {/* ADD RELATION */}
              <Text fontSize={'sm'} fontWeight={'medium'}>
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
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
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
                  value={component}
                  onChange={(e) => setComponent(e.target.value)}
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
              <Button
                colorScheme='blue'
                variant={'outline'}
                isLoading={loading}
                width={'fit-content'}
                isDisabled={isInvalid}
                onClick={handleCreateCom}
              >
                Save
              </Button>
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* PRIMARY COMPONENT WARNING */}
      {isWarningOpen && (
        <PrimaryWarning
          name={compName}
          version={compVersion}
          isOpen={isWarningOpen}
          setData={setIsPrimary}
          onClose={onWarningClose}
          primaryComp={primaryComp}
        />
      )}
    </>
  )
}

export default ComponentDrawer
