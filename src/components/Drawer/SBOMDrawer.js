// Chakra imports
import {
  Flex,
  Button,
  Input,
  Spacer,
  Stack,
  useConst,
  filter
} from '@chakra-ui/react'
import React, { useState } from 'react'
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Box,
  FormLabel,
  InputGroup,
  Select,
  Checkbox,
  Divider,
  Text,
  Tag,
  TagLabel,
  TagCloseButton
} from '@chakra-ui/react'
import { useContext } from 'react'
import GlobalContext from 'context/GlobalContext'
import { v4 as uuidv4 } from 'uuid'
import { useEffect } from 'react'

function SBOMDrawer(props) {
  const { setSBOMLinksData, productVersionsData } = useContext(
    GlobalContext
  )

  const imageName = window.localStorage.getItem('Image')

  const sbomqsVersions = ['v0.0.1', 'v0.0.2', 'v0.0.3']
  const sbomasmVersion = ['v1.0', 'v1.1', 'v1.2']
  const sbomgrVersion = ['v0.1', 'v0.2', 'v0.3']

  const { isOpen, onClose, btnRef, uniqProjects, uniqVersions } = props

  const [product, setProduct] = useState('dashboard-app')
  const [version, setVersion] = useState('')
  const [hasEmail, setHasEmail] = useState(true)
  const [hasTerms, setHasTerms] = useState(true)
  const [hasRedactions, setHasRedactions] = useState(true)
  const [hasLimitAccess, setHasLimitAccess] = useState(true)
  //  shared_with && shared_with.length > 0 ? true : false
  // const [hasComponents, setHasComponents] = useState(true)
  const [hasLicenses, setHasLicenses] = useState(true)
  const [hasVul, setHasVul] = useState(false)
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

  useEffect(() => {
    const filterProduct = productVersionsData.filter(
      (project) => project.name === product
    )

    // console.log('filterProduct', filterProduct)

    const uniqVersion = []
    filterProduct.map((project) => {
      project.versions.map((version) => {
        uniqVersion.push(version.version)
      })
    })

    // console.log('uniqVersion', uniqVersion)
    setSelectedVersion(uniqVersion)
  }, [product])

  const handleSave = () => {
    setSBOMLinksData((prev) => [
      {
        id: uuidv4(),
        link: 'https://dashboard-app.fly.dev/#/admin/dashboard/sbom/z55E8gz3FN',
        shared_with: emailList,
        created: new Date().toISOString(),
        visits: 0,
        active: true,
        project: product,
        version: version,
        conf_email: hasEmail,
        conf_terms: hasTerms,
        redactions: hasRedactions,
        components: true,
        licenses: hasLicenses,
        vulnerabilities: hasVul,
        cyclonedx: hasCyclonDx,
        spdx: hasSpdx
      },
      ...prev
    ])

    setProduct('')
    setVersion('')
    setIsPublic(false)
    setHasLimitAccess(true)
    setHasVul(false)
    setEmail('')
    setEmailList([])
    onClose()
  }

  const handleRemove = (item) => {
    const updatedList = emailList.filter((email) => email !== item)
    setEmailList(updatedList)
  }

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
          Share Link
        </DrawerHeader>
        <DrawerBody>
          <Stack spacing='24px'>
            <Box>
              <FormLabel htmlFor='product' fontSize='sm' color='gray.600'>
                Image
              </FormLabel>
              <Input
                defaultValue={imageName ? imageName : ''}
                readOnly
                fontSize={'sm'}
                mb={4}
              />
              {/* <Select
                id='product'
                value={product}
                onChange={handleProductChange}
                size='sm'
                color='gray.500'
              >
                {uniqProjects
                  .sort((a, b) => a.localeCompare(b))
                  .map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
              </Select> */}
              <FormLabel htmlFor='product' fontSize='sm' color='gray.600'>
                Tags
              </FormLabel>
              <Select
                id='version'
                value={version}
                onChange={(e) => {
                  setVersion(e.target.value)
                }}
                size='sm'
                color='gray.500'
                mb={4}
              >
                {sbomqsVersions.length > 0 ? (
                  sbomqsVersions.map((p) => (
                    <option key={p} value={p}>
                      {p}+
                    </option>
                  ))
                ) : (
                  <option value='No version found'>No version found</option>
                )}
              </Select>
              <Box>
                <FormLabel htmlFor='scanners' fontSize={'sm'} color='gray.600'>
                  Scanners
                </FormLabel>
                <Flex direction={'row'} gap={4}>
                  <Checkbox size='sm' colorScheme='blue' color='gray.500'>
                    Grype
                  </Checkbox>
                  <Checkbox size='sm' colorScheme='blue' color='gray.500'>
                    Trivy
                  </Checkbox>
                  <Checkbox size='sm' colorScheme='blue' color='gray.500'>
                    Scout
                  </Checkbox>
                  <Checkbox size='sm' colorScheme='blue' color='gray.500'>
                    Snyk
                  </Checkbox>
                </Flex>
              </Box>
              <Text fontSize='md' mt='20px'>
                LINK OPTIONS
              </Text>
              <Divider />
              <Spacer />
              <Stack spacing='12px'>
                <Text fontSize='sm' mt='20px'>
                  SBOM Access
                </Text>
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
                {/* <Checkbox
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
                </Checkbox> */}
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
              </Stack>
              {/* <Text fontSize='sm' mt='30px'>
                  SBOM Content
                </Text>
                <Text fontSize='xs' color='gray.500'>
                  Select SBOM content that is required for this link
                </Text>
                <Checkbox
                  defaultChecked
                  readOnly
                  // onChange={(e) => setHasComponents(e.target.checked)}
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
              <Text fontSize='md' mt='20px'>
                ADVANCED OPTIONS
              </Text>
              <Divider />
              <Stack spacing='12px'>
                <Text fontSize='sm' mt='20px'>
                  SBOM Format
                </Text>
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
              </Stack> */}
            </Box>
          </Stack>
        </DrawerBody>
        <DrawerFooter borderTopWidth='1px'>
          <Button variant='outline' mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme='blue' onClick={handleSave}>
            Save
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default SBOMDrawer
