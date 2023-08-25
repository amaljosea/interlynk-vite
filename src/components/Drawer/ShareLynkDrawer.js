import {
  Flex,
  Button,
  Input,
  Spacer,
  Stack,
  FormControl,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  FormLabel,
  Checkbox,
  Divider,
  Text,
  Tag,
  TagLabel,
  TagCloseButton
} from '@chakra-ui/react'
import { useContext, useEffect, useState } from 'react'
import GlobalContext from 'context/GlobalContext'
import { v4 as uuidv4 } from 'uuid'

function ShareLynkDrawer(props) {
  const { setSBOMLinksData, productVersionsData } = useContext(GlobalContext)
  const { isOpen, onClose, btnRef, productName, versionName } = props

  const [product, setProduct] = useState(productName)
  const [version, setVersion] = useState(versionName)
  const [hasEmail, setHasEmail] = useState(true)
  const [hasTerms, setHasTerms] = useState(true)
  const [hasRedactions, setHasRedactions] = useState(true)
  const [hasLimitAccess, setHasLimitAccess] = useState(true)
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
          Share Lynk
        </DrawerHeader>
        <DrawerBody>
          <Stack spacing='12px'>
            {/* product */}
            <FormControl>
              <FormLabel htmlFor='product' fontSize='sm' color='gray.600'>
                Product
              </FormLabel>
              <Input
                type='text'
                id='product'
                value={product}
                onChange={handleProductChange}
                size='sm'
                color='gray.500'
              />
            </FormControl>
            {/* version */}
            <FormControl>
              <FormLabel htmlFor='product' fontSize='sm' color='gray.600'>
                Version
              </FormLabel>
              <Input
                id='version'
                value={version}
                onChange={(e) => {
                  setVersion(e.target.value)
                }}
                size='sm'
                color='gray.500'
              />
            </FormControl>
            <Spacer />
            <Text fontSize='md'>LINK OPTIONS</Text>
            <Divider />
            <Stack spacing='12px'>
              <Text fontSize='sm'>SBOM Access</Text>
              <Text fontSize='xs' color='gray.500'>
                Control access of SBOM with this link
              </Text>
              <Checkbox
                isChecked={hasEmail}
                onChange={(e) => setHasEmail(e.target.checked)}
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
                size='sm'
                colorScheme='blue'
                color='gray.500'
              >
                Requires agreeing to terms
              </Checkbox>
              <Checkbox
                isChecked={hasRedactions}
                onChange={(e) => setHasRedactions(e.target.checked)}
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
              <Text fontSize='sm'>SBOM Content</Text>
              <Text fontSize='xs' color='gray.500'>
                Select SBOM content that is required for this link
              </Text>
              <Checkbox
                defaultChecked
                readOnly
                size='sm'
                colorScheme='blue'
                color='gray.500'
              >
                Components
              </Checkbox>
              <Checkbox
                isChecked={hasLicenses}
                onChange={(e) => setHasLicenses(e.target.checked)}
                size='sm'
                colorScheme='blue'
                color='gray.500'
              >
                Licenses
              </Checkbox>
              <Checkbox
                isChecked={hasVul}
                onChange={(e) => setHasVul(e.target.checked)}
                size='sm'
                colorScheme='blue'
                color='gray.500'
              >
                Vulnerabilities
              </Checkbox>
            </Stack>
            <Spacer />
            <Text fontSize='md' mt='20px'>
              ADVANCED OPTIONS
            </Text>
            <Divider />
            <Stack spacing='12px'>
              <Text fontSize='sm'>SBOM Format</Text>
              <Text fontSize='xs' color='gray.500'>
                Select SBOM format supported by this link
              </Text>
              <Checkbox
                isChecked={hasCyclonDx}
                onChange={(e) => setHasCyclonDx(e.target.checked)}
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
                size='sm'
                colorScheme='blue'
                color='gray.500'
              >
                SPDX
              </Checkbox>
            </Stack>
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

export default ShareLynkDrawer
