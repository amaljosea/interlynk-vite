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
  Checkbox
} from '@chakra-ui/react'
import { useMutation } from '@apollo/client'
import { CreateComponent } from 'graphQL/Mutation'
import { UpdateComponent } from 'graphQL/Mutation'
import { useLocation } from 'react-router-dom'

function ComponentDrawer(props) {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)

  const productId = queryParams.get('p')
  const sbomId = queryParams.get('sbom')

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
    refetch
  } = props

  const [createComponent] = useMutation(CreateComponent)
  const [updateComponent] = useMutation(UpdateComponent)

  const [compId, setCompId] = useState('')
  const [compName, setCompName] = useState('')
  const [compVersion, setCompVersion] = useState('')
  const [compType, setCompType] = useState('')
  const [licenseName, setLicenseName] = useState('')
  const [selectedLicense, setSelectedLicense] = useState('')
  const [supName, setSupName] = useState('')
  const [supEmail, setSupEmail] = useState('')
  const [supOrg, setSupOrg] = useState('')
  const [cpeValue, setCpeValue] = useState('')
  const [purlValue, setPurlValue] = useState('')

  const licensOptions = [
    {
      id: 1,
      value: '',
      label: '-- Select --'
    },
    {
      id: 2,
      value: 'Custom',
      label: 'Custom'
    },
    {
      id: 3,
      value: 'AGPL-1.0-Only',
      label: 'AGPL-1.0-Only'
    },
    {
      id: 4,
      value: 'AGPL-2.0-Only',
      label: 'AGPL-2.0-Only'
    },
    {
      id: 5,
      value: 'MIT',
      label: 'MIT'
    },
    {
      id: 6,
      value: 'BSD',
      label: 'BSD'
    },
    {
      id: 7,
      value: 'LGPL-2.0',
      label: 'LGPL-2.0'
    }
  ]

  useEffect(() => {
    setCompId(id)
    setCompName(component)
    setCompVersion(version)
    setCompType(type)
    setSelectedLicense(license[0])
    setCpeValue(cpes[0])
    setPurlValue(purl)
  }, [component])

  useEffect(() => {
    const filterData = licensOptions.find((item) => item.value === license)
    if (filterData) {
      setSelectedLicense(license)
    } else {
      setLicenseName(license)
    }
  }, [license])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (component === '') {
      try {
        await createComponent({
          variables: {
            id: sbomId,
            kind: compType,
            name: compName,
            version: compVersion,
            licenses:
              selectedLicense === 'Custom' ? licenseName : selectedLicense,
            cpes: cpeValue,
            purl: purlValue
          }
        })
          .then(() =>
            refetch({
              projectId: productId,
              sbomId: sbomId
            })
          )
          .finally(() => onClose())
      } catch (error) {
        console.error('Mutation error:', error)
      }
    } else {
      try {
        await updateComponent({
          variables: {
            id: id,
            kind: compType,
            name: compName,
            version: compVersion,
            licenses:
              selectedLicense === 'Custom' ? licenseName : selectedLicense,
            cpes: cpeValue,
            purl: purlValue
          }
        })
          .then(() =>
            refetch({
              projectId: productId,
              sbomId: sbomId
            })
          )
          .finally(() => onClose())
      } catch (error) {
        console.error('Mutation error:', error)
      }
    }
  }

  return (
    <Drawer
      isOpen={isOpen}
      placement='right'
      onClose={onClose}
      finalFocusRef={btnRef}
      size='md'
    >
      <DrawerOverlay />
      <form onSubmit={handleSubmit}>
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth='1px' color='gray.600'>
            Component
          </DrawerHeader>
          <DrawerBody>
            <Stack direction={'column'} spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize={'sm'}>Name</FormLabel>
                <Input
                  size='sm'
                  placeholder='Enter name'
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize={'sm'}>Version</FormLabel>
                <Input
                  size='sm'
                  placeholder='Enter version'
                  value={compVersion}
                  onChange={(e) => setCompVersion(e.target.value)}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize={'sm'}>Type</FormLabel>
                <Select
                  id='type'
                  name='type'
                  size='sm'
                  value={compType}
                  onChange={(e) => setCompType(e.target.value)}
                >
                  <option value=''>-- Select --</option>
                  <option value='required'>Required</option>
                  <option value='unknown'>Unknown</option>
                  <option value='library'>Library</option>
                  <option value='operating_system'>Operating system</option>
                  <option value='firmware'>Firmware</option>
                  <option value='file'>File</option>
                  <option value='device'>Device</option>
                  <option value='container'>Container</option>
                  <option value='framework'>Framework</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize={'sm'}>Supplier</FormLabel>
                <Stack spacing={2}>
                  <Input
                    size='sm'
                    placeholder='Name'
                    value={supName}
                    onChange={(e) => setSupName(e.target.value)}
                  />
                  <Input
                    size='sm'
                    placeholder='Email'
                    value={supEmail}
                    onChange={(e) => setSupEmail(e.target.value)}
                  />
                  <Input
                    size='sm'
                    placeholder='Organization'
                    value={supOrg}
                    onChange={(e) => setSupOrg(e.target.value)}
                  />
                </Stack>
              </FormControl>
              <FormControl>
                <FormLabel fontSize={'sm'}>License</FormLabel>
                <Select
                  size='sm'
                  // isDisabled={licenseName !== ''}
                  name='license'
                  id='license'
                  value={selectedLicense}
                  onChange={(e) => setSelectedLicense(e.target.value)}
                >
                  {licensOptions.map((item) => (
                    <option key={item.id} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </Select>
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
              <FormControl>
                <FormLabel fontSize={'sm'}>Identifiers</FormLabel>
                <Stack spacing={2}>
                  <Input
                    size='sm'
                    placeholder='CPE'
                    value={cpeValue}
                    onChange={(e) => setCpeValue(e.target.value)}
                  />
                  <Input
                    size='sm'
                    placeholder='PURL'
                    value={purlValue}
                    onChange={(e) => setPurlValue(e.target.value)}
                  />
                </Stack>
              </FormControl>
              {(!component || !version) && (
                <FormControl>
                  <Checkbox
                    mt='10px'
                    size='sm'
                    colorScheme='blue'
                    color='gray.500'
                  >
                    Incomplete third party component
                  </Checkbox>
                </FormControl>
              )}
            </Stack>
          </DrawerBody>
          <DrawerFooter borderTopWidth='1px'>
            <Button variant='outline' mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme='blue' type='submit'>
              {component === '' ? 'Save' : 'Update'}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </form>
    </Drawer>
  )
}

export default ComponentDrawer
