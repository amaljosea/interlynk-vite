import React, { useState } from 'react'

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Checkbox,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormLabel,
  Input,
  Select,
  Spacer,
  Stack,
  Tag,
  TagCloseButton,
  TagLabel,
  Text
} from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

function ImagesDrawer({ isOpen, onClose, activeImageId }) {
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

  const [email, setEmail] = useState('')
  const [emailList, setEmailList] = useState([])

  const { sameSecondaryText, headingTextColor } = useThemeColor([
    'sameSecondaryText',
    'headingTextColor'
  ])

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      setEmailList((prev) => [email, ...prev])
      setEmail('')
    }
  }

  const handleRemove = (item) => {
    const updatedList = emailList.filter((email) => email !== item)
    setEmailList(updatedList)
  }

  const sbomqsVersions = ['v0.0.1', 'v0.0.2', 'v0.0.3']
  const sbomasmVersion = ['v1.0', 'v1.1', 'v1.2']
  const sbomgrVersion = ['v0.1', 'v0.2', 'v0.3']

  return (
    <Drawer isOpen={isOpen} placement='right' onClose={onClose} size='md'>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth='1px'>Share Lynk</DrawerHeader>
        <DrawerBody>
          <Stack spacing='20px'>
            <Box>
              <FormLabel
                htmlFor='product'
                fontSize='sm'
                color={headingTextColor}
              >
                Image name
              </FormLabel>
              <Select id='product' size='sm' color={sameSecondaryText}>
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
              <FormLabel
                htmlFor='version'
                fontSize='sm'
                color={headingTextColor}
              >
                Tag
              </FormLabel>
              <Select id='version' size='sm' color={sameSecondaryText}>
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
              <FormLabel htmlFor='scanners' color={headingTextColor}>
                Scanners
              </FormLabel>
              <Flex direction={'row'} gap={4}>
                <Checkbox
                  mt={1}
                  size='sm'
                  colorScheme='blue'
                  color={sameSecondaryText}
                >
                  Grype
                </Checkbox>
                <Checkbox
                  mt={1}
                  size='sm'
                  colorScheme='blue'
                  color={sameSecondaryText}
                >
                  Trivy
                </Checkbox>
                <Checkbox
                  mt={1}
                  size='sm'
                  colorScheme='blue'
                  color={sameSecondaryText}
                >
                  Scout
                </Checkbox>
                <Checkbox
                  mt={1}
                  size='sm'
                  colorScheme='blue'
                  color={sameSecondaryText}
                >
                  Snyk
                </Checkbox>
                <Checkbox
                  mt={1}
                  size='sm'
                  colorScheme='blue'
                  color={sameSecondaryText}
                >
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

                <Input
                  placeholder='Enter Email Address'
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
                <Text fontSize='xs' color={sameSecondaryText}>
                  Select SBOM content that is required for this link
                </Text>
                <Checkbox
                  readOnly
                  checked={hasComponents}
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
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </Box>
          </Stack>
        </DrawerBody>

        <DrawerFooter>
          <Button title='Cancel' variant='outline' mr={3} onClick={onClose}>
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

export default ImagesDrawer
