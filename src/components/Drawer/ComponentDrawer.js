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
  Checkbox,
  Table,
  Thead,
  Th,
  Tr,
  Tbody,
  Td,
  Text,
  Flex,
  ListItem,
  UnorderedList,
  Box,
  IconButton,
  TagCloseButton,
  TagLabel,
  Tag,
  Code,
  useToast,
  RadioGroup,
  Radio
} from '@chakra-ui/react'
import { useMutation } from '@apollo/client'
import { CreateComponent } from 'graphQL/Mutation'
import { UpdateComponent } from 'graphQL/Mutation'
import { useLocation } from 'react-router-dom'
import { licenseOptions } from 'variables/licenses'
import { CloseIcon } from '@chakra-ui/icons'
import { timeSince } from 'utils'

function ComponentDrawer(props) {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const toast = useToast()
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
    primary,
    internal,
    suppliers,
    refetch
  } = props

  // console.log(`id`, id)

  const [createComponent] = useMutation(CreateComponent)
  const [updateComponent] = useMutation(UpdateComponent)

  const [compId, setCompId] = useState('')
  const [compName, setCompName] = useState('')
  const [compVersion, setCompVersion] = useState('')
  const [compType, setCompType] = useState('')
  const [licenseName, setLicenseName] = useState('')
  const [selectedLicense, setSelectedLicense] = useState('')

  const [cpeList, setCpeList] = useState([])
  const [cpeValue, setCpeValue] = useState('')
  const [purlValue, setPurlValue] = useState('')

  const [isIncomplete, setIsIncomplete] = useState(false)
  const [isPrimary, setIsPrimary] = useState(primary)
  const [isInternal, setIsInternal] = useState(internal)

  console.log(`isPrimary`, isPrimary)

  useEffect(() => {
    setCompId(id)
    setCompName(component)
    setCompVersion(version)
    setCompType(type)
    setSelectedLicense(license[0])
    setCpeList(cpes)
    setPurlValue(purl)
  }, [component])

  useEffect(() => {
    const filterData = licenseOptions.find((item) => item.licenseId === license)
    if (filterData) {
      setSelectedLicense(license)
    } else {
      setLicenseName(license)
    }
  }, [license])

  const handleSave = async () => {
    if (compName && compType) {
      try {
        await createComponent({
          variables: {
            id: sbomId,
            kind: compType,
            name: compName,
            version: compVersion,
            licenses: [
              selectedLicense === 'Custom' ? licenseName : selectedLicense
            ],
            cpes: cpeList,
            purl: purlValue,
            primary: isPrimary,
            internal: isInternal
          }
        }).then(() => {
          refetch({
            projectId: productId,
            sbomId: sbomId
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
      await updateComponent({
        variables: {
          id: id,
          kind: compType,
          name: compName,
          version: compVersion,
          licenses: [
            selectedLicense === 'Custom' ? licenseName : selectedLicense
          ],
          cpes: cpeList,
          purl: purlValue,
          primary: isPrimary,
          internal: isInternal
        }
      }).then(() => {
        refetch({
          projectId: productId,
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
            {/* Kind */}
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
            {/* Suppliers */}
            {id !== undefined && (
              <Flex width={'100%'} flexDir={'column'}>
                <Text size='md' my={2}>
                  Suppliers List
                </Text>
                {suppliers.length > 0 ? (
                  <Table variant='simple' size='sm' mt={2}>
                    <Thead>
                      <Tr my='.8rem'>
                        <Th pl={0}>Name</Th>
                        <Th pl={0}>Email</Th>
                        <Th pl={0}>Updated At</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {suppliers.map((item, index) => (
                        <Tr key={index}>
                          <Td pl={0} fontSize={'xs'}>
                            {item.name}
                          </Td>
                          <Td pl={0} fontSize={'xs'}>
                            {item.email}
                          </Td>
                          <Td pl={0} fontSize={'xs'}>
                            {timeSince(item.updatedAt)}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                ) : (
                  <Text mt={2} color={'darkgrey'}>
                    No suppliers specified
                  </Text>
                )}
              </Flex>
            )}
            {/* Licenses */}
            <FormControl>
              <FormLabel fontSize={'sm'}>License</FormLabel>
              <Select
                size='sm'
                name='license'
                id='license'
                value={selectedLicense}
                onChange={(e) => setSelectedLicense(e.target.value)}
              >
                {licenseOptions.map((item) => (
                  <option key={item.licenseId} value={item.licenseId}>
                    {item.name}
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
                      placeholder='CPE'
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
            {(!component || !version) && (
              <FormControl>
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
            <FormControl>
              <Checkbox
                size='sm'
                colorScheme='blue'
                isChecked={isPrimary}
                onChange={() => setIsPrimary(!isPrimary)}
                disabled={isInternal}
              >
                Primary component
              </Checkbox>
            </FormControl>
            <FormControl>
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
          <Button variant='outline' mr={3} onClick={onClose}>
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
  )
}

export default ComponentDrawer
