// Chakra imports
import React, { useState } from 'react'
import { useEffect } from 'react'
import { productVersionsData } from 'variables/general'

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
  InputGroup,
  Select,
  Tag,
  TagCloseButton,
  TagLabel,
  Text
} from '@chakra-ui/react'

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
  const handleChange = (event) => setValue(event.target.value)

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
        <DrawerHeader borderBottomWidth='1px' color='gray.600'>
          Share Link
        </DrawerHeader>
        <DrawerBody>
          <Stack spacing='24px'>
            <Box>
              <FormLabel
                py='4px'
                htmlFor='product'
                fontSize='sm'
                color='gray.600'
              >
                Product
              </FormLabel>
              <Input
                id='product'
                size='sm'
                color='gray.500'
                value={product}
                onChange={handleProductChange}
              />
              <FormLabel
                py='4px'
                htmlFor='product'
                fontSize='sm'
                color='gray.600'
              >
                Version
              </FormLabel>
              <Input
                id='version'
                size='sm'
                color='gray.500'
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
                  placeholder='Enter email address'
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
                        bg={'blue.500'}
                        color={'white'}
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
                <Text fontSize='xs' color='gray.500'>
                  Select SBOM content that is required for this link
                </Text>
                <Checkbox
                  isChecked={hasComponents}
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
              </Stack>
            </Box>
          </Stack>
        </DrawerBody>

        <DrawerFooter borderTopWidth='1px'>
          <Button colorScheme='gray' variant='outline' mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme='blue'>Save</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default ProductLinkDrawer
