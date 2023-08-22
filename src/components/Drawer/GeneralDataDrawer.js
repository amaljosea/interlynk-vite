import { DeleteIcon } from '@chakra-ui/icons'
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Input,
  Button,
  Flex,
  Text,
  FormLabel,
  FormControl,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Table,
  Icon,
  Select
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'

const GeneralDataDrawer = ({
  isOpen,
  onClose,
  btnRef,
  data,
  selectedKey,
  setGeneralData,
  authors,
  setAuthors,
  suppliers,
  setSuppliers,
  tools,
  setTools,
  license,
  setLicense
}) => {
  const { cpes, purl, swid, md5, sha } = data

  const [toolName, setToolName] = useState('')
  const [toolVersion, setToolVersion] = useState('')
  const [toolVendor, setToolVendor] = useState('')

  const [authorName, setAuthorName] = useState('')
  const [orgName, setOrgName] = useState('')
  const [authorEmail, setAuthorEmail] = useState('')

  const [supName, setSupName] = useState('')
  const [supEmail, setSupEmail] = useState('')
  const [supOrg, setSupOrg] = useState('')

  const [licenseName, setLicenseName] = useState('')
  const [selectedLicense, setSelectedLicense] = useState('')
  const [cpeValue, setCpeValue] = useState('')
  const [purlValue, setPurlValue] = useState('')
  const [swidValue, setSwidValue] = useState('')
  const [MD5Value, setMD5Value] = useState('')
  const [shaValue, setShaValue] = useState('')

  const [creationTools, setCreationTools] = useState([])
  const [authorList, setAuthorList] = useState([])
  const [supplierList, setSupplierList] = useState([])
  const [licenseList, setLicenseList] = useState([])

  useEffect(() => {
    setCreationTools(tools)
    setSupplierList(suppliers)
    setAuthorList(authors)
    setLicenseList(license)
    if (cpes.length > 0) {
      setCpeValue(cpes[0])
    }
    setPurlValue(purl)
    setSwidValue(swid)
  }, [data])

  const handleAuthorAdd = () => {
    if (authorName || authorEmail || orgName) {
      setAuthorList((prev) => [
        {
          name: authorName,
          email: authorEmail,
          organization: orgName
        },
        ...prev
      ])
      setAuthorName('')
      setAuthorEmail('')
      setOrgName('')
    } else {
      alert(`Please add atleast one value`)
    }
  }

  const handleAuthorRemove = (author) => {
    const updatedList = authorList.filter((item) => item.name !== author.name)
    setAuthorList(updatedList)
  }

  const handleSupAdd = () => {
    if (supName || supEmail || supOrg) {
      setSupplierList((prev) => [
        {
          name: supName,
          email: supEmail,
          organization: supOrg
        },
        ...prev
      ])
      setSupName('')
      setSupEmail('')
      setSupOrg('')
    } else {
      alert(`Please add atleast one value`)
    }
  }

  const handleSupRemove = (supplier) => {
    const updatedList = supplierList.filter(
      (item) => item.name !== supplier.name
    )
    setSupplierList(updatedList)
  }

  const handleToolAdd = () => {
    if ((toolName && toolVersion) || toolVendor) {
      setCreationTools((prev) => [
        {
          name: toolName,
          version: toolVersion,
          vendor: toolVendor
        },
        ...prev
      ])
      setToolName('')
      setToolVersion('')
      setToolVendor('')
    } else {
      alert(`Please fill up required fields`)
    }
  }

  const handleToolRemove = (tool) => {
    const updatedList = creationTools.filter((item) => item.name !== tool.name)
    setCreationTools(updatedList)
  }

  const onLicenselAdd = () => {
    if (licenseName !== '' || selectedLicense !== '') {
      setLicenseList((prev) => [
        {
          name:
            selectedLicense && selectedLicense !== 'Custom'
              ? selectedLicense
              : licenseName
        },
        ...prev
      ])
      setLicenseName('')
      setSelectedLicense('')
    } else {
      alert(`Please fill up required fields`)
    }
  }

  const onLicenselRemove = (ls) => {
    const updatedList = licenseList.filter((item) => item.name !== ls.name)
    setLicenseList(updatedList)
  }

  const handleSave = () => {
    const result = { ...data }
    if (creationTools) {
      setTools(creationTools)
    }
    if (authorList) {
      setAuthors(authorList)
    }
    if (supplierList) {
      setSuppliers(supplierList)
    }
    if (licenseList) {
      setLicense(licenseList)
    }
    if (cpeValue) {
      result.cpe = cpeValue
    }
    if (purlValue) {
      result.purl = purlValue
    }
    if (swidValue) {
      result.swid = swidValue
    }
    setGeneralData(result)
    onClose()
  }

  const heading = (name) => {
    switch (name) {
      case 'tools':
        return 'Creation Tool(s)'
      case 'author':
        return 'Author(s)'
      case 'supplier':
        return 'Supplier(s)'
      case 'license':
        return 'License'
      case 'identifier':
        return 'Identifier(s)'
    }
  }

  return (
    <>
      <Drawer
        isOpen={isOpen}
        placement='right'
        onClose={onClose}
        finalFocusRef={btnRef}
        size='md'
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{heading(selectedKey)}</DrawerHeader>

          <DrawerBody>
            {selectedKey === 'tools' && (
              <Flex direction={'column'} alignItems={'flex-start'} gap={3}>
                <Input
                  placeholder='Tool name'
                  value={toolName}
                  onChange={(e) => setToolName(e.target.value)}
                />

                <Input
                  placeholder='Version'
                  value={toolVersion}
                  onChange={(e) => setToolVersion(e.target.value)}
                />

                <Input
                  placeholder='Vendor'
                  value={toolVendor}
                  onChange={(e) => setToolVendor(e.target.value)}
                />

                <Button colorScheme='blue' onClick={handleToolAdd}>
                  Add
                </Button>

                <Flex width={'100%'} flexDir={'column'}>
                  <Text size='md' my={2}>
                    Tool History
                  </Text>
                  {creationTools.length > 0 ? (
                    <Table variant='simple' size='sm' mt={4}>
                      <Thead>
                        <Tr my='.8rem'>
                          <Th pl={0}>Name</Th>
                          <Th pl={0}>Version</Th>
                          <Th pl={0}>Vendor</Th>
                          <Th pl={0}></Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {creationTools.map((item, index) => (
                          <Tr key={index}>
                            <Td pl={0} fontSize={'sm'}>
                              {item.name}
                            </Td>
                            <Td pl={0} fontSize={'sm'}>
                              {item.version}
                            </Td>
                            <Td pl={0} fontSize={'sm'}>
                              {item.vendor ? item.vendor : 'Interlynk Inc'}
                            </Td>
                            <Td>
                              <Icon
                                as={DeleteIcon}
                                color={'red'}
                                cursor={'pointer'}
                                onClick={() => handleToolRemove(item)}
                              />
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  ) : (
                    <Text mt={4} color={'darkgrey'}>
                      No author found
                    </Text>
                  )}
                </Flex>
              </Flex>
            )}

            {selectedKey === 'author' && (
              <Flex direction={'column'} alignItems={'flex-start'} gap={3}>
                <Input
                  placeholder='Name'
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                />

                <Input
                  placeholder='Email'
                  value={authorEmail}
                  onChange={(e) => setAuthorEmail(e.target.value)}
                />

                <Input
                  placeholder='Organization'
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />

                <Button colorScheme='blue' onClick={handleAuthorAdd}>
                  Add
                </Button>

                <Flex width={'100%'} flexDir={'column'}>
                  <Text size='md' my={2}>
                    Author History
                  </Text>
                  {authorList.length > 0 ? (
                    <Table variant='simple' size='sm' mt={4}>
                      <Thead>
                        <Tr my='.8rem'>
                          <Th pl={0}>Name</Th>
                          <Th pl={0}>Email</Th>
                          <Th pl={0}>Organization</Th>
                          <Th pl={0}></Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {authorList.map((item, index) => (
                          <Tr key={index}>
                            <Td pl={0} fontSize={'sm'}>
                              {item.name}
                            </Td>
                            <Td pl={0} fontSize={'sm'}>
                              {item.email}
                            </Td>
                            <Td pl={0} fontSize={'sm'}>
                              {item.organization}
                            </Td>
                            <Td>
                              <Icon
                                as={DeleteIcon}
                                color={'red'}
                                cursor={'pointer'}
                                onClick={() => handleAuthorRemove(item)}
                              />
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  ) : (
                    <Text mt={4} color={'darkgrey'}>
                      No author found
                    </Text>
                  )}
                </Flex>
              </Flex>
            )}

            {selectedKey === 'supplier' && (
              <Flex direction={'column'} alignItems={'flex-start'} gap={3}>
                <FormControl>
                  <Input
                    placeholder='Name'
                    value={supName}
                    onChange={(e) => setSupName(e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <Input
                    placeholder='Email'
                    value={supEmail}
                    onChange={(e) => setSupEmail(e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <Input
                    placeholder='Organization'
                    value={supOrg}
                    onChange={(e) => setSupOrg(e.target.value)}
                  />
                </FormControl>

                <Button colorScheme='blue' onClick={handleSupAdd}>
                  Add
                </Button>

                <Flex width={'100%'} flexDir={'column'}>
                  <Text size='md' my={2}>
                    Supplier History
                  </Text>
                  {supplierList.length > 0 ? (
                    <Table variant='simple' size='sm' mt={4}>
                      <Thead>
                        <Tr my='.8rem'>
                          <Th pl={0}>Name</Th>
                          <Th pl={0}>Email</Th>
                          <Th pl={0}>Organization</Th>
                          <Th pl={0}></Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {supplierList.map((item, index) => (
                          <Tr key={index}>
                            <Td pl={0} fontSize={'sm'}>
                              {item.name}
                            </Td>
                            <Td pl={0} fontSize={'sm'}>
                              {item.email}
                            </Td>
                            <Td pl={0} fontSize={'sm'}>
                              {item.organization}
                            </Td>
                            <Td>
                              <Icon
                                as={DeleteIcon}
                                color={'red'}
                                cursor={'pointer'}
                                onClick={() => handleSupRemove(item)}
                              />
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  ) : (
                    <Text mt={4} color={'darkgrey'}>
                      No author found
                    </Text>
                  )}
                </Flex>
              </Flex>
            )}

            {selectedKey === 'license' && (
              <Flex direction={'column'} alignItems={'flex-start'} gap={3}>
                <FormControl>
                  <Select
                    isDisabled={licenseName !== ''}
                    name='license'
                    id='license'
                    value={selectedLicense}
                    onChange={(e) => setSelectedLicense(e.target.value)}
                  >
                    <option value={''}>-- Select --</option>
                    <option value={'Custom'}>Custom</option>
                    <option value='AGPL-1.0-Only'>AGPL-1.0-Only</option>
                    <option value='AGPL-2.0-Only'>AGPL-2.0-Only</option>
                    <option value='MIT'>MIT</option>
                    <option value='BSD'>BSD</option>
                    <option value='LGPL-2.0'>LGPL-2.0</option>
                  </Select>
                </FormControl>
                {selectedLicense === 'Custom' && (
                  <FormControl>
                    <Input
                      placeholder='Enter a valid SPDX license'
                      value={licenseName}
                      onChange={(e) => setLicenseName(e.target.value)}
                    />
                  </FormControl>
                )}
                <Button colorScheme='blue' onClick={onLicenselAdd}>
                  Add
                </Button>

                <Flex width={'100%'} flexDir={'column'}>
                  <Text size='md' my={2}>
                    License History
                  </Text>
                  {licenseList.length > 0 ? (
                    <Table variant='simple' size='sm' mt={4}>
                      <Thead>
                        <Tr my='.8rem'>
                          <Th pl={0}>Name</Th>
                          <Th pl={0}></Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {licenseList.map((item, index) => (
                          <Tr key={index}>
                            <Td pl={0} fontSize={'sm'}>
                              {item.name}
                            </Td>
                            <Td>
                              <Icon
                                as={DeleteIcon}
                                color={'red'}
                                cursor={'pointer'}
                                onClick={() => onLicenselRemove(item)}
                              />
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  ) : (
                    <Text mt={4} color={'darkgrey'}>
                      No author found
                    </Text>
                  )}
                </Flex>
              </Flex>
            )}

            {selectedKey === 'identifier' && (
              <Flex direction={'column'} alignItems={'flex-start'} gap={3}>
                <FormControl>
                  <Input
                    size='sm'
                    placeholder='CPE'
                    value={cpeValue}
                    onChange={(e) => setCpeValue(e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <Input
                    size='sm'
                    placeholder='PURL'
                    value={purlValue}
                    onChange={(e) => setPurlValue(e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <Input
                    size='sm'
                    placeholder='SWID'
                    value={swidValue}
                    onChange={(e) => setSwidValue(e.target.value)}
                  />
                </FormControl>
              </Flex>
            )}

            {/* {selectedKey === 'hashes' && (
              <Flex direction={'column'} alignItems={'flex-start'} gap={3}>
                <FormControl>
                  <FormLabel>MD5</FormLabel>
                  <Input
                    size='sm'
                    placeholder='Ex. ABCDEFGHI'
                    value={MD5Value}
                    onChange={(e) => setMD5Value(e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>SHA</FormLabel>
                  <Input
                    size='sm'
                    placeholder='Ex. 23434354443'
                    value={shaValue}
                    onChange={(e) => setShaValue(e.target.value)}
                  />
                </FormControl>
              </Flex>
            )} */}
          </DrawerBody>

          <DrawerFooter>
            <Button variant='outline' mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme='blue' onClick={handleSave}>
              Save
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default GeneralDataDrawer
