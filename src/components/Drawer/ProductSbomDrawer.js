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
  useToast
} from '@chakra-ui/react'
import { useMutation } from '@apollo/client'
import { useLocation } from 'react-router-dom'
import { licenseOptions } from 'variables/licenses'
import MultiSelect from 'react-select'
import { sbomCreate, sbomUpdate } from 'graphQL/Mutation'


function ProductSbomDrawer(props) {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const toast = useToast()
  const sbomId = queryParams.get('sbom')

  const { projectId, name, isOpen, onClose, btnRef, refetch, sbomData } = props

  const [createSbom] = useMutation(sbomCreate)
  const [updateSbom] = useMutation(sbomUpdate)

  const [spec, setSpec] = useState('')
  const [specVesion, setSpecVersion] = useState('')
  const [compType, setCompType] = useState('')
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

  const handleSave = async () => {
    if (spec) {
      try {
        await createSbom({
          variables: {
            projectId: projectId,
            spec: spec,
            specVersion: specVesion,
            format: compType,
            licenses: imgIds,
            cpes: cpeList,
            purl: purlValue
          }
        }).then(() => {
          refetch({
            first: 10
          })
          onClose()
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

  const handleUpdate = async () => {
    try {
      await updateSbom({
        variables: {
          id: sbomData.sbom.id,
          spec: spec,
          specVersion: specVesion,
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
      })
    } catch (error) {
      console.error('Mutation error:', error)
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
          {name}
        </DrawerHeader>
        <DrawerBody>
          <Stack direction={'column'} spacing={4}>
            <FormControl isRequired>
              <FormLabel fontSize={'sm'}>SPEC</FormLabel>
              <Input
                size='sm'
                placeholder='Enter spec'
                value={spec}
                onChange={(e) => setSpec(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize={'sm'}>SPEC Version</FormLabel>
              <Input
                size='sm'
                placeholder='Enter spec version'
                value={specVesion}
                onChange={(e) => setSpecVersion(e.target.value)}
              />
            </FormControl>
            {/* Format */}
            <FormControl>
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
                <option value='json'>JSON</option>
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
                <Input
                  size='sm'
                  placeholder='PURL'
                  value={purlValue}
                  onChange={(e) => setPurlValue(e.target.value)}
                />

                {/* CPE List */}
                <Box>
                  <Box mb={4}>
                    <Input
                      type='text'
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
