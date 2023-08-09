import React, { useContext, useState } from 'react'
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
  Stack,
  Box,
  FormLabel,
  Select,
  Flex,
  Checkbox,
  Text,
  Spacer,
  Divider,
  Tag,
  TagLabel,
  TagCloseButton,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon
} from '@chakra-ui/react'


function ImagesDrawer({ isOpen, onClose, btnRef, activeImageId }) {
  const [product, setProduct] = useState('dashboard-app')
  const [version, setVersion] = useState('')
  const [hasEmail, setHasEmail] = useState(true)
  const [hasTerms, setHasTerms] = useState(true)
  const [hasRedactions, setHasRedactions] = useState(true)
  const [hasLimitAccess, setHasLimitAccess] = useState(true)
  //  shared_with && shared_with.length > 0 ? true : false
  const [hasComponents, setHasComponents] = useState(false)
  const [hasLicenses, setHasLicenses] = useState(true)
  const [hasVul, setHasVul] = useState(true)
  const [hasCyclonDx, setHasCyclonDx] = useState(true)
  const [hasSpdx, setHasSpdx] = useState(true)
  const [isPublic, setIsPublic] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState([])

  const [email, setEmail] = useState('')
  const [emailList, setEmailList] = useState([])

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      setEmailList((prev) => [email, ...prev])
      setEmail('')
    }
  }

  const handleProductChange = (e) => {
    setProduct(e.target.value)
  }

  const handleRemove = (item) => {
    const updatedList = emailList.filter((email) => email !== item)
    setEmailList(updatedList)
  }

  const sbomqsVersions = ['v0.0.1', 'v0.0.2', 'v0.0.3']
  const sbomasmVersion = ['v1.0', 'v1.1', 'v1.2']
  const sbomgrVersion = ['v0.1', 'v0.2', 'v0.3']

  return (
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
        <DrawerHeader borderBottomWidth='1px' color='gray.600'>
          Share Lynk
        </DrawerHeader>

        <DrawerBody>
          <Stack spacing='20px'>
            <Box>
              <FormLabel htmlFor='product' fontSize='sm' color='gray.600'>
                Image name
              </FormLabel>
              <Select id='product' size='sm' color='gray.500'>
                {/* {uniqProjects
                  .sort((a, b) => a.localeCompare(b))
                  .map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))} */}
              </Select>
            </Box>
            <Box>
              <FormLabel htmlFor='version' fontSize='sm' color='gray.600'>
                Tag
              </FormLabel>
              <Select id='version' size='sm' color='gray.500'>
                {activeImageId === 1
                  ? sbomqsVersions.map((p) => (
                      <option key={p} value={p}>
                        {p}+
                      </option>
                    ))
                  : activeImageId == 2
                  ? sbomasmVersion.map((p) => (
                      <option key={p} value={p}>
                        {p}+
                      </option>
                    ))
                  : sbomgrVersion.map((p) => (
                      <option key={p} value={p}>
                        {p}+
                      </option>
                    ))}
              </Select>
            </Box>
            <Box>
              <FormLabel htmlFor='scanners' color='gray.600'>
                Scanners
              </FormLabel>
              <Flex direction={'row'} gap={4}>
                <Checkbox mt={1} size='sm' colorScheme='blue' color='gray.500'>
                  Grype
                </Checkbox>
                <Checkbox mt={1} size='sm' colorScheme='blue' color='gray.500'>
                  Trivy
                </Checkbox>
                <Checkbox mt={1} size='sm' colorScheme='blue' color='gray.500'>
                  Scout
                </Checkbox>
                <Checkbox mt={1} size='sm' colorScheme='blue' color='gray.500'>
                  Snyk
                </Checkbox>
                <Checkbox mt={1} size='sm' colorScheme='blue' color='gray.500'>
                  Custom
                </Checkbox>
              </Flex>
            </Box>
            <Box>
              <Text fontSize='md' mt='20px'>
                LINK OPTIONS
              </Text>
              <Divider />

              <Stack spacing='12px' mt={'12px'}>
                <Text fontSize='sm'>SBOM Access</Text>
                <Text fontSize='xs' color='gray.500'>
                  Control access of SBOM with this link
                </Text>
                <Checkbox
                  isChecked={hasEmail}
                  onChange={(e) => setHasEmail(e.target.checked)}
                  px='10px'
                  mt='10px'
                  size='sm'
                  colorScheme='blue'
                  color='gray.500'
                >
                  Requires email confirmation
                </Checkbox>
                <Checkbox
                  isChecked={hasTerms}
                  onChange={(e) => setHasTerms(e.target.checked)}
                  px='10px'
                  size='sm'
                  colorScheme='blue'
                  color='gray.500'
                >
                  Requires agreeing to terms
                </Checkbox>
                <Checkbox
                  isChecked={hasRedactions}
                  onChange={(e) => setHasRedactions(e.target.checked)}
                  px='10px'
                  size='sm'
                  colorScheme='blue'
                  color='gray.500'
                >
                  Apply redactions
                </Checkbox>
                <Checkbox
                  isChecked={isPublic}
                  onChange={(e) => {
                    setIsPublic(e.target.checked)
                    setHasLimitAccess(false)
                  }}
                  px='10px'
                  size='sm'
                  colorScheme='blue'
                  color='gray.500'
                >
                  Set as public
                </Checkbox>
                <Checkbox
                  isChecked={hasLimitAccess}
                  onChange={(e) => {
                    setHasLimitAccess(e.target.checked)
                    setIsPublic(false)
                  }}
                  px='10px'
                  size='sm'
                  colorScheme='blue'
                  color='gray.500'
                >
                  Limit access to:{' '}
                </Checkbox>

                <Input
                  placeholder='Enter email address'
                  size='sm'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <Flex
                  direction={'row'}
                  alignItems={'start'}
                  gap={3}
                  flexWrap={'wrap'}
                >
                  {emailList.map((item) => (
                    <Tag
                      size='md'
                      key={item}
                      borderRadius='full'
                      colorScheme={'blue'}
                    >
                      <TagLabel>{item}</TagLabel>
                      <TagCloseButton onClick={() => handleRemove(item)} />
                    </Tag>
                  ))}
                </Flex>
                <Spacer />
                <Text fontSize='sm' mt='30px'>
                  SBOM Content
                </Text>
                <Text fontSize='xs' color='gray.500'>
                  Select SBOM content that is required for this link
                </Text>
                <Checkbox
                  readOnly
                  checked={hasComponents}
                  onChange={(e) => setHasComponents(e.target.checked)}
                  px='10px'
                  size='sm'
                  colorScheme='blue'
                  color='gray.500'
                >
                  Components
                </Checkbox>
                <Checkbox
                  isChecked={hasLicenses}
                  onChange={(e) => setHasLicenses(e.target.checked)}
                  px='10px'
                  size='sm'
                  colorScheme='blue'
                  color='gray.500'
                >
                  Licenses
                </Checkbox>
                <Checkbox
                  isChecked={hasVul}
                  onChange={(e) => setHasVul(e.target.checked)}
                  px='10px'
                  size='sm'
                  colorScheme='blue'
                  color='gray.500'
                >
                  Vulnerabilities
                </Checkbox>
              </Stack>
            </Box>
            <Box>
              <Accordion allowMultiple mt={'20px'}>
                <AccordionItem>
                  <AccordionButton>
                    <Flex
                      width={'100%'}
                      alignItems={'center'}
                      justifyContent={'space-between'}
                      direction={'row'}
                    >
                      <Text fontSize='sm'>ADVANCED OPTIONS</Text>
                      <AccordionIcon />
                    </Flex>
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    <Stack spacing='12px' mt={'12px'}>
                      <Text fontSize='sm'>SBOM Format</Text>
                      <Text fontSize='xs' color='gray.500'>
                        Select SBOM format supported by this link
                      </Text>
                      <Checkbox
                        isChecked={hasCyclonDx}
                        onChange={(e) => setHasCyclonDx(e.target.checked)}
                        px='10px'
                        mt='10px'
                        size='sm'
                        colorScheme='blue'
                        color='gray.500'
                      >
                        CycloneDX
                      </Checkbox>
                      <Checkbox
                        isChecked={hasSpdx}
                        onChange={(e) => setHasSpdx(e.target.checked)}
                        px='10px'
                        size='sm'
                        colorScheme='blue'
                        color='gray.500'
                      >
                        SPDX
                      </Checkbox>
                    </Stack>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </Box>
          </Stack>
        </DrawerBody>

        <DrawerFooter>
          <Button variant='outline' mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme='blue'>Save</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default ImagesDrawer
