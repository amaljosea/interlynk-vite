// Chakra imports

import React, { useState, useEffect } from 'react'
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
  Table,
  Tag,
  Thead,
  Th,
  Tr,
  Tbody,
  Td,
  Text,
  Flex,
  Box,
  TagCloseButton,
  TagLabel,
  Code,
  useToast,
  Textarea,
  useDisclosure,
  Tooltip,
  Icon,
  IconButton
} from '@chakra-ui/react'
import { useMutation } from '@apollo/client'
import { CreateComponent } from 'graphQL/Mutation'
import { UpdateComponent } from 'graphQL/Mutation'
import { useLocation } from 'react-router-dom'
import { licenseOptions } from 'variables/licenses'
import MultiSelect from 'react-select'
import { timeSince } from 'utils'

import { PackageURL } from 'packageurl-js'
import PurlModal from 'views/Dashboard/Products/components/PurlModal'
import CpeModal from 'views/Dashboard/Products/components/CpeModal'
import { QuestionIcon, CheckIcon, WarningTwoIcon } from '@chakra-ui/icons'
import { FaExpandAlt } from 'react-icons/fa'

// const regexPattern = /^cpe:2\.3:[aho]:[^:]+:[^:]+:[^:]+:[^:]+:[^:]+:[^:]+:[^:]+:[^:]+:[^:]+:[^:]+$/
const regexPattern =
  /cpe:2\.3:[aho\*\-](:(((\?*|\*?)([a-zA-Z0-9\-\._]|(\\[\\\*\?!"#$$%&'\(\)\+,\/:;<=>@\[\]\^`\{\|}~]))+(\?*|\*?))|[\*\-])){5}(:(([a-zA-Z]{2,3}(-([a-zA-Z]{2}|[0-9]{3}))?)|[\*\-]))(:(((\?*|\*?)([a-zA-Z0-9\-\._]|(\\[\\\*\?!"#$$%&'\(\)\+,\/:;<=>@\[\]\^`\{\|}~]))+(\?*|\*?))|[\*\-])){4}/

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
    btnRef,
    component,
    version,
    license,
    type,
    cpes,
    purl,
    primary,
    internal,
    suppliers,
    refetch,
    group,
    shortDesc
  } = props

  const [createComponent] = useMutation(CreateComponent)
  const [updateComponent] = useMutation(UpdateComponent)

  const [compId, setCompId] = useState('')
  const [groupInfo, setGroupInfo] = useState('')
  const [compName, setCompName] = useState('')
  const [compVersion, setCompVersion] = useState('')
  const [compType, setCompType] = useState('')
  const [licenseName, setLicenseName] = useState('')

  const [cpeList, setCpeList] = useState([])
  const [cpeValue, setCpeValue] = useState('')
  const [cpeData, setCpeData] = useState(null)
  const [isCPEInputValid, setCPEInputValid] = useState(true)

  const [selectedCpe, setSelectedCpe] = useState(null)
  const [purlValue, setPurlValue] = useState('')
  const [purlData, setPurlData] = useState(null)
  const [isPURLInputValid, setPURLInputValid] = useState(true)

  const [isIncomplete, setIsIncomplete] = useState(false)
  const [isPrimary, setIsPrimary] = useState(primary)
  const [isInternal, setIsInternal] = useState(internal)

  const [licenseList, setLicenseList] = useState([])
  const [selectedLicenses, setSelectedLicenses] = useState([])

  const licenses = licenseOptions.map((option) => ({
    value: option.licenseId,
    label: option.name
  }))

  useEffect(() => {
    setCompId(id)
    setGroupInfo(group == null ? '' : group)
    setCompName(component)
    setCompVersion(version)
    setCpeList(cpes)
    setPurlValue(purl)

    try {
      PackageURL.fromString(purlValue)
      setPURLInputValid(true)
    } catch (ex) {
      if (purlValue != '' && purlValue != null) {
        setPURLInputValid(false)
      }
    }
  }, [component])

  useEffect(() => {
    if (license.length > 0) {
      // console.log(`license`, license)
      const commonValues = licenseOptions.filter((item1) =>
        license.includes(item1.licenseId)
      )
      const data = commonValues.map((item) => {
        return {
          value: item.licenseId,
          label: item.name
        }
      })
      setLicenseList(data)
      const selectedIds = data.map((option) => option.value) // Extracting IDs
      setSelectedLicenses(selectedIds)
    }
  }, [license])

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

  const handlePURLInputChange = (e) => {
    const inputValue = e.target.value
    setPurlValue(inputValue)
    if (inputValue == null || inputValue === '') {
      return
    }
    console.log('invoking handle change ' + inputValue)
    try {
      PackageURL.fromString(inputValue)
      setPURLInputValid(true)
    } catch (ex) {
      console.error('ex', ex)
      setPURLInputValid(false)
    }
  }

  const handlePurlModal = () => {
    try {
      console.log(purlValue)
      const pkg = PackageURL.fromString(purlValue)
      console.info('pkg', pkg)
      setPurlData(pkg)
      onPurlOpen()
    } catch (ex) {
      console.error('ex', ex)
      if (purlValue != null && purlValue !== '') {
        toast({
          description: 'PURL is invalid. Resetting to defaults',
          status: 'error',
          duration: 3000,
          position: 'top'
        })
      }
      const pkg = PackageURL.fromString('pkg:generic/unknown@1.0')
      setPurlValue('pkg:generic/unknown@1.0')
      setPURLInputValid(true)
      setPurlData(pkg)
      onPurlOpen()
    }
  }

  const handleCPEInputChange = (e) => {
    const inputValue = e.target.value
    setCpeValue(inputValue)
    const matches = inputValue.match(regexPattern)
    if (matches) {
      const [input] = matches
      const components = input.split(':')
      setCpeData({
        vendor: components[3],
        product: components[4],
        version: components[5],
        targetHardware: '*'
      })
      setCPEInputValid(true)
    } else {
      setCPEInputValid(false)
    }
  }

  const handleCpeModal = () => {
    const matches = cpeValue.match(regexPattern)
    console.log('matches :', matches)
    if (cpeValue !== '' && matches) {
      // console.log('matches :', matches)
      const [input] = matches
      const components = input.split(':')
      console.log(`components`, components)
      setCpeData({
        vendor: components[3],
        product: components[4],
        version: components[5],
        targetHardware: '*'
      })
      onCpeOpen()
    } else {
      if (cpeValue != null && cpeValue !== '') {
        toast({
          description: 'CPE value is invalid. Resetting to defaults',
          status: 'error',
          duration: 3000,
          position: 'top'
        })
      }
      setCpeData({
        vendor: 'vendor',
        product: 'product',
        version: '1.0',
        targetHardware: '*'
      })
      setCpeValue('cpe:2.3:a:vendor:product:1.0:*:*:*:*:*:*:*')
      setCPEInputValid(true)
      onCpeOpen()
    }
  }

  const onLicenseChange = (selected) => {
    setLicenseList(selected)
    const selectedIds = selected.map((option) => option.value) // Extracting IDs
    setSelectedLicenses(selectedIds)
  }

  const handleCreateCom = async () => {
    if (compName && compType) {
      try {
        await createComponent({
          variables: {
            sbomId: sbomId,
            kind: compType,
            name: compName,
            version: compVersion,
            licenses: selectedLicenses,
            cpes: cpeList,
            purl: purlValue,
            primary: isPrimary,
            internal: isInternal
          }
        })
          .then((res) => {
            if (res.data) {
              window.location.reload()
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
      } catch (error) {
        console.error('Mutation error:', error)
      }
    } else {
      toast({
        title: `Input fields required`,
        status: 'error',
        position: 'top-right',
        isClosable: true,
        duration: 2000
      })
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
          licenses: selectedLicenses,
          cpes: cpeList,
          purl: purlValue,
          primary: isPrimary,
          internal: isInternal
        }
      })
        .then((res) => {
          if (res.data) {
            window.location.reload()
          }
        })
        .finally(() => {
          toast({
            description: `Data updated successfully`,
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

  const handleSave = async () => {
    if (purlValue != null && purlValue !== '') {
      try {
        const pkg = PackageURL.fromString(purlValue)
        handleCreateCom()
      } catch (error) {
        toast({
          description: error.message,
          status: 'error',
          position: 'top',
          duration: 3000
        })
      }
    } else {
      handleCreateCom()
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

  // console.log('cpeList', cpeList)

  const containesOther =
    licenseList.length > 0 &&
    licenseList.some((item) => item.value === 'Other' && item.label === 'Other')

  return (
    <>
      <Drawer
        isOpen={isOpen}
        placement='right'
        onClose={onClose}
        finalFocusRef={btnRef}
        size='sm'
      >
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
                <FormLabel fontSize={'sm'}>
                  <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
                    {shortDesc === 'Component Name' && compName === '' && (
                      <WarningTwoIcon w={4} h={4} color='red.500' />
                    )}
                    <Text>Name</Text>
                    <Tooltip label='Component Name'>
                      <Icon as={QuestionIcon} color={'blue.500'} />
                    </Tooltip>
                  </Flex>
                </FormLabel>
                <Input
                  size='sm'
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
                <FormLabel fontSize={'sm'}>
                  <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
                    {(shortDesc === 'Primary Component Version' ||
                      shortDesc === 'Component Version') &&
                      compVersion === '' && (
                        <WarningTwoIcon w={4} h={4} color='red.500' />
                      )}
                    <Text>Version</Text>
                    <Tooltip label='Component Version'>
                      <Icon as={QuestionIcon} color={'blue.500'} />
                    </Tooltip>
                  </Flex>
                </FormLabel>
                <Input
                  size='sm'
                  placeholder='Enter version'
                  value={compVersion}
                  onChange={(e) => setCompVersion(e.target.value)}
                  isDisabled={component}
                  isInvalid={component}
                  errorBorderColor='blue.600'
                />
              </FormControl>
              {/* group */}
              <FormControl>
                <FormLabel fontSize={'sm'}>Group</FormLabel>
                <Input
                  size='sm'
                  placeholder='Add group'
                  value={groupInfo}
                  onChange={(e) => setGroupInfo(e.target.value)}
                  isDisabled
                  isInvalid
                  errorBorderColor='gray.300'
                />
              </FormControl>
              {/* Kind */}
              <FormControl>
                <FormLabel fontSize={'sm'}>
                  <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
                    <Text>Type</Text>
                    <Tooltip label='Component Type'>
                      <Icon as={QuestionIcon} color={'blue.500'} />
                    </Tooltip>
                  </Flex>
                </FormLabel>
                <Select
                  id='type'
                  name='type'
                  size='sm'
                  value={compType}
                  onChange={(e) => setCompType(e.target.value)}
                >
                  <option value=''>-- Select --</option>
                  <option value='application'>Application</option>
                  <option value='library'>Library</option>
                  <option value='operating_system'>Operating system</option>
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
              {/* Licenses */}
              <FormControl>
                <FormLabel fontSize={'sm'}>
                  <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
                    <Text>Licenses</Text>
                    <Tooltip label='List of licenses applicable to the component'>
                      <Icon as={QuestionIcon} color={'blue.500'} />
                    </Tooltip>
                  </Flex>
                </FormLabel>
                <MultiSelect
                  styles={{
                    control: (baseStyles, state) => ({
                      ...baseStyles,
                      borderColor: state.isFocused ? 'inherit' : 'inherit',
                      '&:hover': {
                        borderColor: '#CBD5E0'
                      }
                    })
                  }}
                  isMulti
                  value={licenseList}
                  options={licenses}
                  onChange={onLicenseChange}
                />
              </FormControl>
              {containesOther && (
                <FormControl>
                  <Input
                    size='sm'
                    placeholder='Enter a valid SPDX license'
                    value={licenseName}
                    onChange={(e) => setLicenseName(e.target.value)}
                  />
                </FormControl>
              )}
              {/* Identifiers */}
              <FormControl isReadOnly={customerView}>
                <FormLabel fontSize={'sm'}>
                  <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
                    {shortDesc === 'Component Identifier' &&
                      purlValue === '' && (
                        <WarningTwoIcon w={4} h={4} color='red.500' />
                      )}
                    <Text>Identifiers</Text>
                    <Tooltip label='Component identifiers such as package URL (PURL) or Common Platform Enumeration (CPE) are used for consistent naming of the component. Both CycloneDX and SPDX supports identifying component names with CPE and PURL'>
                      <Icon as={QuestionIcon} color={'blue.500'} />
                    </Tooltip>
                  </Flex>
                </FormLabel>
                <Stack spacing={2}>
                  <Stack direction={'row'} spacing={2}>
                    <InputGroup>
                      <Input
                        type='text'
                        size='sm'
                        placeholder='PURL'
                        value={purlValue}
                        key='purl'
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
                      size='sm'
                      fontWeight={'normal'}
                      variant='solid'
                      colorScheme='blue'
                      width={'fit-content'}
                      onClick={handlePurlModal}
                    >
                      Details
                    </IconButton>
                  </Stack>
                  {/* CPE List */}
                  <Stack direction={'row'} spacing={2}>
                    <InputGroup>
                      <Input
                        type='text'
                        size='sm'
                        placeholder='CPE'
                        value={cpeValue}
                        key='CPE'
                        onChange={handleCPEInputChange}
                      />
                      <InputRightElement align='center' zIndex={-1}>
                        {cpeValue != null && cpeValue !== '' ? (
                          isCPEInputValid ? (
                            <CheckIcon color='green' />
                          ) : (
                            <WarningTwoIcon color='red' />
                          )
                        ) : null}
                      </InputRightElement>
                    </InputGroup>
                    <IconButton
                      icon={<FaExpandAlt />}
                      mt={2}
                      size='sm'
                      fontWeight={'normal'}
                      variant='solid'
                      colorScheme='blue'
                      width={'fit-content'}
                      onClick={handleCpeModal}
                    >
                      Details
                    </IconButton>
                  </Stack>
                  <Flex
                    flexDirection={'row'}
                    flexWrap={'wrap'}
                    spacing={2}
                    gap={2}
                    my={1}
                  >
                    {cpeList.map((item, index) => (
                      <Tag
                        size='sm'
                        key={index}
                        borderRadius='full'
                        variant='solid'
                        colorScheme={'blue'}
                      >
                        <TagLabel
                          cursor={'pointer'}
                          onClick={() => {
                            setCpeValue(item)
                            setSelectedCpe({ id: index, name: item })
                          }}
                        >
                          {item}
                        </TagLabel>
                        <TagCloseButton onClick={() => deleteCpe(index)} />
                      </Tag>
                    ))}
                  </Flex>
                </Stack>
              </FormControl>
              {(!component || !version) && (
                <FormControl isReadOnly={customerView}>
                  <Checkbox
                    size='sm'
                    colorScheme='blue'
                    isChecked={isIncomplete}
                    onChange={() => setIsIncomplete(!isIncomplete)}
                  >
                    Incomplete third party component
                  </Checkbox>
                </FormControl>
              )}
              <FormControl isReadOnly={customerView}>
                <Flex alignItems={'center'} gap={2}>
                  {shortDesc === 'Primary Component' && !isPrimary && (
                    <WarningTwoIcon w={4} h={4} color='red.500' />
                  )}
                  <Checkbox
                    size='sm'
                    colorScheme='blue'
                    isChecked={isPrimary}
                    onChange={() => setIsPrimary(!isPrimary)}
                    disabled={isInternal}
                  >
                    Primary component
                  </Checkbox>
                </Flex>
              </FormControl>
              <FormControl isReadOnly={customerView}>
                <Checkbox
                  size='sm'
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
          <DrawerFooter borderTopWidth='1px'>
            <Button mr={3} onClick={onClose}>
              Cancel
            </Button>
            {id === undefined ? (
              <Button colorScheme='blue' onClick={handleSave}>
                Save
              </Button>
            ) : (
              <Button colorScheme='blue' onClick={handleUpdate}>
                Update
              </Button>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {isPurlOpen && (
        <PurlModal
          data={purlData}
          isOpen={isPurlOpen}
          onClose={onPurlClose}
          setPurlValue={setPurlValue}
          purlValue={purlValue}
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
        />
      )}
    </>
  )
}

export default ComponentDrawer
