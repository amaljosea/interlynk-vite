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
  Heading,
  Tag,
  TagLabel,
  TagCloseButton,
  Code,
  Text,
  FormLabel,
  FormControl
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'

const GeneralDataDrawer = ({
  isOpen,
  onClose,
  btnRef,
  data,
  selectedKey,
  setGeneralData
}) => {
  const {
    createdAt,
    lastUpdatedAt,
    authors,
    orgs,
    emails,
    supplierName,
    product,
    license,
    cpe,
    purl,
    swid,
    md5,
    sha
  } = data

  const [authorName, setAuthorName] = useState('')
  const [orgName, setOrgName] = useState('')
  const [authorEmail, setAuthorEmail] = useState('')

  const [emailList, setEmailList] = useState([])

  const [supplier, setSupplier] = useState('')
  const [supplierProduct, setSupplierProduct] = useState('')

  const [licenseName, setLicenseName] = useState('')
  const [cpeValue, setCpeValue] = useState('')
  const [purlValue, setPurlValue] = useState('')
  const [swidValue, setSwidValue] = useState('')
  const [MD5Value, setMD5Value] = useState('')
  const [shaValue, setShaValue] = useState('')

  useEffect(() => {
    setAuthorName(authors)
    setOrgName(orgs)
    setEmailList(emails)
    setSupplier(supplierName)
    setSupplierProduct(product)
    setLicenseName(license)
    setCpeValue(cpe)
    setPurlValue(purl)
    setSwidValue(swid)
    setMD5Value(md5)
    setShaValue(sha)
  }, [data])

  const onEmailKeyDown = (event) => {
    if (event.key === 'Enter') {
      setEmailList((prev) => [...prev, authorEmail])
      setAuthorEmail('')
    }
  }

  const onEmailRemove = (item) => {
    const updatedList = emailList.filter((email) => email !== item)
    setEmailList(updatedList)
  }

  const handleAuthorSave = () => {
    const result = { ...data }
    if (authorName) {
      result.authors = authorName
    }
    if (emailList) {
      result.emails = emailList
    }
    if (orgName) {
      result.orgs = orgName
    }
    if (supplier) {
      result.supplierName = supplier
    }
    if (supplierProduct) {
      result.product = supplierProduct
    }
    if (licenseName) {
      result.license = licenseName
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
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Update</DrawerHeader>

          <DrawerBody>
            {selectedKey === 'author' && (
              <Flex direction={'column'} alignItems={'flex-start'} gap={3}>
                <Input
                  size='sm'
                  placeholder='Name'
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                />

                <Input
                  size='sm'
                  placeholder='Organization'
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />

                <Input
                  size='sm'
                  placeholder='Emails'
                  value={authorEmail}
                  onChange={(e) => setAuthorEmail(e.target.value)}
                  onKeyDown={onEmailKeyDown}
                />

                <Text fontSize={'xs'}>
                  Press <Code colorScheme={'blue'}>enter</Code> to add multiple
                  values
                </Text>

                <Flex
                  direction={'row'}
                  alignItems={'start'}
                  gap={3}
                  flexWrap={'wrap'}
                >
                  {emailList.length > 0 &&
                    emailList.map((item) => (
                      <Tag
                        size='sm'
                        key={item}
                        borderRadius='full'
                        colorScheme={'green'}
                      >
                        <TagLabel>{item}</TagLabel>
                        {emailList.length > 1 && (
                          <TagCloseButton onClick={() => onEmailRemove(item)} />
                        )}
                      </Tag>
                    ))}
                </Flex>
              </Flex>
            )}

            {selectedKey === 'supplier' && (
              <Flex direction={'column'} alignItems={'flex-start'} gap={3}>
                <FormControl>
                  <FormLabel>Supplier Name</FormLabel>
                  <Input
                    size='sm'
                    placeholder='Name'
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Product</FormLabel>
                  <Input
                    size='sm'
                    placeholder='Product'
                    value={supplierProduct}
                    onChange={(e) => setSupplierProduct(e.target.value)}
                  />
                </FormControl>
              </Flex>
            )}

            {selectedKey === 'license' && (
              <Flex direction={'column'} alignItems={'flex-start'} gap={3}>
                <FormControl>
                  <FormLabel>License</FormLabel>
                  <Input
                    size='sm'
                    placeholder='Add your license name'
                    value={licenseName}
                    onChange={(e) => setLicenseName(e.target.value)}
                  />
                </FormControl>
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
