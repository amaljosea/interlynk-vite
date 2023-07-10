// Chakra imports
import { Flex, Button, Input, Spacer, Stack, useQuery } from '@chakra-ui/react'
import React, { useState, useEffect } from 'react'
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
import { useMutation } from '@apollo/client'
import { CreateShareLynk } from 'graphQL/Mutation'
import { getAllScanners } from 'graphQL/Queries'

function SBOMDrawer(props) {
  const {
    scanResults,
    isOpen,
    onClose,
    btnRef,
    imageDataRefetch,
    imgVersionId
  } = props

  const { data: allScanners } = useQuery(getAllScanners, {
    variables: {}
  })

  const [shareLynkCreate] = useMutation(CreateShareLynk, {
    onCompleted: imageDataRefetch
  })

  const imageName = window.localStorage.getItem('Image')

  const sbomqsVersions = ['v0.0.1', 'v0.0.2', 'v0.0.3']

  const [version, setVersion] = useState('')
  const [selectAll, setSelectAll] = useState(false)
  const [selectedScanner, setSelectedScanner] = useState([])
  const [hasEmail, setHasEmail] = useState(true)
  const [hasTerms, setHasTerms] = useState(true)
  const [hasLimitAccess, setHasLimitAccess] = useState(true)
  const [isPublic, setIsPublic] = useState(false)

  const [email, setEmail] = useState('')
  const [emailList, setEmailList] = useState([])

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      setEmailList((prev) => [email, ...prev])
      setEmail('')
    }
  }

  // useEffect(() => {
  //   console.log('selected scanner', selectedScanner)
  // }, [selectedScanner])

  // useEffect(() => {
  //   console.log('selected emails', emailList)
  // }, [emailList])

  const handleSave = async () => {
    try {
      await shareLynkCreate({
        variables: {
          imageVersionID: imgVersionId,
          enabled: true,
          emails: emailList,
          scanners: selectedOptions
        }
      }).then(() => {
        setEmailList([])
        setSelectedOptions([])
      })
      onClose()
    } catch (error) {
      if (error.networkError && error.networkError.statusCode === 500) {
        // Handle the specific error
        alert(
          'Duplicate connector is being created for Dockerhub with the same account ID.'
        )
        onClose()
      } else {
        // Handle other errors
        alert(error.message)
        onClose()
      }
    }
  }

  const handleRemove = (item) => {
    const updatedList = emailList.filter((email) => email !== item)
    setEmailList(updatedList)
  }

  const [selectedOptions, setSelectedOptions] = useState([])

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

  useEffect(() => {
    console.log('selectedOptions', selectedOptions)
  }, [selectedOptions])

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
                  {scanResults.map((item) => (
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
              </Stack>
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
