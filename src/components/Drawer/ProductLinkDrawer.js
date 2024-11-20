import React, { useState } from 'react'

import { Button, Flex, Input, Spacer, Stack } from '@chakra-ui/react'
import {
  Box,
  Checkbox,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormLabel,
  Tag,
  TagCloseButton,
  TagLabel,
  Text
} from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

function ProductLinkDrawer(props) {
  const {
    isOpen,
    onClose,
    btnRef,
    uniqProjects,
    uniqVersions,
    name,
    shared_with,
    conf_email,
    conf_terms,
    components,
    licenses,
    vulnerability,
    cyclonedx,
    spdx,
    productName,
    versionName,
    redactions
  } = props
  // const handleChange = (event) => setValue(event.target.value)

  const [hasEmail, setHasEmail] = useState(conf_email)
  const [hasTerms, setHasTerms] = useState(conf_terms)
  const [hasRedactions, setHasRedactions] = useState(redactions)
  const [hasLimitAccess, setHasLimitAccess] = useState(true)
  //  shared_with && shared_with.length > 0 ? true : false
  const [hasComponents, setHasComponents] = useState(components)
  const [hasLicenses, setHasLicenses] = useState(licenses)
  const [hasVul, setHasVul] = useState(vulnerability)
  const [hasCyclonDx, setHasCyclonDx] = useState(cyclonedx)
  const [hasSpdx, setHasSpdx] = useState(spdx)
  const [isPublic, setIsPublic] = useState(false)
  const [email, setEmail] = useState('')
  const [emailList, setEmailList] = useState([])
  const [product, setProduct] = useState(productName)
  const [version, setVersion] = useState(versionName)

  const {
    primaryBlueText,
    sameSecondaryText,
    headingTextColor,
    primaryBgColor
  } = useThemeColor([
    'primaryBlueText',
    'sameSecondaryText',
    'headingTextColor',
    'primaryBgColor'
  ])

  const handleProductChange = (e) => {
    setProduct(e.target.value)
  }

  const handleKeyDown = () => {
    if (event.key === 'Enter') {
      setEmailList((prev) => [email, ...prev])
      setEmail('')
    }
  }

  return (
    <Drawer isOpen={isOpen} placement='right' onClose={onClose} size='lg'>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth='1px'>Share Link</DrawerHeader>
        <DrawerBody>
          <Stack spacing='24px'>
            <Box>
              <FormLabel
                py='4px'
                htmlFor='product'
                fontSize='sm'
                color={headingTextColor}
              >
                Product
              </FormLabel>
              <Input
                id='product'
                size='sm'
                color={sameSecondaryText}
                value={product}
                onChange={handleProductChange}
              />
              <FormLabel
                py='4px'
                htmlFor='product'
                fontSize='sm'
                color={headingTextColor}
              >
                Version
              </FormLabel>
              <Input
                id='version'
                size='sm'
                color={sameSecondaryText}
                value={version}
                onChange={(e) => setVersion(e.target.value)}
              />
              <Text fontSize='md' mt='20px'>
                LINK OPTIONS
              </Text>
              <Divider />
              <Spacer />
              <Stack spacing='12px'>
                <Text fontSize='sm' mt='20px'>
                  SBOM Access
                </Text>
                <Text fontSize='xs' color={sameSecondaryText}>
                  Control access of SBOM with this link
                </Text>
                <Checkbox
                  isChecked={hasEmail}
                  onChange={(e) => setHasEmail(e.target.checked)}
                  px='10px'
                  mt='10px'
                  size='sm'
                  colorScheme='blue'
                  color={sameSecondaryText}
                >
                  Requires email confirmation
                </Checkbox>
                <Checkbox
                  isChecked={hasTerms}
                  onChange={(e) => setHasTerms(e.target.checked)}
                  px='10px'
                  size='sm'
                  colorScheme='blue'
                  color={sameSecondaryText}
                >
                  Requires agreeing to terms
                </Checkbox>
                <Checkbox
                  isChecked={hasRedactions}
                  onChange={(e) => setHasRedactions(e.target.checked)}
                  px='10px'
                  size='sm'
                  colorScheme='blue'
                  color={sameSecondaryText}
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
                  color={sameSecondaryText}
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
                  color={sameSecondaryText}
                >
                  Limit access to:{' '}
                </Checkbox>
                <Stack direction='row' spacing={2}>
                  {shared_with.map((p, idx) => (
                    <Tag
                      size='sm'
                      key={idx}
                      borderRadius='full'
                      variant='solid'
                      colorScheme='blue'
                    >
                      <TagLabel>{p}</TagLabel>
                      <TagCloseButton />
                    </Tag>
                  ))}
                </Stack>
                <Input
                  placeholder='Enter Email Address'
                  size='sm'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <Flex direction={'column'} alignItems={'start'} gap={2}>
                  {emailList.map((item) => (
                    <Box key={item}>
                      <Text
                        fontSize={'sm'}
                        px={4}
                        py={1}
                        bg={primaryBlueText}
                        color={primaryBgColor}
                        borderRadius={20}
                      >
                        {item}
                      </Text>
                    </Box>
                  ))}
                </Flex>
                <Spacer />
                <Text fontSize='sm' mt='30px'>
                  SBOM Content
                </Text>
                <Text fontSize='xs' color={sameSecondaryText}>
                  Select SBOM content that is required for this link
                </Text>
                <Checkbox
                  isChecked={hasComponents}
                  onChange={(e) => setHasComponents(e.target.checked)}
                  px='10px'
                  size='sm'
                  colorScheme='blue'
                  color={sameSecondaryText}
                >
                  Components
                </Checkbox>
                <Checkbox
                  isChecked={hasLicenses}
                  onChange={(e) => setHasLicenses(e.target.checked)}
                  px='10px'
                  size='sm'
                  colorScheme='blue'
                  color={sameSecondaryText}
                >
                  Licenses
                </Checkbox>
                <Checkbox
                  isChecked={hasVul}
                  onChange={(e) => setHasVul(e.target.checked)}
                  px='10px'
                  size='sm'
                  colorScheme='blue'
                  color={sameSecondaryText}
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
                <Text fontSize='xs' color={sameSecondaryText}>
                  Select SBOM format supported by this link
                </Text>
                <Checkbox
                  isChecked={hasCyclonDx}
                  onChange={(e) => setHasCyclonDx(e.target.checked)}
                  px='10px'
                  mt='10px'
                  size='sm'
                  colorScheme='blue'
                  color={sameSecondaryText}
                >
                  CycloneDX
                </Checkbox>
                <Checkbox
                  isChecked={hasSpdx}
                  onChange={(e) => setHasSpdx(e.target.checked)}
                  px='10px'
                  size='sm'
                  colorScheme='blue'
                  color={sameSecondaryText}
                >
                  SPDX
                </Checkbox>
              </Stack>
            </Box>
          </Stack>
        </DrawerBody>

        <DrawerFooter borderTopWidth='1px'>
          <Button
            title='Cancel'
            colorScheme='gray'
            variant='outline'
            mr={3}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button title='Save' colorScheme='blue'>
            Save
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default ProductLinkDrawer
