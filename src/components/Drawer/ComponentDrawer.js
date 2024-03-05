// Chakra imports

import React, { useState, useEffect, useRef } from 'react'
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  Stack,
  FormControl,
  FormLabel,
  Input,
  InputRightElement,
  InputGroup,
  Select,
  Checkbox,
  Text,
  Flex,
  useToast,
  chakra,
  useDisclosure,
  Tooltip,
  Icon,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter
} from '@chakra-ui/react'
import { useLazyQuery, useMutation } from '@apollo/client'
import { CreateComponent, UpdateComponent } from 'graphQL/Mutation'
import { useLocation } from 'react-router-dom'
import { PackageURL } from 'packageurl-js'
import PurlModal from 'views/Dashboard/Products/components/PurlModal'
import CpeModal from 'views/Dashboard/Products/components/CpeModal'
import { InfoIcon, CheckIcon, WarningTwoIcon } from '@chakra-ui/icons'
import { FaExpandAlt } from 'react-icons/fa'
import { CpeAutoComplete } from 'graphQL/Queries'
import LicenseField from 'components/LicenseField'
import { useGlobalState } from 'hooks/useGlobalState'
import { GetAllComponents } from 'graphQL/Queries'
import { CreateCompRelation } from 'graphQL/Mutation'
import CpeField from 'components/CpeField'
import { AllShareComponents } from 'graphQL/Queries'
import InfoModal from 'components/InfoModal'

function ComponentDrawer(props) {
  const location = useLocation()
  const toast = useToast()

  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('id')
  const sbomId = queryParams.get('sbom')
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')
  const customerView = location.pathname.startsWith('/customer')

  const {
    isOpen,
    onClose,
    data,
    primaryComp,
    fetchCompData,
    shortDesc,
    filterRefetch,
    sbomRefetch
  } = props
  const { prodCompState, dispatch } = useGlobalState()
  const { licenseType, purlString, expLicense, totalComp } = prodCompState
  const { prodCompDispatch } = dispatch

  const [getAllComps, { data: allComponents }] = useLazyQuery(
    signedUrlParams ? AllShareComponents : GetAllComponents
  )
  const [addRelation] = useMutation(CreateCompRelation)

  const onFilterRefetch = () => {
    filterRefetch({ projectId: productId, sbomId: sbomId }).then(
      (res) =>
        res.data &&
        prodCompDispatch({
          type: 'ADD_FILTER_HEADS',
          payload: signedUrlParams
            ? res?.data?.shareLynkQuery?.sbom?.filters
            : res?.data?.sbom?.filters
        })
    )
  }

  const [getCpe] = useLazyQuery(CpeAutoComplete)
  const [createComponent] = useMutation(CreateComponent, {
    onCompleted: () => fetchCompData()
  })
  const [updateComponent] = useMutation(UpdateComponent, {
    onCompleted: () => fetchCompData()
  })

  const cpeRef = useRef()

  const [groupInfo, setGroupInfo] = useState('')
  const [compName, setCompName] = useState('')
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

  useEffect(() => {
    if (data) {
      const {
        name,
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
      setCompVersion(version)
      setCpeValue(cpes?.length > 0 ? cpes[0] : '')
      setPurlValue(purl || '')
      setCompKind(kind)
      setCompScope(scope)
      setIsPrimary(primary)
      setIsInternal(internal)
    }
  }, [])

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
  }, [])

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

  const handleCreateCom = async () => {
    await createComponent({
      variables: {
        sbomId: sbomId,
        kind: compKind,
        name: compName,
        version: compVersion,
        group: groupInfo,
        scope: compScope,
        licenses: {
          licensesExp: expLicense || '',
        },
        cpes: cpeValue !== '' ? [cpeValue] : [],
        purl: purlValue,
        primary: isPrimary,
        internal: isInternal
      }
    })
      .then((res) => {
        if (res.data) {
          sbomRefetch({ projectId: productId, sbomId: sbomId })
          prodCompDispatch({ type: 'FETCH_DATA_SUCCESS' })
          onFilterRefetch()
          addRelation({
            variables: {
              from: res.data.componentCreate.component.id,
              to: component,
              relType: relation
            }
          })
          onClose()
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
      })
  }

  const handleUpdateCom = async () => {
    await updateComponent({
      variables: {
        id: data?.id,
        sbomId: sbomId,
        kind: compKind,
        name: compName,
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
        if (isPrimary) {
          sbomRefetch({ projectId: productId, sbomId: sbomId })
          localStorage.setItem(
            'currentSBOM',
            JSON.stringify({
              version: compVersion,
              id: sbomId
            })
          )
        }
        prodCompDispatch({ type: 'FETCH_DATA_SUCCESS' })
        onFilterRefetch()
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
        input: {
          idType: 'cpe',
          ecosystem: 'cpe',
          search: {
            idUri: val
          }
        }
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

  const onCheckVersion = () => {
    setInfoHeading(`Version`)
    setInfoText(
      `A component version refers to the specific version or release of a software component that is included in the SBOM. It indicates the precise iteration of the component being referenced within the software produc`
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

  useEffect(() => {
    getAllComps({
      variables: {
        projectId: signedUrlParams ? undefined : productId,
        field: signedUrlParams ? undefined : 'COMPONENTS_UPDATED_AT',
        direction: signedUrlParams ? undefined : 'DESC',
        sbomId: sbomId,
        first: totalComp
      }
    }).then((res) => {
      if (res.data) {
        setRelation('')
        setComponent('')
      }
    })
  }, [])

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
              {/* Version */}
              <FormControl isReadOnly={signedUrlParams}>
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
                >
                  <option value='' style={{ background: 'lightgray' }}>
                    -- Select --
                  </option>
                  <option value='application'>Application</option>
                  <option value='library'>Library</option>
                  <option value='operating-system'>Operating System</option>
                  <option value='firmware'>Firmware</option>
                  <option value='file'>File</option>
                  <option value='device'>Device</option>
                  <option value='container'>Container</option>
                  <option value='framework'>Framework</option>
                  <option value='source'>Source</option>
                  <option value='archive'>Archive</option>
                  <option value='install'>Install</option>
                  <option value='other'>Other</option>
                  <option value='unspecified'>Unspecified</option>
                </Select>
              </FormControl>
              {/* LICENSES */}
              <LicenseField isValid={isValid} setIsValid={setIsValid} />
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
                      ize='md'
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
              {!data && (
                <>
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
                  {allComponents && (
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
                        {[...allComponents.sbom.components.nodes]
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((item, idx) => (
                            <option key={idx} value={item.id}>
                              {item.name}-{item.version}
                            </option>
                          ))}
                      </Select>
                    </FormControl>
                  )}
                </>
              )}
            </Stack>
          </DrawerBody>
          {!customerView && (
            <DrawerFooter borderTopWidth='1px'>
              <Button mr={3} onClick={onClose}>
                Cancel
              </Button>
              {!data ? (
                <Button
                  colorScheme='blue'
                  onClick={handleCreateCom}
                  isDisabled={
                    compKind === '' ||
                    compName === '' ||
                    compVersion === '' ||
                    !isValid
                  }
                >
                  Save
                </Button>
              ) : (
                <Button
                  colorScheme='blue'
                  onClick={handleUpdateCom}
                  isDisabled={!compKind || !isValid}
                >
                  Update
                </Button>
              )}
            </DrawerFooter>
          )}
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
                <Text as='em'>
                  {primaryComp?.name ? primaryComp?.name : 'None'}
                  {primaryComp?.version ? `- ${primaryComp?.version}` : ''}
                </Text>
                <br />
                <br />
                To:
                <br />
                <Text as='em'>
                  {primaryComp?.name === compName ? 'None' : compName}
                  {primaryComp?.name === compName ? '' : `- ${compVersion}`}
                </Text>
              </Text>
              <br />
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
