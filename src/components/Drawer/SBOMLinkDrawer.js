// Chakra imports
import { Flex, Button, Input, Spacer, Stack } from '@chakra-ui/react'
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
  Select,
  Checkbox,
  Divider,
  Text,
  Tag,
  TagLabel,
  TagCloseButton
} from '@chakra-ui/react'
import { useEffect } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { UpdateShareLynk } from 'graphQL/Mutation'
import { getAllScanners } from 'graphQL/Queries'

function SBOMLinkDrawer(props) {
  const {
    id,
    isOpen,
    onClose,
    btnRef,
    imageDataRefetch,
    shareScanner,
    scanResults,
    emailList,
    setEmailList,
    imageInfo
  } = props

  const sortScanResult = [...scanResults].sort((a, b) =>
    a.company.localeCompare(b.company)
  )

  const sbomqsVersions = ['v0.0.1', 'v0.0.2', 'v0.0.3']

  const [shareLynkUpdate] = useMutation(UpdateShareLynk, {
    onCompleted: imageDataRefetch
  })

  const [hasEmail, setHasEmail] = useState(true)
  const [hasTerms, setHasTerms] = useState(true)
  const [hasLimitAccess, setHasLimitAccess] = useState(true)
  const [version, setVersion] = useState('')
  const [email, setEmail] = useState('')

  const [selectedOptions, setSelectedOptions] = useState([])

  useEffect(() => {
    if (shareScanner.length > 0) {
      const ids = shareScanner.map((item) => item.scanner.id)
      setSelectedOptions(ids)
    }
  }, [shareScanner, setSelectedOptions])

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      setEmailList((prev) => [email, ...prev])
      setEmail('')
    }
  }

  const handleUpdate = async () => {
    try {
      await shareLynkUpdate({
        variables: {
          shareLynkId: id,
          enabled: true,
          emails: emailList,
          scanners: selectedOptions
        }
      })
      onClose()
    } catch (error) {
      console.error('ShareLynk update error: ', error)
      toast({
        description: 'An error occured while updating ShareLynk. Please retry in few minutes.',
        status: 'error',
        duration: 2000,
        position: 'top'
      })
    }
  }

  const imageName = window.sessionStorage.getItem('Image')

  const handleRemove = (item) => {
    const updatedList = emailList.filter((email) => email !== item)
    setEmailList(updatedList)
  }

  const handleChange = (value) => {
    if (selectedOptions.includes(value)) {
      setSelectedOptions(selectedOptions.filter((option) => option !== value))
    } else {
      setSelectedOptions([...selectedOptions, value])
    }
  }

  const handleSelectAll = () => {
    if (selectedOptions.length === scanResults.length) {
      setSelectedOptions([])
    } else {
      const allOptionIds = scanResults.map((option) => option.id)
      setSelectedOptions(allOptionIds)
    }
  }

  const isSelected = (value) => {
    return selectedOptions.includes(value)
  }

  return (
    <Drawer isOpen={isOpen} placement='right' onClose={onClose} size='sm'>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth='1px' color='gray.600'>
          Share Lynk
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
                Image
              </FormLabel>
              <Input
                defaultValue={imageName ? imageName : ''}
                fontSize={'sm'}
                mb={4}
              />
              <FormLabel
                py='4px'
                htmlFor='product'
                fontSize='sm'
                color='gray.600'
              >
                Version
              </FormLabel>
              <Select
                id='version'
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                size='sm'
                color='gray.500'
                mb={4}
              >
                {imageInfo.length > 0 ? (
                  imageInfo.map((img, index) => (
                    <option key={index} value={img.id}>
                      {img.name}+
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
                <Flex direction={'column'} gap={1}>
                  <Checkbox
                    isChecked={selectedOptions.length === scanResults.length}
                    onChange={handleSelectAll}
                    size='sm'
                    colorScheme='blue'
                    color='gray.500'
                  >
                    All
                  </Checkbox>
                  {sortScanResult &&
                    sortScanResult.map((item) => (
                      <Checkbox
                        key={item.id}
                        isChecked={isSelected(item.id)}
                        onChange={() => handleChange(item.id)}
                        isDisabled={
                          selectedOptions.length === scanResults.length &&
                          !isSelected(item.id)
                        }
                        size='sm'
                        colorScheme='blue'
                        color='gray.500'
                      >
                        {item.company}-{item.name}
                      </Checkbox>
                    ))}
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
                  isChecked={hasLimitAccess}
                  onChange={(e) => {
                    setHasLimitAccess(e.target.checked)
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
                  autoComplete='off'
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
                      {emailList.length > 1 && (
                        <TagCloseButton onClick={() => handleRemove(item)} />
                      )}
                    </Tag>
                  ))}
                </Flex>
                <Spacer />
              </Stack>
            </Box>
          </Stack>
        </DrawerBody>

        <DrawerFooter borderTopWidth='1px'>
          <Button variant='outline' mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme='blue' onClick={handleUpdate}>
            Update
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default SBOMLinkDrawer
