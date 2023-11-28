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
  Text,
  Flex
} from '@chakra-ui/react'
import { useMutation } from '@apollo/client'
import { useLocation } from 'react-router-dom'
import { licenseOptions } from 'variables/licenses'
import MultiSelect from 'react-select'
import { sbomCreate, sbomUpdate } from 'graphQL/Mutation'
import { CreateComponent } from 'graphQL/Mutation'
import { recheckHealth } from 'graphQL/Mutation'
import { useContext } from 'react'
import GlobalContext from 'context/GlobalContext'
import { CreateAutomation } from 'graphQL/Mutation'

function ProductSbomDrawer(props) {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const toast = useToast()
  const productId = queryParams.get('p')
  const sbomId = queryParams.get('sbom')

  const { prodField, prodDirection, setCheckFilters } =
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
    filterRefetch,
    projectId
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

  const [compType, setCompType] = useState('')
  const [licenseName, setLicenseName] = useState('')

  const [imgIds, setImgIds] = useState([])
  const [licenseList, setLicenseList] = useState([])

  const [healthRecheck] = useMutation(recheckHealth, {
    onCompleted: () => refetch()
  })

  useEffect(() => {
    if (sbomData) {
      console.log(`sbom data`, sbomData)
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
    } else if (sbomData && sbomData.licenses.length > 0) {
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
        .then(
          (res) => res.data && handleCreateComp(res.data.sbomCreate.sbom.id)
        )
        .finally(() => {
          refetch({
            first: totalRows,
            field: prodField,
            direction: prodDirection
          })
          toast({
            description: 'SBOM added successfully',
            status: 'success',
            position: 'top',
            duration: 3000
          })
          onClose()
        })
    } catch (error) {
      console.log(`Mutation error `, error)
    }
  }

  const handleUpdateSBOM = async () => {
    try {
      await updateSbom({
        variables: {
          id: sbomData.id,
          spec: 'cyclonedx',
          specVersion: version,
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
    try {
      handleCreateSBOM()
    } catch (error) {
      toast({
        description: error.message,
        status: 'error',
        position: 'top',
        duration: 3000
      })
    }
  }

  const containesOther =
    licenseList.length > 0 &&
    licenseList.some((item) => item.value === 'Other' && item.label === 'Other')

  const [createAutoCheck] = useMutation(CreateAutomation)

  const onSaveRule = async () => {
    try {
      await createAutoCheck({
        variables: {
          projectId: productId,
          applicable: 'document',
          condition: 'missing',
          attr: 'license_spdx',
          enabled: true,
          set: JSON.stringify(
            { value: sbomData.licenses.length === 0 ? ['CC0-1.0'] : imgIds },
            null,
            2
          )
        }
      }).then((res) => res.data && handleUpdateSBOM())
    } catch (error) {
      console.log('Error', error)
    }
  }

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
                      defaultValue={'cyclonedx'}
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
                <Text fontSize={'sm'} color={'#222'}>
                  Licenses
                </Text>
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
            <Flex
              width={'100%'}
              justifyContent={'space-between'}
              alignItems={'center'}
            >
              {checkId ? (
                <Button fontSize={'sm'} colorScheme='blue' onClick={onSaveRule}>
                  Save Rule
                </Button>
              ) : (
                <Text></Text>
              )}
              <Stack direction={'row'} spacing={2} alignItems={'center'}>
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
              </Stack>
            </Flex>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default ProductSbomDrawer
