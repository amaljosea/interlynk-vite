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
    shareUsers
  } = props

  const sbomqsVersions = ['v0.0.1', 'v0.0.2', 'v0.0.3']

  const { data: allScanners } = useQuery(getAllScanners, {
    variables: {}
  })

  const [shareLynkUpdate] = useMutation(UpdateShareLynk, {
    onCompleted: imageDataRefetch
  })

  const [hasEmail, setHasEmail] = useState(true)
  const [hasTerms, setHasTerms] = useState(true)
  const [hasLimitAccess, setHasLimitAccess] = useState(true)
  const [email, setEmail] = useState('')
  const [emailList, setEmailList] = useState([])

  const [checkboxData, setCheckboxData] = useState([])
  const [checkedValues, setCheckedValues] = useState([])
  const [isAllChecked, setIsAllChecked] = useState(false)

  useEffect(() => {
    if (shareUsers.length > 0) {
      setEmailList(shareUsers.map((item) => item.email))
    }
  }, [shareUsers])

  useEffect(() => {
    if (shareScanner.length > 0) {
      setCheckboxData(shareScanner.map((scanner) => scanner))
    }
  }, [shareScanner])

  // console.log('checkboxData', checkboxData)

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
          emails: emailList
        }
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

  const imageName = window.localStorage.getItem('Image')

  const handleRemove = (item) => {
    const updatedList = emailList.filter((email) => email !== item)
    setEmailList(updatedList)
  }

  // useEffect(() => {
  //   console.log('selected emails', emailList)
  //   console.log('shareScanner', shareScanner)
  // }, [emailList])

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
              <FormLabel
                py='4px'
                htmlFor='product'
                fontSize='sm'
                color='gray.600'
              >
                Image
              </FormLabel>
              <Input
                value={imageName ? imageName : ''}
                readOnly
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
                    All
                  </Checkbox>
                  <Checkbox size='sm' colorScheme='blue' color='gray.500'>
                    Grype
                  </Checkbox>
                  <Checkbox size='sm' colorScheme='blue' color='gray.500'>
                    Trivy
                  </Checkbox>
                  <Checkbox size='sm' colorScheme='blue' color='gray.500'>
                    Scout
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
                <Checkbox
                  isChecked={hasLimitAccess}
                  onChange={(e) => {
                    setHasLimitAccess(e.target.checked)
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
