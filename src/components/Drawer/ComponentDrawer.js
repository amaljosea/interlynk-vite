// Chakra imports

import React, { useState, useEffect, useContext, useRef } from 'react'
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
  Tag,
  Text,
  Flex,
  TagCloseButton,
  TagLabel,
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
  ModalFooter,
  RadioGroup,
  Radio
} from '@chakra-ui/react'
import { useLazyQuery, useMutation } from '@apollo/client'
import { CreateComponent, UpdateComponent } from 'graphQL/Mutation'
import { useLocation } from 'react-router-dom'
import { PackageURL } from 'packageurl-js'
import PurlModal from 'views/Dashboard/Products/components/PurlModal'
import CpeModal from 'views/Dashboard/Products/components/CpeModal'
import { InfoIcon, CheckIcon, WarningTwoIcon } from '@chakra-ui/icons'
import { FaExpandAlt } from 'react-icons/fa'
import GlobalContext from 'context/GlobalContext'
import { CpeAutoComplete } from 'graphQL/Queries'
import CpeInput from 'components/CpeInput'
import LicenseField from 'components/LicenseField'

function ComponentDrawer(props) {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const toast = useToast()
  const productId = queryParams.get('p')
  const sbomId = queryParams.get('sbom')

  const customerView = location.pathname.startsWith('/customer')

  const {
    id,
    isOpen,
    onClose,
    component,
    version,
    data,
    type,
    cpes,
    purl,
    primary,
    internal,
    primaryComp,
    fetchCompData,
    group,
    shortDesc,
    filterRefetch
  } = props

  const { setCompFilters, licenseType, spdxLicense, setPurlString } =
    useContext(GlobalContext)

  const onFilterRefetch = () => {
    filterRefetch({
      projectId: productId,
      sbomId: sbomId
    }).then((res) => res.data && setCompFilters(res.data.sbom.filters))
  }

  const [getCpe] = useLazyQuery(CpeAutoComplete)

  const [createComponent] = useMutation(CreateComponent, {
    onCompleted: () => fetchCompData()
  })

  const [updateComponent] = useMutation(UpdateComponent, {
    onCompleted: () => fetchCompData()
  })

  const [compId, setCompId] = useState('')
  const [groupInfo, setGroupInfo] = useState('')
  const [compName, setCompName] = useState('')
  const [compVersion, setCompVersion] = useState('')
  const [compType, setCompType] = useState('')

  const [cpeValue, setCpeValue] = useState('')
  const [cpeList, setCpeList] = useState([])
  const [cpeData, setCpeData] = useState([])
  const cpeRef = useRef()

  const [selectedCpe, setSelectedCpe] = useState(null)
  const [purlValue, setPurlValue] = useState('')
  const [purlData, setPurlData] = useState(null)
  const [isPURLInputValid, setPURLInputValid] = useState(true)

  const [isPrimary, setIsPrimary] = useState(primary)
  const [isInternal, setIsInternal] = useState(internal)

  useEffect(() => {
    setCompId(id)
    setGroupInfo(group == null ? '' : group)
    setCompName(component)
    setCompVersion(version)
    setCpeList(cpes)
    setPurlValue(purl)
  }, [component])

  useEffect(() => {
    setCompType(type)
  }, [type])

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
    const inputValue = e.target.value
    setPurlValue(inputValue)
    try {
      PackageURL.fromString(inputValue)
      setPURLInputValid(true)
    } catch (ex) {
      console.error('ex', ex)
      setPURLInputValid(false)
    }
  }

  const handlePurlModal = () => {
    if (purlValue !== '' && isPURLInputValid) {
      const pkg = PackageURL.fromString(purlValue)
      setPurlData(pkg)
      setPurlString(pkg.toString())
    } else {
      setPurlString('pkg:type/namespace/name@version')
    }
    onPurlOpen()
  }

  const handleCreateCom = async () => {
    try {
      await createComponent({
        variables: {
          sbomId: sbomId,
          kind: compType,
          name: compName,
          version: compVersion,
          licenses: licenseType === 'license_spdx' ? spdxLicense : undefined,
          licenseExp: licenseType === 'license_exp' ? expLicense : undefined,
          cpes: cpeList,
          purl: purlValue,
          primary: isPrimary,
          internal: isInternal
        }
      })
        .then((res) => {
          if (res.data) {
            onFilterRefetch()
          }
        })
        .finally(() => {
          onClose()
          toast({
            description: `Data added successfully`,
            status: 'success',
            position: 'top',
            isClosable: true,
            duration: 2000
          })
        })
    } catch (error) {
      console.error('Mutation error:', error)
    }
  }

  const handleUpdateCom = async () => {
    try {
      await updateComponent({
        variables: {
          id: id,
          sbomId: sbomId,
          kind: compType,
          name: compName,
          version: compVersion,
          licenses: licenseType === 'license_spdx' ? spdxLicense : undefined,
          licenseExp: licenseType === 'license_exp' ? expLicense : undefined,
          cpes: cpeList,
          purl: purlValue,
          primary: isPrimary,
          internal: isInternal
        }
      })
        .then((res) => {
          if (res.data) {
            onFilterRefetch()
          }
        })
        .finally(() => onClose())
    } catch (error) {
      console.error('Mutation error:', error)
    }
  }

  const handleSave = () => {
    try {
      handleCreateCom()
    } catch (error) {
      toast({
        description: error.message,
        status: 'error',
        position: 'top',
        duration: 3000
      })
    }
  }

  const handleUpdate = async () => {
    if (purlValue != null && purlValue !== '') {
      try {
        const pkg = PackageURL.fromString(purlValue)
        handleUpdateCom()
      } catch (error) {
        toast({
          description: error.message,
          status: 'error',
          position: 'top',
          duration: 3000
        })
      }
    } else {
      handleUpdateCom()
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      setCpeList([...cpeList, cpeValue])
      setCpeValue('')
    }
  }

  const handleCreateCpe = (string) => {
    const cpeItem = cpeList.find((item) => item === string)
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
    const cpeItem = cpeList.find((item) => item === string)
    if (cpeItem) {
      toast({
        description: 'CPE already exists',
        status: 'error',
        position: 'top',
        duration: 3000
      })
    } else if (cpeList.find((item, index) => index === id)) {
      const updatedData = cpeList.map((item, index) => {
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

  const deleteCpe = (index) => {
    const updatedItems = cpeList.filter((_, i) => i !== index)
    setCpeList(updatedItems)
  }

  const handleCpeChange = (event) => {
    const { value } = event.target
    setCpeValue(value)
    getCpe({
      variables: {
        input: {
          idType: 'cpe',
          ecosystem: 'cpe',
          search: {
            idUri: value
          }
        }
      }
    }).then((res) => {
      if (res.data) {
        setCpeData(res.data.idAutoComplete.result)
      }
    })
  }

  const [expLicense, setExpLicense] = useState([])

  return (
    <>
      <Drawer isOpen={isOpen} placement='right' onClose={onClose} size='md'>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth='1px' color='gray.600'>
            {component ? 'Edit' : 'Create'} Component
          </DrawerHeader>
          <DrawerBody>
            <Stack direction={'column'} spacing={4}>
              {/* Name */}
              <FormControl>
                <FormLabel htmlFor='compName' fontSize={'sm'}>
                  <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
                    <Text>
                      Name
                      <chakra.span color={'red.500'} ml={1}>
                        *
                      </chakra.span>
                    </Text>
                    <Tooltip label='Component Name'>
                      <Icon as={InfoIcon} color={'blue.500'} />
                    </Tooltip>
                  </Flex>
                </FormLabel>
                <Input
                  size='md'
                  fontSize={'sm'}
                  placeholder='Enter name'
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  isDisabled={component}
                  isInvalid={component}
                  errorBorderColor='blue.600'
                />
              </FormControl>
              {/* Version */}
              <FormControl>
                <FormLabel htmlFor='compVersion' fontSize={'sm'}>
                  <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
                    <Text>
                      Version{' '}
                      <chakra.span color={'red.500'} ml={1}>
                        *
                      </chakra.span>
                    </Text>
                    <Tooltip label='Component Version'>
                      <Icon as={InfoIcon} color={'blue.500'} />
                    </Tooltip>
                  </Flex>
                </FormLabel>
                <Input
                  size='md'
                  fontSize={'sm'}
                  placeholder='Enter version'
                  value={compVersion}
                  onChange={(e) => setCompVersion(e.target.value)}
                  isDisabled={component}
                  isInvalid={component}
                  errorBorderColor='blue.600'
                />
              </FormControl>
              {/* Group */}
              <FormControl>
                <FormLabel htmlFor='groupInfo' fontSize={'sm'}>
                  Group
                </FormLabel>
                <Input
                  size='md'
                  fontSize={'sm'}
                  placeholder='Add group'
                  value={groupInfo}
                  onChange={(e) => setGroupInfo(e.target.value)}
                  isDisabled
                  isInvalid
                  errorBorderColor='gray.300'
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
                  value={compType}
                  onChange={(e) => setCompType(e.target.value)}
                >
                  <option value=''>-- Select --</option>
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
              <LicenseField
                exp={data?.licenseExp}
                expLicense={expLicense}
                setExpLicense={setExpLicense}
              />

              {/* PURL INPUI */}
              <FormControl isReadOnly={customerView}>
                <FormLabel htmlFor='purl' fontSize={'sm'}>
                  <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
                    {shortDesc === 'Component Identifier' &&
                      purlValue === '' && (
                        <WarningTwoIcon w={4} h={4} color='red.500' />
                      )}
                    <Text>Identifiers</Text>
                    <Tooltip label='Component identifiers such as package URL (PURL) or Common Platform Enumeration (CPE) are used for consistent naming of the component. Both CycloneDX and SPDX supports identifying component names with CPE and PURL'>
                      <Icon as={InfoIcon} color={'blue.500'} />
                    </Tooltip>
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
                </Stack>
              </FormControl>

              {/* CPE INPUT */}
              <FormControl>
                <Stack direction={'row'} width={'100%'} spacing={2}>
                  <CpeInput
                    name='cpe'
                    inputValue={cpeValue}
                    setInputValue={setCpeValue}
                    cpeList={cpeData}
                    setCpeList={setCpeData}
                    onChange={handleCpeChange}
                    inputRef={cpeRef}
                    validation={true}
                  />
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
                </Stack>
                {/* CPE LIST  */}
                <Flex
                  flexDirection={'row'}
                  flexWrap={'wrap'}
                  spacing={2}
                  gap={2}
                  my={2}
                >
                  {cpeList.map((item, index) => (
                    <Tag key={index} variant='solid' colorScheme={'blue'}>
                      <TagLabel
                        cursor={'pointer'}
                        onClick={() => {
                          setSelectedCpe({ id: index, name: item })
                        }}
                      >
                        {item}
                      </TagLabel>
                      <TagCloseButton onClick={() => deleteCpe(index)} />
                    </Tag>
                  ))}
                </Flex>
              </FormControl>

              {/* PRIMARY COMPONENT */}
              <FormControl isReadOnly={customerView}>
                <Flex alignItems={'center'} gap={2}>
                  {shortDesc === 'Primary Component' && !isPrimary && (
                    <WarningTwoIcon w={4} h={4} color='red.500' />
                  )}
                  <Checkbox
                    size='md'
                    colorScheme='blue'
                    isChecked={isPrimary}
                    onChange={onWarningOpen}
                    disabled={isInternal}
                  >
                    Primary component
                  </Checkbox>
                </Flex>
              </FormControl>

              {/* INTERNAL COMPONENT */}
              <FormControl isReadOnly={customerView}>
                <Checkbox
                  size='md'
                  colorScheme='blue'
                  isChecked={isInternal}
                  onChange={() => setIsInternal(!isInternal)}
                  disabled={isPrimary}
                >
                  Internal component
                </Checkbox>
              </FormControl>
            </Stack>
          </DrawerBody>
          {!customerView && (
            <DrawerFooter borderTopWidth='1px'>
              <Button mr={3} onClick={onClose}>
                Cancel
              </Button>
              {id === undefined ? (
                <Button
                  colorScheme='blue'
                  onClick={handleSave}
                  isDisabled={
                    compType === '' || compName === '' || compVersion === ''
                  }
                >
                  Save
                </Button>
              ) : (
                <Button
                  colorScheme='blue'
                  onClick={handleUpdate}
                  isDisabled={!compType}
                >
                  Update
                </Button>
              )}
            </DrawerFooter>
          )}
        </DrawerContent>
      </Drawer>

      {isPurlOpen && (
        <PurlModal
          component={component}
          version={version}
          group={group}
          purl={purl}
          data={purlData}
          isOpen={isPurlOpen}
          onClose={onPurlClose}
          setPurlValue={setPurlValue}
          purlValue={purlValue}
          getCpe={getCpe}
        />
      )}

      {isCpeOpen && (
        <CpeModal
          data={cpeData}
          isOpen={isCpeOpen}
          onClose={onCpeClose}
          cpeValue={cpeValue}
          onCreateCpe={handleCreateCpe}
          onUpdateCpe={handleUpdateCpe}
          selectedCpe={selectedCpe}
          getCpe={getCpe}
        />
      )}

      {/* disable */}
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
                  {primaryComp?.name}-{primaryComp?.version}
                </Text>
                <br />
                <br />
                To:
                <br />
                <Text as='em'>
                  {compName}-{compVersion}
                </Text>
              </Text>
              <br />
              <Text mt={10}>Are you sure you wish to continue ?</Text>
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
    </>
  )
}

export default ComponentDrawer
