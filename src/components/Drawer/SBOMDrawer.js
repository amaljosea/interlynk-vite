// Chakra imports
import { Flex, Button, Input, Spacer, Stack, useQuery } from '@chakra-ui/react'
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
import { useMutation } from '@apollo/client'
import { CreateShareLynk } from 'graphQL/Mutation'
import { UpdateShareLynk } from 'graphQL/Mutation'
import { getAllScanners } from 'graphQL/Queries'
import { useEffect } from 'react'

function SBOMDrawer(props) {
  const { id, isOpen, onClose, btnRef, imageDataRefetch, imgVersionId } = props

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

  const scannerItems = JSON.parse(window.localStorage.getItem('scanners'))

  const handleScannerChange = (event) => {
    const { name, checked } = event.target
    if (name === 'selectAll') {
      setSelectAll(checked)
      const allData = scannerItems.map((item) => item.id)
      if (checked) {
        setSelectedScanner(allData)
      } else {
        setSelectedScanner([])
      }
    } else {
      const filteredScanner = scannerItems.filter(
        (scanner) => scanner.name === name
      )
      console.log('filter', filteredScanner)
      if (checked) {
        setSelectedScanner((prevTools) => [...prevTools, filteredScanner[0].id])
      } else {
        setSelectedScanner((prevTools) =>
          prevTools.filter((tool) => tool !== filteredScanner[0].id)
        )
      }
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
          scanners: selectedScanner
        }
      }).then(() => setEmailList([]))
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
                <Flex direction={'row'} gap={4}>
                  <Checkbox
                    name='selectAll'
                    isChecked={
                      allScanners &&
                      allScanners.some((tool) => tool.name !== 'All')
                    }
                    onChange={handleScannerChange}
                    size='sm'
                    colorScheme='blue'
                    color='gray.500'
                  >
                    All
                  </Checkbox>
                  <Checkbox
                    name='Grype'
                    isChecked={
                      allScanners &&
                      allScanners.some((tool) => tool.name === 'Grype')
                    }
                    onChange={handleScannerChange}
                    size='sm'
                    colorScheme='blue'
                    color='gray.500'
                  >
                    Grype
                  </Checkbox>
                  <Checkbox
                    name='Trivy'
                    isChecked={
                      allScanners &&
                      allScanners.some((tool) => tool.name === 'Trivy')
                    }
                    onChange={handleScannerChange}
                    size='sm'
                    colorScheme='blue'
                    color='gray.500'
                  >
                    Trivy
                  </Checkbox>
                  <Checkbox
                    name='Scout'
                    isChecked={
                      allScanners &&
                      allScanners.some((tool) => tool.name === 'Scout')
                    }
                    onChange={handleScannerChange}
                    size='sm'
                    colorScheme='blue'
                    color='gray.500'
                  >
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
