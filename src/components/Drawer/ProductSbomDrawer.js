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
  Select,
  useToast,
  Checkbox,
  useDisclosure,
  InputGroup,
  InputRightElement,
  IconButton,
  Text
} from '@chakra-ui/react'
import { useMutation } from '@apollo/client'
import { useLocation } from 'react-router-dom'
import { licenseOptions } from 'variables/licenses'
import MultiSelect from 'react-select'
import { sbomCreate, sbomUpdate } from 'graphQL/Mutation'
import { CreateComponent } from 'graphQL/Mutation'

import { PackageURL } from 'packageurl-js'
import PurlModal from 'views/Dashboard/Products/components/PurlModal'
import CpeModal from 'views/Dashboard/Products/components/CpeModal'
import { FaExpandAlt } from 'react-icons/fa'
import { CheckIcon, WarningTwoIcon } from '@chakra-ui/icons'
import { recheckHealth } from 'graphQL/Mutation'
import { useContext } from 'react'
import GlobalContext from 'context/GlobalContext'

const regexPattern =
  /^cpe:2\.3:[aho]:[^:]+:[^:]+:[^:]+:[^:]+:[^:]+:[^:]+:[^:]+:[^:]+:[^:]+:[^:]+$/

function ProductSbomDrawer(props) {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const toast = useToast()
  const productId = queryParams.get('p')
  const sbomId = queryParams.get('sbom')

  const { checkField, checkDirection, setCheckFilters } =
    useContext(GlobalContext)

  const {
    name,
    isOpen,
    onClose,
    btnRef,
    refetch,
    sbomData,
    type,
    checkId,
    totalRows,
    filterRefetch
  } = props

  const handleRefetch = () => {
    refetch({
      projectId: productId,
      sbomId: sbomId
    })
  }

  const onFilterRefetch = () => {
    filterRefetch({
      projectId: productId,
      sbomId: sbomId
    }).then((res) => setCheckFilters(res.data.sbom.filters))
  }

  const [createSbom] = useMutation(sbomCreate, {
    onCompleted: () => handleRefetch()
  })
  const [updateSbom] = useMutation(sbomUpdate, {
    onCompleted: () => handleRefetch()
  })

  const [createComponent] = useMutation(CreateComponent)

  const [version, setVersion] = useState('')
  const [spec, setSpec] = useState('')
  const [specVesion, setSpecVersion] = useState('')
  const [compType, setCompType] = useState('')
  const [licenseName, setLicenseName] = useState('')
  const [selectedLicense, setSelectedLicense] = useState('')

  const [cpeList, setCpeList] = useState([])
  const [cpeValue, setCpeValue] = useState('')
  const [cpeData, setCpeData] = useState(null)
  const [selectedCpe, setSelectedCpe] = useState(null)
  const [purlValue, setPurlValue] = useState('')
  const [purlData, setPurlData] = useState(null)

  const [imgIds, setImgIds] = useState([])
  const [licenseList, setLicenseList] = useState([])

  const [isPURLInputValid, setPURLInputValid] = useState(true)
  const [isCPEInputValid, setCPEInputValid] = useState(true)

  const [healthRecheck] = useMutation(recheckHealth, {
    onCompleted: () => {
      refetch({
        projectId: productId,
        sbomId: sbomId,
        first: totalRows,
        last: undefined,
        after: undefined,
        before: undefined,
        category: undefined,
        severity: undefined,
        status: undefined,
        field: checkField,
        direction: checkDirection
      })
    }
  })

  useEffect(() => {
    if (sbomData) {
      // console.log(`sbom data`, sbomData)
      setSpec(sbomData.spec)
      setSpecVersion(sbomData.specVersion)
      setCpeList(sbomData.cpes)
      setPurlValue(sbomData.purl === null ? '' : sbomData.purl)
      // if (sbomData.licenses) {
      //   const res = sbomData.licenses.map((item) => item)
      //   setImgIds(res)
      // }
    }
  }, [sbomData])

  useEffect(() => {
    setCompType(type)
  }, [type])

  useEffect(() => {
    if (sbomData && sbomData.licenses.length === 0) {
      setLicenseList([
        {
          value: 'CC0-1.0',
          label: 'Creative Commons Zero v1.0 Universal'
        }
      ])
    }
  }, [sbomData])

  useEffect(() => {
    if (sbomData && sbomData.licenses.length > 0) {
      const commonValues = licenseOptions.filter((item1) =>
        sbomData.licenses.includes(item1.licenseId)
      )
      const data = commonValues.map((item) => {
        return {
          value: item.licenseId,
          label: item.name
        }
      })
      setLicenseList(data)
    }
  }, [sbomData])

  const licenses = licenseOptions.map((option) => ({
    value: option.licenseId,
    label: option.name
  }))

  const onLicenseChange = (selected) => {
    setLicenseList(selected)
    const selectedIds = selected.map((option) => option.value) // Extracting IDs
    setImgIds(selectedIds)
  }

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

  const matches = cpeValue.match(regexPattern)

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

  const handleCreateComp = (id) => {
    try {
      createComponent({
        variables: {
          sbomId: id,
          kind: compType,
          name: name,
          version: version,
          licenses: imgIds,
          primary: true
        }
      })
    } catch (error) {
      console.log(`Something went wrong `, error)
    }
  }

  const handleCreateSBOM = async () => {
    try {
      await createSbom({
        variables: {
          projectId: projectId,
          spec: 'cyclonedx',
          specVersion: '1.4',
          format: compType,
          licenses: imgIds
        }
      })
        .then((res) => {
          console.log(`res`, res)
          handleCreateComp(res.data.sbomCreate.sbom.id)
        })
        .finally(() => {
          refetch({
            first: 10
          })
          onClose()
          toast({
            description: 'SBOM added successfully',
            status: 'success',
            position: 'top',
            duration: 3000
          })
        })
    } catch (error) {
      console.log(`Mutation error `, error)
    }
  }

  // console.log('imgIds', imgIds)

  const handleUpdateSBOM = async () => {
    try {
      await updateSbom({
        variables: {
          id: sbomData.id,
          spec: 'cyclonedx',
          specVersion: '1.4',
          format: compType,
          licenses: sbomData.licenses.length === 0 ? ['CC0-1.0'] : imgIds
        }
      })
        .then((res) => {
          if (res.data) {
            onFilterRefetch()
          }

          if (checkId) {
            healthRecheck({
              variables: {
                checkId: checkId,
                sbomId: sbomId
              }
            })
          }
        })
        .finally(() => onClose())
    } catch (error) {
      console.log(`Mutation error `, error)
    }
  }

  const handleSave = () => {
    if (purlValue !== '') {
      try {
        const pkg = PackageURL.fromString(purlValue)
        if (version !== '') {
          handleCreateSBOM()
        } else {
          toast({
            description: 'Version required',
            status: 'error',
            position: 'top',
            duration: 3000
          })
        }
      } catch (error) {
        toast({
          description: error.message,
          status: 'error',
          position: 'top',
          duration: 3000
        })
      }
    } else {
      if (version !== '') {
        handleCreateSBOM()
      } else {
        toast({
          description: 'Version required',
          status: 'error',
          position: 'top',
          duration: 3000
        })
      }
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
    const updatedItems = cpeList.filter((_, i) => i.id !== index)
    setCpeList(updatedItems)
  }

  const containesOther =
    licenseList.length > 0 &&
    licenseList.some((item) => item.value === 'Other' && item.label === 'Other')

  return (
    <>
      <Drawer isOpen={isOpen} placement='right' onClose={onClose} size='sm'>
        <DrawerOverlay />

        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth='1px' color='gray.600'>
            {sbomData ? 'Update' : 'Create'} SBOM
          </DrawerHeader>
          <DrawerBody>
            <Stack direction={'column'} spacing={4}>
              {!sbomData && (
                <>
                  <FormControl>
                    <FormLabel htmlFor='sbomName' fontSize={'sm'}>
                      Name
                    </FormLabel>
                    <Input
                      id='sbomName'
                      name='sbomName'
                      size='sm'
                      type='text'
                      defaultValue={name}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel htmlFor='sbomVersion' fontSize={'sm'}>
                      Version
                    </FormLabel>
                    <Input
                      id='sbomVersion'
                      name='sbomVersion'
                      size='sm'
                      type='text'
                      vaue={version}
                      onChange={(e) => setVersion(e.target.value)}
                      placeholder='Enter version'
                    />
                  </FormControl>
                </>
              )}
              {/* Format */}
              {!checkId && (
                <FormControl>
                  <FormLabel htmlFor='type' fontSize={'sm'}>
                    Type
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
              )}

              {/* Licenses */}
              <Stack spacing={2} fontSize={'sm'}>
                <Text fontSize={'sm'} color={'#222'}>Licenses</Text>
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
                  id='licenses'
                  name='licenses'
                  value={licenseList}
                  options={licenses}
                  onChange={onLicenseChange}
                />
              </Stack>
              {containesOther && (
                <FormControl>
                  <Input
                    size='sm'
                    id='other'
                    name='other'
                    placeholder='Enter a valid SPDX license'
                    value={licenseName}
                    onChange={(e) => setLicenseName(e.target.value)}
                  />
                </FormControl>
              )}

              {/* PRIMARY COMPONENT */}
              {!sbomData && (
                <FormControl htmlFor={'isPrimary'} isReadOnly={true}>
                  <Checkbox
                    id='isPrimary'
                    name='isPrimary'
                    size='sm'
                    colorScheme='blue'
                    defaultChecked={true}
                  >
                    Primary component
                  </Checkbox>
                </FormControl>
              )}
            </Stack>
          </DrawerBody>
          <DrawerFooter borderTopWidth='1px'>
            <Button mr={3} onClick={onClose}>
              Cancel
            </Button>
            {sbomData ? (
              <Button colorScheme='blue' onClick={handleUpdateSBOM}>
                Update
              </Button>
            ) : (
              <Button colorScheme='blue' onClick={handleSave}>
                Save
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

export default ProductSbomDrawer
