import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { PackageURL } from 'packageurl-js'
import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { validateCpe } from 'utils'
import CpeModal from 'views/Dashboard/Products/components/CpeModal'
import PurlModal from 'views/Dashboard/Products/components/PurlModal'

import { CheckIcon, InfoIcon, WarningTwoIcon } from '@chakra-ui/icons'
import {
  Badge,
  Button,
  Checkbox,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  Tag,
  Text,
  Textarea,
  chakra,
  useDisclosure,
  useToast
} from '@chakra-ui/react'

import CpeField from 'components/CpeField'
import InfoModal from 'components/InfoModal'
import LicenseField from 'components/Licenses/LicenseField'

import { useGlobalState } from 'hooks/useGlobalState'

import {
  CreateCompRelation,
  CreateComponent,
  UpdateComponent
} from 'graphQL/Mutation'
import { CpeAutoComplete, GetAllComponents, GetAllSboms } from 'graphQL/Queries'

import { FaExpandAlt } from 'react-icons/fa'

function ComponentDrawer(props) {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const activeTab = queryParams.get('tab')
  const toast = useToast()
  const params = useParams()
  const productId = params.productid
  const sbomId = params.sbomid
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')
  const customerView = location.pathname.startsWith('/customer')

  const { isOpen, onClose, data, primaryComp, shortDesc } = props
  const { prodCompState, dispatch } = useGlobalState()
  const { licenseType, purlString, expLicense, totalComp } = prodCompState
  const { prodCompDispatch } = dispatch

  const [addRelation] = useMutation(CreateCompRelation)

  const [getCpe] = useLazyQuery(CpeAutoComplete)
  const [createComponent] = useMutation(CreateComponent)
  const [updateComponent] = useMutation(UpdateComponent)

  const cpeRef = useRef()

  const [groupInfo, setGroupInfo] = useState('')
  const [compName, setCompName] = useState('')
  const [compDesc, setCompDesc] = useState('')
  const [compVersion, setCompVersion] = useState('')
  const [compKind, setCompKind] = useState('')
  const [compScope, setCompScope] = useState('')
  const [cpeValue, setCpeValue] = useState('')
  const [cpeList, setCpeList] = useState([])
  const [cpeData, setCpeData] = useState([])
  const [selectedCpe, setSelectedCpe] = useState(null)
  const [purlValue, setPurlValue] = useState('')
  const [purlData, setPurlData] = useState(null)
  const [isPURLInputValid, setPURLInputValid] = useState(true)
  const [isPrimary, setIsPrimary] = useState(false)
  const [isInternal, setIsInternal] = useState(false)
  const [relation, setRelation] = useState('')
  const [component, setComponent] = useState('')
  const [isValid, setIsValid] = useState(true)
  const [infoHeading, setInfoHeading] = useState('')
  const [infoText, setInfoText] = useState('')
  const [infoUrl, setInfoUrl] = useState('')
  const [disabled, setDisabled] = useState(false)
  const [allVersions, setAllVersions] = useState([])
  const [allComponents, setAllComponents] = useState([])

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

  useQuery(GetAllSboms, {
    fetchPolicy: 'network-only',
    skip: signedUrlParams === null ? false : true,
    variables: {
      id: productId
    },
    onCompleted: (data) => {
      if (data) {
        const result = data?.project?.sboms?.map((item) => item?.projectVersion)
        setAllVersions(result)
      }
    }
  })

  const isExists = allVersions?.includes(compVersion)

  const disableButtonTemporarily = () => {
    setDisabled(true)
    setTimeout(() => {
      setDisabled(false)
    }, 3000)
  }

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
      } = data
      setGroupInfo(group)
      setCompName(name)
      setCompDesc(description)
      setCompVersion(version)
      if (purl !== '') {
        setPurlValue(purl)
        try {
          PackageURL.fromString(purl)
          setPURLInputValid(true)
        } catch (ex) {
          setPURLInputValid(false)
        }
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
    isOpen: isInfoOpen,
    onOpen: onInfoOpen,
    onClose: onInfoClose
  } = useDisclosure()
  const {
    isOpen: isPurlOpen,
    onOpen: onPurlOpen,
    onClose: onPurlClose
  } = useDisclosure()
  const {
    isOpen: isCpeOpen,
    onOpen: onCpeOpen,
    onClose: onCpeClose
  } = useDisclosure()
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

  const handlePurlModal = () => {
    if (purlValue && purlValue !== '' && isPURLInputValid) {
      const pkg = PackageURL.fromString(purlValue)
      setPurlData(pkg)
      prodCompDispatch({ type: 'SET_PURL_STRING', payload: pkg.toString() })
    } else {
      prodCompDispatch({
        type: 'SET_PURL_STRING',
        payload: 'pkg:type/name@version?key=value'
      })
    }
    onPurlOpen()
  }

  const handleCreateCom = () => {
    disableButtonTemporarily()
    createComponent({
      variables: {
        sbomId: sbomId,
        kind: compKind,
        name: compName,
        description: compDesc,
        version: compVersion,
        group: groupInfo,
        scope: compScope,
        licenses: { licensesExp: expLicense || '' },
        cpes: cpeValue !== '' ? [cpeValue] : [],
        purl: purlValue,
        primary: isPrimary,
        internal: isInternal
      }
    })
      .then((res) => {
        if (res.data) {
          prodCompDispatch({ type: 'FETCH_DATA_SUCCESS' })
          addRelation({
            variables: {
              from: res.data.componentCreate.component.id,
              to: component,
              relType: relation
            }
          })
        }
      })
      .finally(() => {
        toast({
          description: `Data added successfully`,
          status: 'success',
          position: 'top',
          isClosable: true,
          duration: 2000
        })
        onClose()
      })
  }

  const handleUpdateCom = () => {
    disableButtonTemporarily()
    updateComponent({
      variables: {
        id: data?.id,
        sbomId: sbomId,
        kind: compKind,
        name: compName,
        description: compDesc,
        version: compVersion,
        group: groupInfo,
        scope: compScope,
        licenses: {
          licensesExp:
            licenseType === 'license_exp'
              ? expLicense
                ? expLicense
                : ''
              : undefined
        },
        cpes: cpeValue !== '' ? [cpeValue] : [],
        purl: purlValue,
        primary: isPrimary,
        internal: isInternal
      }
    }).then((res) => {
      if (res.data) {
        prodCompDispatch({ type: 'FETCH_DATA_SUCCESS' })
        onClose()
      }
    })
  }

  const handleCreateCpe = (string) => {
    const cpeItem = cpeList?.find((item) => item === string)
    if (cpeItem) {
      toast({
        description: 'CPE already exists',
        status: 'error',
        position: 'top',
        duration: 3000
      })
    } else {
      setCpeList([...cpeList, string])
      setCpeData([])
      setCpeValue('')
      setSelectedCpe(null)
    }
  }

  const handleUpdateCpe = (string, id) => {
    const cpeItem = cpeList?.find((item) => item === string)
    if (cpeItem) {
      toast({
        description: 'CPE already exists',
        status: 'error',
        position: 'top',
        duration: 3000
      })
    } else if (cpeList?.find((item, index) => index === id)) {
      const updatedData = cpeList?.map((item, index) => {
        if (index === id) {
          return string
        }
        return item
      })
      setCpeList(updatedData)
      setCpeValue('')
      setSelectedCpe(null)
    }
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

  const onCheckName = () => {
    setInfoHeading(`Name`)
    setInfoText(
      `The component name within an SBOM serves as a unique identifier for a particular software component, helping to distinguish it from others and providing clarity when referring to or discussing components within the software supply chain.`
    )
    setInfoUrl(``)
    onInfoOpen()
  }

  const onCheckDesc = () => {
    setInfoHeading(`Description`)
    setInfoText(
      `A component description refers to the specific description or release of a software component that is included in the SBOM. It indicates the precise iteration of the component being referenced within the software product.`
    )
    setInfoUrl(``)
    onInfoOpen()
  }

  const onCheckVersion = () => {
    setInfoHeading(`Version`)
    setInfoText(
      `A component version refers to the specific version or release of a software component that is included in the SBOM. It indicates the precise iteration of the component being referenced within the software product.`
    )
    setInfoUrl(``)
    onInfoOpen()
  }

  const onCheckGroup = () => {
    setInfoHeading(`Group`)
    setInfoText(
      `Component group refers to a categorization or grouping of related software components within the SBOM document. Component groups are typically used to organize components based on their function, purpose, or other relevant criteria.`
    )
    setInfoUrl(``)
    onInfoOpen()
  }

  const onCheckIdentifiers = () => {
    setInfoHeading(`Identifiers`)
    setInfoText(
      `Component identifiers refer to unique identifiers assigned to each software component listed in the SBOM document. These identifiers serve to uniquely identify and distinguish one component from another within the software inventory.`
    )
    setInfoUrl(``)
    onInfoOpen()
  }

  const isInvalid =
    compKind === '' ||
    compName === '' ||
    compVersion === '' ||
    !isValid ||
    disabled

  return (
    <>
      <Drawer isOpen={isOpen} placement='right' onClose={onClose} size='md'>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth='1px' color='gray.600'>
            {signedUrlParams
              ? 'Component'
              : data
                ? 'Edit Component'
                : 'Add Component'}
          </DrawerHeader>
          <DrawerBody>
            <Stack direction={'column'} spacing={4}>
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
                    <Icon
                      as={InfoIcon}
                      color={'blue.500'}
                      cursor={'pointer'}
                      onClick={onCheckName}
                    />
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
                    <Icon
                      as={InfoIcon}
                      color={'blue.500'}
                      cursor={'pointer'}
                      onClick={onCheckDesc}
                    />
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
                isInvalid={data?.version !== compVersion && isExists}
              >
                <FormLabel htmlFor='compVersion' fontSize={'sm'}>
                  <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
                    <Text>
                      Version{' '}
                      <chakra.span color={'red.500'} ml={1}>
                        *
                      </chakra.span>
                    </Text>
                    <Icon
                      as={InfoIcon}
                      color={'blue.500'}
                      cursor={'pointer'}
                      onClick={onCheckVersion}
                    />
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
                    <Icon
                      as={InfoIcon}
                      color={'blue.500'}
                      cursor={'pointer'}
                      onClick={onCheckGroup}
                    />
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
              <FormControl isRequired>
                <FormLabel htmlFor='componentType'>Type</FormLabel>
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
              {/* PURL INPUI */}
              <FormControl
                isReadOnly={customerView}
                isInvalid={purlValue !== '' && !isPURLInputValid}
              >
                <FormLabel htmlFor='purl' fontSize={'sm'}>
                  <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
                    {shortDesc === 'Component Identifier' &&
                      purlString === '' && (
                        <WarningTwoIcon w={4} h={4} color='red.500' />
                      )}
                    <Text>Identifiers</Text>
                    <Icon
                      as={InfoIcon}
                      color={'blue.500'}
                      cursor={'pointer'}
                      onClick={onCheckIdentifiers}
                    />
                  </Flex>
                </FormLabel>
                <Stack direction={'row'} spacing={2}>
                  <InputGroup>
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
                    <InputRightElement align='center' zIndex={-1}>
                      {purlValue != null && purlValue !== '' ? (
                        isPURLInputValid ? (
                          <CheckIcon color='green' />
                        ) : (
                          <WarningTwoIcon color='red' />
                        )
                      ) : null}
                    </InputRightElement>
                  </InputGroup>
                  {!signedUrlParams && (
                    <IconButton
                      icon={<FaExpandAlt />}
                      size='md'
                      fontWeight={'normal'}
                      variant='solid'
                      colorScheme='blue'
                      width={'fit-content'}
                      onClick={handlePurlModal}
                    >
                      Details
                    </IconButton>
                  )}
                </Stack>
              </FormControl>
              {/* CPE INPUT */}
              <FormControl>
                <Stack direction={'row'} width={'100%'} spacing={2}>
                  <CpeField
                    inputRef={cpeRef}
                    inputValue={cpeValue}
                    setInputValue={setCpeValue}
                    cpeList={cpeData}
                    setCpeList={setCpeData}
                    onChange={handleCpeChange}
                  />
                  {!signedUrlParams && (
                    <IconButton
                      icon={<FaExpandAlt />}
                      size='md'
                      fontWeight={'normal'}
                      variant='solid'
                      colorScheme='blue'
                      width={'fit-content'}
                      onClick={onCpeOpen}
                    >
                      Details
                    </IconButton>
                  )}
                </Stack>
              </FormControl>
              {/* SCOPE */}
              <FormControl>
                <FormLabel htmlFor='compScope'>Scope</FormLabel>
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
              {/* PRIMARY COMPONENT */}
              <FormControl isReadOnly={signedUrlParams}>
                <Flex alignItems={'center'} gap={2} mt={4}>
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
                </Flex>
              </FormControl>
              {/* INTERNAL COMPONENT */}
              <FormControl isReadOnly={signedUrlParams}>
                <Checkbox
                  size='sm'
                  colorScheme='blue'
                  isChecked={isInternal}
                  onChange={() => setIsInternal(!isInternal)}
                >
                  Internal component
                </Checkbox>
              </FormControl>
              {/* ADD RELATION */}
              {signedUrlParams === null && (
                <Flex
                  display={data ? 'none' : 'flex'}
                  flexDir={'column'}
                  gap={3}
                >
                  <Text>Relationships</Text>
                  <FormControl>
                    <FormLabel htmlFor='relation' color='gray.600'>
                      Type
                    </FormLabel>
                    <Select
                      id='relation'
                      size='sm'
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
                  <FormControl>
                    <FormLabel htmlFor='component' color='gray.600'>
                      Component
                    </FormLabel>
                    <Select
                      id='component'
                      size='sm'
                      value={component}
                      onChange={(e) => setComponent(e.target.value)}
                      mb={10}
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
                </Flex>
              )}
            </Stack>
          </DrawerBody>
          <DrawerFooter borderTopWidth='1px' hidden={signedUrlParams !== null}>
            <Button mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme='blue'
              onClick={data ? handleUpdateCom : handleCreateCom}
              isDisabled={isInvalid}
            >
              {data ? 'Update' : 'Save'}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* PURL EDITOR */}
      {isPurlOpen && (
        <PurlModal
          data={purlData}
          isOpen={isPurlOpen}
          onClose={onPurlClose}
          setPurlValue={setPurlValue}
          setIsValid={setPURLInputValid}
          purlValue={purlValue}
          getCpe={getCpe}
          activeComp={data}
        />
      )}

      {/* CPE EDITOR */}
      {isCpeOpen && (
        <CpeModal
          data={cpeData}
          isOpen={isCpeOpen}
          onClose={onCpeClose}
          cpeValue={cpeValue}
          setCpeValue={setCpeValue}
          onCreateCpe={handleCreateCpe}
          onUpdateCpe={handleUpdateCpe}
          selectedCpe={selectedCpe}
          getCpe={getCpe}
          activeComp={data}
        />
      )}

      {/* DISABLE */}
      {isWarningOpen && (
        <Modal isOpen={isWarningOpen} onClose={onWarningClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Primary Component Change</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>
                You are about to change primary component
                <br />
                <br />
                From:
                <br />
                <Tag py={1} wordBreak={'break-all'}>
                  {primaryComp?.name ? primaryComp?.name : 'None'}
                  {primaryComp?.version ? `- ${primaryComp?.version}` : ''}
                </Tag>
                <br />
                <br />
                To:
                <br />
                <Tag py={1} wordBreak={'break-all'}>
                  {primaryComp?.name === compName ? 'None' : compName}
                  {primaryComp?.name === compName ? '' : `- ${compVersion}`}
                </Tag>
              </Text>
              <br />
              <Tag
                py={1}
                variant='subtle'
                colorScheme='red'
                hidden={!isExists}
                wordBreak={'break-all'}
              >
                This version of the product already exists. Continuing will
                override one of these versions.
              </Tag>
              <Text mt={6}>Are you sure you wish to continue ?</Text>
            </ModalBody>
            <ModalFooter>
              <Button mr={3} onClick={onWarningClose}>
                No
              </Button>
              <Button
                colorScheme={'red'}
                onClick={() => {
                  setIsPrimary(!isPrimary)
                  onWarningClose()
                }}
              >
                Yes
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

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

export default ComponentDrawer
