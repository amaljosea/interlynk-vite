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
  const { cpe, purl, swid, md5, sha } = data

  const [toolName, setToolName] = useState('')
  const [toolVersion, setToolVersion] = useState('')
  const [toolVendor, setToolVendor] = useState('')

  const [authorName, setAuthorName] = useState('')
  const [orgName, setOrgName] = useState('')
  const [authorEmail, setAuthorEmail] = useState('')

  const [supplier, setSupplier] = useState('')
  const [supplierProduct, setSupplierProduct] = useState('')

  const [licenseName, setLicenseName] = useState('')
  const [selectedLicense, setSelectedLicense] = useState('')
  const [cpeValue, setCpeValue] = useState('')
  const [purlValue, setPurlValue] = useState('')
  const [swidValue, setSwidValue] = useState('')
  const [MD5Value, setMD5Value] = useState('')
  const [shaValue, setShaValue] = useState('')

  useEffect(() => {
    setCpeValue(cpe)
    setPurlValue(purl)
    setSwidValue(swid)
    setMD5Value(md5)
    setShaValue(sha)

    console.log('data')
  }, [data])

  const handleAuthorAdd = () => {
    if (authorName || authorEmail || orgName) {
      setAuthors((prev) => [
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
    const updatedList = authors.filter((item) => item.name !== author.name)
    setAuthors(updatedList)
  }

  const handleSupAdd = () => {
    if (supplier || supplierProduct) {
      setSuppliers((prev) => [
        {
          name: supplier,
          product: supplierProduct
        },
        ...prev
      ])
      setSupplier('')
      setSupplierProduct('')
    } else {
      alert(`Please add atleast one value`)
    }
  }

  const handleSupRemove = (supplier) => {
    const updatedList = suppliers.filter((item) => item.name !== supplier.name)
    setSuppliers(updatedList)
  }

  const handleToolAdd = () => {
    if ((toolName && toolVersion)) {
      setTools((prev) => [
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
      alert(`Tool Name and Tool Version are required`)
    }
  }

  const handleToolRemove = (tool) => {
    const updatedList = tools.filter((item) => item.name !== tool.name)
    setTools(updatedList)
  }

  const onLicenselAdd = () => {
    if (licenseName !== '' || selectedLicense !== '') {
      setLicense((prev) => [
        {
          name: selectedLicense ? selectedLicense : licenseName
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
    const updatedList = license.filter((item) => item.name !== ls.name)
    setLicense(updatedList)
  }

  const handleAuthorSave = () => {
    const result = { ...data }
    if (cpeValue) {
      result.cpe = cpeValue
    }
    if (purlValue) {
      result.purl = purlValue
    }
    if (swidValue) {
      result.swid = swidValue
    }
    if (MD5Value) {
      result.md5 = MD5Value
    }
    if (shaValue) {
      result.sha = shaValue
    }
    setGeneralData(result)
    onClose()
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
          <DrawerHeader>Creation Tool(s)</DrawerHeader>

          <DrawerBody>
            {selectedKey === 'tools' && (
              <Flex direction={'column'} alignItems={'flex-start'} gap={3}>
                <Input
                  placeholder='Tool Name*'
                  value={toolName}
                  onChange={(e) => setToolName(e.target.value)}
                />

                <Input
                  placeholder='Tool Version*'
                  value={toolVersion}
                  onChange={(e) => setToolVersion(e.target.value)}
                />

                <Input
                  placeholder='Vendor Name'
                  value={toolVendor}
                  onChange={(e) => setToolVendor(e.target.value)}
                />

                <Button colorScheme='blue' onClick={handleToolAdd}>
                  Add
                </Button>

                <Flex width={'100%'} flexDir={'column'}>
                  {tools.length > 0 ? (
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
                        {tools.map((item, index) => (
                          <Tr key={index}>
                            <Td pl={0} fontSize={'sm'}>
                              {item.name}
                            </Td>
                            <Td pl={0} fontSize={'sm'}>
                              {item.version}
                            </Td>
                            <Td pl={0} fontSize={'sm'}>
                              {item.vendor}
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
                      No creation tool specified
                    </Text>
                  )}
                </Flex>
              </Flex>
            )}

            {selectedKey === 'author' && (
              <Flex direction={'column'} alignItems={'flex-start'} gap={3}>
                <Input
                  placeholder='Author Name*'
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                />

                <Input
                  placeholder='Author Email*'
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
                  {authors.length > 0 ? (
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
                        {authors.map((item, index) => (
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
                  <FormLabel>Supplier Name</FormLabel>
                  <Input
                    placeholder='Name'
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Product</FormLabel>
                  <Input
                    placeholder='Product'
                    value={supplierProduct}
                    onChange={(e) => setSupplierProduct(e.target.value)}
                  />
                </FormControl>

                <Button colorScheme='blue' onClick={handleSupAdd}>
                  Add
                </Button>

                <Flex width={'100%'} flexDir={'column'}>
                  <Text size='md' my={2}>
                    Supplier History
                  </Text>
                  {suppliers.length > 0 ? (
                    <Table variant='simple' size='sm' mt={4}>
                      <Thead>
                        <Tr my='.8rem'>
                          <Th pl={0}>Name</Th>
                          <Th pl={0}>Product</Th>
                          <Th pl={0}></Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {suppliers.map((item, index) => (
                          <Tr key={index}>
                            <Td pl={0} fontSize={'sm'}>
                              {item.name}
                            </Td>
                            <Td pl={0} fontSize={'sm'}>
                              {item.product}
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
                  <FormLabel>License</FormLabel>
                  <Select
                    isDisabled={licenseName !== ''}
                    name='license'
                    id='license'
                    value={selectedLicense}
                    onChange={(e) => setSelectedLicense(e.target.value)}
                  >
                    <option value={''}>-- Select --</option>
                    <option value='AGPL-1.0-Only'>AGPL-1.0-Only</option>
                    <option value='AGPL-2.0-Only'>AGPL-2.0-Only</option>
                    <option value='MIT'>MIT</option>
                    <option value='BSD'>BSD</option>
                    <option value='LGPL-2.0'>LGPL-2.0</option>
                  </Select>
                </FormControl>
                <FormControl isDisabled={selectedLicense !== ''}>
                  <FormLabel>Or</FormLabel>
                  <Input
                    placeholder='Enter a valid SPDX license expression'
                    value={licenseName}
                    onChange={(e) => setLicenseName(e.target.value)}
                  />
                </FormControl>
                <Button colorScheme='blue' onClick={onLicenselAdd}>
                  Add
                </Button>

                <Flex width={'100%'} flexDir={'column'}>
                  {license.length > 0 ? (
                    <Table variant='simple' size='sm' mt={4}>
                      <Thead>
                        <Tr my='.8rem'>
                          <Th pl={0}>Name</Th>
                          <Th pl={0}></Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {license.map((item, index) => (
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
                  <FormLabel>CPE</FormLabel>
                  <Input
                    size='sm'
                    placeholder='Ex. CPEXYZ123'
                    value={cpeValue}
                    onChange={(e) => setCpeValue(e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>PURL</FormLabel>
                  <Input
                    size='sm'
                    placeholder='Ex. PURLABCDEF'
                    value={purlValue}
                    onChange={(e) => setPurlValue(e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>SWID</FormLabel>
                  <Input
                    size='sm'
                    placeholder='Ex. SWID3556411'
                    value={swidValue}
                    onChange={(e) => setSwidValue(e.target.value)}
                  />
                </FormControl>
              </Flex>
            )}

            {selectedKey === 'hashes' && (
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
            )}
          </DrawerBody>

          <DrawerFooter>
            <Button variant='outline' mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme='blue' onClick={handleAuthorSave}>
              Save
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default GeneralDataDrawer
