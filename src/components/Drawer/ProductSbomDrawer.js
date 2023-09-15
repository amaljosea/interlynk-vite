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
  Text,
  Flex,
  Box,
  TagCloseButton,
  TagLabel,
  Tag,
  Code,
  useToast,
  Checkbox,
  Textarea
} from '@chakra-ui/react'
import { useMutation } from '@apollo/client'
import { useLocation } from 'react-router-dom'
import { licenseOptions } from 'variables/licenses'
import MultiSelect from 'react-select'
import { sbomCreate, sbomUpdate } from 'graphQL/Mutation'
import { CreateComponent } from 'graphQL/Mutation'

import { PackageURL } from 'packageurl-js'

function ProductSbomDrawer(props) {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const toast = useToast()
  const sbomId = queryParams.get('sbom')

  const {
    projectId,
    name,
    isOpen,
    onClose,
    btnRef,
    refetch,
    sbomData,
    type
  } = props

  const [createSbom] = useMutation(sbomCreate)
  const [updateSbom] = useMutation(sbomUpdate)

  const [createComponent] = useMutation(CreateComponent)

  // console.log(`sbom Data`, sbomData)

  const [version, setVersion] = useState('')
  const [spec, setSpec] = useState('')
  const [specVesion, setSpecVersion] = useState('')
  const [compType, setCompType] = useState(type)
  const [licenseName, setLicenseName] = useState('')
  const [selectedLicense, setSelectedLicense] = useState('')

  const [cpeList, setCpeList] = useState([])
  const [cpeValue, setCpeValue] = useState('')
  const [purlValue, setPurlValue] = useState('')

  const [imgIds, setImgIds] = useState([])
  const [licenseList, setLicenseList] = useState([])

  useEffect(() => {
    if (sbomData) {
      // console.log(`sbom data`, sbomData)
      setSpec(sbomData.sbom.spec)
      setSpecVersion(sbomData.sbom.specVersion)
      setCompType(sbomData.sbom.format)
      setCpeList(sbomData.sbom.cpes)
      setPurlValue(sbomData.sbom.purl === null ? '' : sbomData.sbom.purl)
      if (sbomData.sbom.licenses.length > 0) {
        const res = sbomData.sbom.licenses.map((item) => item)
        setImgIds(res)
      }
    }
  }, [sbomData])

  useEffect(() => {
    if (sbomData && sbomData.sbom.licenses.length > 0) {
      const commonValues = licenseOptions.filter((item1) =>
        sbomData.sbom.licenses.includes(item1.licenseId)
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
          id: id,
          kind: compType,
          name: name,
          version: version,
          licenses: imgIds,
          cpes: cpeList,
          purl: purlValue,
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
          licenses: imgIds,
          cpes: cpeList,
          purl: purlValue
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

  const handleUpdateSBOM = async () => {
    try {
      await updateSbom({
        variables: {
          id: sbomData.sbom.id,
          spec: 'cyclonedx',
          specVersion: '1.4',
          format: compType,
          licenses: imgIds,
          cpes: cpeList,
          purl: purlValue
        }
      }).then(() => {
        refetch({
          projectId: projectId,
          sbomId: sbomId
        })
        onClose()
        toast({
          description: 'SBOM updated successfully',
          status: 'success',
          position: 'top',
          duration: 3000
        })
      })
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

  const handleUpdate = () => {
    if (purlValue !== '') {
      try {
        const pkg = PackageURL.fromString(purlValue)
        handleUpdateSBOM()
      } catch (error) {
        toast({
          description: error.message,
          status: 'error',
          position: 'top',
          duration: 3000
        })
      }
    } else {
      handleUpdateSBOM()
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      setCpeList([...cpeList, cpeValue])
      setCpeValue('')
    }
  }

  const deleteCpe = (index) => {
    const updatedItems = cpeList.filter((_, i) => i !== index)
    setCpeList(updatedItems)
  }

  // console.log('cpeList', cpeList)

  return (
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
          {sbomData ? 'Update' : 'Create'} SBOM
        </DrawerHeader>
        <DrawerBody>
          <Stack direction={'column'} spacing={4}>
            {!sbomData && (
              <>
                <FormControl>
                  <FormLabel fontSize={'sm'}>Name</FormLabel>
                  <Input size='sm' type='text' defaultValue={name} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize={'sm'}>Version</FormLabel>
                  <Input
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
            <FormControl pointerEvents={'none'}>
              <FormLabel fontSize={'sm'}>Type</FormLabel>
              <Select
                id='type'
                name='type'
                size='sm'
                value={compType}
                onChange={(e) => setCompType(e.target.value)}
              >
                <option value=''>-- Select --</option>
                <option value='unknown'>Unknown</option>
                {/* <option value='json'>JSON</option> */}
                <option value='library'>Library</option>
                <option value='operating_system'>Operating system</option>
                <option value='firmware'>Firmware</option>
                <option value='file'>File</option>
                <option value='device'>Device</option>
                <option value='container'>Container</option>
                <option value='framework'>Framework</option>
              </Select>
            </FormControl>
            {/* Licenses */}
            <FormControl fontSize={'sm'}>
              <FormLabel fontSize={'sm'}>Licenses</FormLabel>
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
            {selectedLicense === 'Custom' && (
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
            <FormControl>
              <FormLabel fontSize={'sm'}>Identifiers</FormLabel>
              <Stack spacing={2}>
                <Textarea
                  size='sm'
                  rows={2}
                  placeholder='PURL'
                  value={purlValue}
                  onChange={(e) => setPurlValue(e.target.value)}
                />

                {/* CPE List */}
                <Box>
                  <Box mb={4}>
                    <Input
                      type='text'
                      size='sm'
                      value={cpeValue}
                      onChange={(e) => setCpeValue(e.target.value)}
                      placeholder='CPES'
                      onKeyDown={handleKeyDown}
                    />
                    <Text fontSize={'xs'} mt={2}>
                      Press <Code>enter</Code> to add CPE's
                    </Text>
                  </Box>
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
                        <TagLabel>{item}</TagLabel>
                        <TagCloseButton onClick={() => deleteCpe(index)} />
                      </Tag>
                    ))}
                  </Flex>
                </Box>
              </Stack>
            </FormControl>
            {!sbomData && (
              <FormControl isReadOnly={true}>
                <Checkbox size='sm' colorScheme='blue' defaultChecked={true}>
                  Primary component
                </Checkbox>
              </FormControl>
            )}
          </Stack>
        </DrawerBody>
        <DrawerFooter borderTopWidth='1px'>
          <Button variant='outline' mr={3} onClick={onClose}>
            Cancel
          </Button>
          {sbomData ? (
            <Button colorScheme='blue' onClick={handleUpdate}>
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
  )
}

export default ProductSbomDrawer
