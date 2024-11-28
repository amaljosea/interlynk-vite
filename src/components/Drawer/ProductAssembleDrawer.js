import React, { useState } from 'react'

import { Button, Flex, Input, Stack } from '@chakra-ui/react'
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
  Select,
  Text
} from '@chakra-ui/react'

import useCustomToast from 'hooks/useCustomToast'
import { useThemeColor } from 'hooks/useThemeColors'

function ProductAssembleDrawer(props) {
  const {
    isOpen,
    onClose,
    uniqProjects,
    uniqVersions,
    project,
    version,
    conf_email,
    conf_terms
  } = props

  const [productName, setProductName] = useState('')
  const [productVersion, setProductVersion] = useState('')
  const [isDuplicate, setIsDuplicate] = useState(conf_email)
  const [hasRelation, setHasRelation] = useState(conf_terms)
  const [allComponents, setAllComponents] = useState([])
  const [selectProduct, setSelectProduct] = useState('')
  const [selectVersion, setSelectVersion] = useState('')

  const { showToast } = useCustomToast()
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
  const handleSave = () => {
    if (productName !== '' && productVersion !== '') {
      // setProductVersionExploded((prev) => [
      //   {
      //     logo: FaGithub,
      //     name: productName,
      //     description:
      //       'A tool to compose your various sboms into a single sbom',
      //     version: productVersion,
      //     vendor: 'Interlynk',
      //     quality_score: 0,
      //     sbom_links: 0,
      //     risk_score: 'Not Defined',
      //     updated_at: new Date().toISOString(),
      //     active: true,
      //     source: 'Assembled'
      //   },
      //   ...prev
      // ])

      setProductName('')
      setProductVersion('')
      onClose()
    } else {
      showToast({
        title: `Input fields required`,
        status: 'error'
      })
    }
  }

  const handleAdd = () => {
    setAllComponents((prev) => [
      {
        product: selectProduct,
        version: selectVersion
      },
      ...prev
    ])
    setSelectProduct(project)
    setSelectVersion(version)
  }

  return (
    <Drawer isOpen={isOpen} placement='right' onClose={onClose} size='lg'>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth='1px'>Assemble Product</DrawerHeader>
        <DrawerBody>
          <Stack spacing='24px'>
            <Box>
              <FormLabel
                htmlFor='product'
                fontSize='sm'
                color={headingTextColor}
              >
                Product Name
              </FormLabel>
              <Input
                placeholder='UserAPI 1.0'
                size='sm'
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />

              <FormLabel
                htmlFor='product'
                fontSize='sm'
                color={headingTextColor}
              >
                Product Version
              </FormLabel>
              <Input
                placeholder='1.0.3'
                size='sm'
                value={productVersion}
                onChange={(e) => setProductVersion(e.target.value)}
              />

              <Text fontSize='md' mt='20px'>
                COMPONENTS
              </Text>
              <Divider mb='20px' />
              <Flex direction='column' alignItems='left'>
                <FormLabel
                  htmlFor='product'
                  fontSize='sm'
                  color={headingTextColor}
                >
                  Product
                </FormLabel>
                <Select
                  id='product'
                  value={selectProduct}
                  onChange={(e) => setSelectProduct(e.target.value)}
                  size='sm'
                  color={sameSecondaryText}
                >
                  {uniqProjects.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </Select>
                <FormLabel
                  htmlFor='product'
                  fontSize='sm'
                  color={headingTextColor}
                >
                  Version
                </FormLabel>
                <Select
                  id='version'
                  value={selectVersion}
                  onChange={(e) => setSelectVersion(e.target.value)}
                  size='sm'
                  mb='10px'
                  color={sameSecondaryText}
                >
                  {uniqVersions.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </Select>
                <Button
                  colorScheme='blue'
                  size='sm'
                  me='100px'
                  p='10px'
                  maxW='100px'
                  title='Assemble product'
                  onClick={handleAdd}
                >
                  Add
                </Button>
              </Flex>
              <Flex direction={'column'} alignItems={'start'} gap={2} my={5}>
                {allComponents.map((item, index) => (
                  <Flex
                    key={index}
                    direction={'row'}
                    gap={2}
                    alignItems={'center'}
                  >
                    <Text
                      fontSize={'sm'}
                      px={4}
                      py={1}
                      bg={primaryBlueText}
                      color={primaryBgColor}
                      borderRadius={20}
                    >
                      {item.product} - {item.version}
                    </Text>
                  </Flex>
                ))}
              </Flex>
              <Text fontSize='md' mt='20px'>
                ASSEMBLE OPTIONS
              </Text>
              <Divider />
              <Stack spacing='12px'>
                <Text fontSize='sm' mt='20px'>
                  SBOM Includes
                </Text>
                <Checkbox
                  isChecked={isDuplicate}
                  onChange={(e) => setIsDuplicate(e.target.checked)}
                  px='10px'
                  mt='10px'
                  size='sm'
                  colorScheme='blue'
                  color={sameSecondaryText}
                >
                  Duplicate components
                </Checkbox>
                <Checkbox
                  isChecked={hasRelation}
                  onChange={(e) => setHasRelation(e.target.checked)}
                  px='10px'
                  size='sm'
                  colorScheme='blue'
                  color={sameSecondaryText}
                >
                  Relationships
                </Checkbox>
              </Stack>
            </Box>
          </Stack>
        </DrawerBody>
        <DrawerFooter borderTopWidth='1px'>
          <Button title='Cancel' variant='outline' mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            title='Save'
            colorScheme='blue'
            type='submit'
            onClick={handleSave}
          >
            Save
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default ProductAssembleDrawer
