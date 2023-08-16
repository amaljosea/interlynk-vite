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
  Flex,
  Text,
  Divider,
  Spacer,
  Checkbox
} from '@chakra-ui/react'

function ComponentDrawer(props) {
  const { isOpen, onClose, btnRef, component, version, license } = props

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
      value: 'AGPL-1.0-Only',
      label: 'AGPL-1.0-Only'
    },
    {
      id: 3,
      value: 'AGPL-2.0-Only',
      label: 'AGPL-2.0-Only'
    },
    {
      id: 4,
      value: 'MIT',
      label: 'MIT'
    },
    {
      id: 5,
      value: 'BSD',
      label: 'BSD'
    },
    {
      id: 6,
      value: 'LGPL-2.0',
      label: 'LGPL-2.0'
    }
  ]

  useEffect(() => {
    setCompName(component)
    setCompVersion(version)
  }, [component])

  useEffect(() => {
    const filterData = licensOptions.find((item) => item.value === license)
    if (filterData) {
      setSelectedLicense(license)
    } else {
      setLicenseName(license)
    }
  }, [license])

  return (
    <Drawer
      isOpen={isOpen}
      placement='right'
      onClose={onClose}
      finalFocusRef={btnRef}
      size='md'
    >
      <DrawerOverlay />
      <form>
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
                  <option value='Library'>Library</option>
                  <option value='Operating system'>Operating system</option>
                  <option value='Firmware'>Firmware</option>
                  <option value='File'>File</option>
                  <option value='Device'>Device</option>
                  <option value='Container'>Container</option>
                  <option value='Framework'>Framework</option>
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
                  isDisabled={licenseName !== ''}
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
              <FormControl isDisabled={selectedLicense !== ''}>
                <FormLabel fontSize={'sm'}>Or</FormLabel>
                <Input
                  size='sm'
                  placeholder='Enter a valid SPDX license'
                  value={licenseName}
                  onChange={(e) => setLicenseName(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize={'sm'}>Indentifiers</FormLabel>
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
              Save
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </form>
    </Drawer>
  )
}

export default ComponentDrawer
