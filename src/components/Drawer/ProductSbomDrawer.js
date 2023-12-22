// Chakra imports
import React, { useState, useContext, useRef } from 'react'
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
  Checkbox,
  useDisclosure,
  Text,
  Tooltip,
  InputGroup,
  IconButton,
  Flex,
  Icon,
  InputRightElement,
  Tag,
  TagLabel,
  TagCloseButton
} from '@chakra-ui/react'
import { useLazyQuery, useMutation } from '@apollo/client'
import { sbomCreate, CreateComponent } from 'graphQL/Mutation'
import GlobalContext from 'context/GlobalContext'
import LicenseField from 'components/LicenseField'
import { CheckIcon, InfoIcon, WarningTwoIcon } from '@chakra-ui/icons'
import CpeInput from 'components/CpeInput'
import { FaExpandAlt } from 'react-icons/fa'
import { PackageURL } from 'packageurl-js'
import PurlModal from 'views/Dashboard/Products/components/PurlModal'
import CpeModal from 'views/Dashboard/Products/components/CpeModal'
import { CpeAutoComplete } from 'graphQL/Queries'

function ProductSbomDrawer({ isOpen, onClose, refetch, data }) {
  const toast = useToast()

  const {
    prodField,
    prodDirection,
    licenseType,
    spdxLicense,
    totalRows,
    customLicense,
    setPurlString,
    licenseExp
  } = useContext(GlobalContext)

  const [sbomName, setSbomName] = useState('')
  const [version, setVersion] = useState('')
  const [compType, setCompType] = useState('')

  const [groupInfo, setGroupInfo] = useState('')
  const [compScope, setCompScope] = useState('')
  const [cpeValue, setCpeValue] = useState('')
  const [cpeList, setCpeList] = useState([])
  const [cpeData, setCpeData] = useState([])
  const [selectedCpe, setSelectedCpe] = useState(null)
  const [purlValue, setPurlValue] = useState('')
  const [purlData, setPurlData] = useState(null)
  const [isPURLInputValid, setPURLInputValid] = useState(true)

  const [getCpe] = useLazyQuery(CpeAutoComplete)
  const [createSbom] = useMutation(sbomCreate, {
    onCompleted: () => handleRefetch()
  })
  const [createComponent] = useMutation(CreateComponent)

  const {
    isOpen: isWarningOpen,
    onOpen: onWarningOpen,
    onClose: onWarningClose
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

  // PURL
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
      setPurlString(pkg.toString())
    } else {
      setPurlString('pkg:type/name@version?key=value')
    }
    onPurlOpen()
  }

  // CPE
  const cpeRef = useRef()

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

  const deleteCpe = (index) => {
    const updatedItems = cpeList.filter((_, i) => i !== index)
    setCpeList(updatedItems)
  }

  const handleCpeChange = (e) => {
    const { value } = e.target
    const val = value.replace(/\s/g, '')
    setCpeValue(val)
    if (val === '') {
      setCpeData([])
    } else {
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
        if (res.data) {
          setCpeData(res.data.idAutoComplete.result)
        }
      })
    }
  }

  const handleRefetch = () => {
    refetch({
      first: totalRows,
      field: prodField,
      direction: prodDirection
    })
  }

  const existingVersions = data?.sboms.map(
    (item) => item?.primaryComponent?.version
  )

  const handleCreateComp = async (id) => {
    await createComponent({
      variables: {
        sbomId: id,
        kind: compType,
        name: sbomName,
        version: version,
        group: groupInfo,
        scope: compScope,
        licenses:
          spdxLicense.length === 0 &&
          licenseExp === '' &&
          customLicense.length === 0
            ? undefined
            : {
                licenses:
                  licenseType === 'license_spdx' ? spdxLicense : undefined,
                licensesExp:
                  licenseType === 'license_exp' ? licenseExp : undefined,
                licensesCustom:
                  licenseType === 'license_custom' ? customLicense : undefined
              },
        cpes: cpeList,
        purl: purlValue,
        primary: true,
        internal: false
      }
    }).then(
      (res) =>
        res.data &&
        toast({
          description: 'SBOM added successfully',
          status: 'success',
          position: 'top',
          duration: 3000
        })
    )
  }

  const onCreateSBOM = async () => {
    await createSbom({
      variables: {
        projectId: data.id,
        spec: 'cyclonedx',
        specVersion: '1.4',
        format: 'json'
      }
    })
      .then((res) => {
        if (res.data.sbomCreate.errors.length === 0) {
          handleCreateComp(res.data.sbomCreate.sbom.id)
        } else {
          toast({
            description: res.data.sbomCreate.errors,
            status: 'error',
            position: 'top',
            duration: 4000
          })
        }
      })
      .finally(() => onClose())
  }

  const handleCreateSBOM = async () => {
    if (existingVersions?.includes(version)) {
      onWarningOpen()
    } else {
      onCreateSBOM()
    }
  }

  return (
    <>
      <Drawer isOpen={isOpen} placement='right' onClose={onClose} size='md'>
        <DrawerOverlay />

        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth='1px' color='gray.600'>
            Create SBOM
          </DrawerHeader>
          <DrawerBody>
            <Stack direction={'column'} spacing={4}>
              {/* NAME */}
              <FormControl isRequired>
                <FormLabel htmlFor='sbomName' fontSize={'sm'}>
                  Name
                </FormLabel>
                <Input
                  fontSize={'sm'}
                  type='text'
                  id='sbomName'
                  name='sbomName'
                  value={sbomName}
                  onChange={(e) => setSbomName(e.target.value)}
                  placeholder='Enter name'
                />
              </FormControl>
              {/* VERSION */}
              <FormControl isRequired>
                <FormLabel htmlFor='sbomVersion' fontSize={'sm'}>
                  Version
                </FormLabel>
                <Input
                  fontSize={'sm'}
                  type='text'
                  id='sbomVersion'
                  name='sbomVersion'
                  vaue={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder='Enter version'
                />
              </FormControl>
              {/* Group */}
              <FormControl>
                <FormLabel htmlFor='groupInfo' fontSize={'sm'}>
                  <Flex flexDirection={'row'} alignItems={'center'} gap={2}>
                    <Text>Group</Text>
                    <Tooltip label='Group Info'>
                      <Icon as={InfoIcon} color={'blue.500'} />
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
              {/* Format */}
              <FormControl isRequired>
                <FormLabel htmlFor='compType' fontSize={'sm'}>
                  Type
                </FormLabel>
                <Select
                  id='compType'
                  name='compType'
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
              {/* Licenses */}
              <LicenseField data={data} />
              {/* PURL INPUI */}
              <FormControl isInvalid={purlValue !== '' && !isPURLInputValid}>
                <FormLabel htmlFor='purl' fontSize={'sm'}>
                  <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
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
                  mt={2}
                >
                  {cpeList?.map((item, index) => (
                    <Tag key={index} variant='solid' colorScheme={'blue'}>
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
              <FormControl htmlFor={'isPrimary'} isReadOnly={true}>
                <Checkbox
                  size='sm'
                  id='isPrimary'
                  name='isPrimary'
                  colorScheme='blue'
                  defaultChecked={true}
                  mt={4}
                >
                  Primary component
                </Checkbox>
              </FormControl>
            </Stack>
          </DrawerBody>
          <DrawerFooter borderTopWidth='1px'>
            <Button mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme='blue'
              onClick={handleCreateSBOM}
              disabled={sbomName === '' || compType === '' || version === ''}
            >
              Save
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* WARNING */}
      {isWarningOpen && (
        <Modal isOpen={isWarningOpen} onClose={onWarningClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{version}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>
                An SBOM with the same version already exists. Continuing with
                building this SBOM will delete existing version data and replace
                it with the SBOM being built.{' '}
              </Text>
              <Text mt={10}>Are you sure you wish to continue?</Text>
            </ModalBody>
            <ModalFooter>
              <Button mr={3} onClick={onWarningClose}>
                Cancel
              </Button>
              <Button colorScheme='red' onClick={onCreateSBOM}>
                Ok
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

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
    </>
  )
}

export default ProductSbomDrawer
