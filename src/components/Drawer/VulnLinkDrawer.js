import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import { validateUrl } from 'utils'

import { DeleteIcon } from '@chakra-ui/icons'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Icon,
  Input,
  Select,
  Table,
  Tag,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr
} from '@chakra-ui/react'

import { ComponentVulnUpdate } from 'graphQL/Mutation'
import { DispositionByParentUpdate } from 'graphQL/Mutation'

const areEqual = (arr1, arr2) => {
  if (arr1?.length !== arr2?.length) {
    return false
  }
  arr1?.sort((a, b) => a.name.localeCompare(b.name))
  arr2?.sort((a, b) => a.name.localeCompare(b.name))
  for (let i = 0; i < arr1?.length; i++) {
    if (arr1[i].name !== arr2[i].name || arr1[i].url !== arr2[i].url) {
      return false
    }
  }
  return true
}

const VulnLinkDrawer = ({ data, isOpen, onClose, sbomId, refetch }) => {
  console.log('data', data)
  const { id, externalUrls, currentExternalUrls, vuln, isPart } = data || ''
  const [type, setType] = useState('')
  const [link, setLink] = useState('')
  const [linksData, setLinksData] = useState([])
  const [error, setError] = useState('')
  const [typeError, setTypeError] = useState('')
  const [linkError, setLinkError] = useState('')

  const [addUrls] = useMutation(ComponentVulnUpdate)
  const [addPartsUrls] = useMutation(DispositionByParentUpdate)

  const containsSpace = /\s/.test(link)

  useEffect(() => {
    if (externalUrls?.length > 0) {
      const urls = []
      externalUrls?.map((item) => {
        urls.push({
          name: item.name,
          url: item.url
        })
      })
      setLinksData(urls)
    }
  }, [externalUrls])

  useEffect(() => {
    if (currentExternalUrls?.length > 0) {
      const urls = []
      currentExternalUrls?.map((item) => {
        urls.push({
          name: item.name,
          url: item.url
        })
      })
      setLinksData(urls)
    }
  }, [currentExternalUrls])

  const handleTypeChange = (e) => {
    const { value } = e.target
    setType(value)
    setError('')
    const isExists =
      linksData.length > 0 && linksData.find((item) => item.name === value)
    if (isExists) {
      setTypeError('Link type already exists!')
    } else {
      setTypeError('')
    }
  }

  const handleCheckUrl = () => {
    const trimmedLink = link.trim()
    console.log(trimmedLink)
    if (!validateUrl(trimmedLink)) {
      setLinkError('Please enter a valid URL')
    }
  }

  const handleLinkChange = (e) => {
    const { value } = e.target
    const trimmedLink = value.trim()
    setLink(value)
    setError('')
    setLinkError('')
    if (trimmedLink.length > 1024) {
      setLinkError('Input must be 1024 characters')
    } else {
      setLinkError('')
    }
  }

  const handleLinkAdd = (e) => {
    e.preventDefault()
    setLinksData((prev) => [{ name: type, url: link }, ...prev])
    setType('')
    setLink('')
  }

  const handleLinkRemove = (id) => {
    const updatedList = linksData.filter((_, index) => index !== id)
    setLinksData(updatedList)
  }

  const handleSave = async () => {
    if (isPart) {
      await addPartsUrls({
        variables: {
          sbomId,
          componentVulnId: id,
          externalUrls: linksData
        }
      }).then((res) => {
        const errors = res?.data?.dispositionByParentUpdate?.errors
        if (errors?.length > 0) {
          setError(errors[0])
        } else {
          setError('')
          refetch()
          onClose()
        }
      })
    } else {
      await addUrls({
        variables: {
          componentVulnId: id,
          externalUrls: linksData
        }
      }).then((res) => {
        const errors = res?.data?.componentVulnUpdate?.errors
        if (errors?.length > 0) {
          setError(errors[0])
        } else {
          setError('')
          refetch()
          onClose()
        }
      })
    }
  }

  const isExternalEqual = areEqual(externalUrls, linksData)
  const isCurrentEqual = areEqual(currentExternalUrls, linksData)

  return (
    <Drawer size='sm' isOpen={isOpen} placement='right' onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Edit Links</DrawerHeader>
        <DrawerBody>
          {data && <Tag colorScheme='blue'>{vuln?.vulnId}</Tag>}
          {error !== '' && (
            <Alert my={2} status='error' borderRadius={4}>
              <AlertIcon />
              <AlertDescription fontSize={'sm'}>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleLinkAdd}>
            <Flex mt={4} direction={'column'} alignItems={'flex-start'} gap={3}>
              {/* NAME */}
              <FormControl isRequired isInvalid={typeError}>
                <FormLabel>Type</FormLabel>
                <Select value={type} onChange={handleTypeChange}>
                  <option value=''>-- Select --</option>
                  {[
                    'vcs',
                    'issue-tracker',
                    'website',
                    'advisories',
                    'bom',
                    'mailing-list',
                    'social',
                    'chat',
                    'documentation',
                    'support',
                    'distribution',
                    'license',
                    'build-meta',
                    'build-system',
                    'release-notes',
                    'other'
                  ].map((item, index) => (
                    <option key={index} value={item}>
                      {item}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{typeError}</FormErrorMessage>
              </FormControl>
              {/* URL */}
              <FormControl
                isRequired
                isInvalid={
                  (link !== '' && !validateUrl(link.trim())) || containsSpace
                }
              >
                <FormLabel>Link</FormLabel>
                <Input
                  placeholder='Add URL'
                  value={link}
                  onBlur={handleCheckUrl}
                  onChange={handleLinkChange}
                />
                <FormErrorMessage>{linkError}</FormErrorMessage>
              </FormControl>
              {/* ACTIONS */}
              <Button
                colorScheme='blue'
                type='submit'
                isDisabled={
                  !validateUrl(link.trim()) ||
                  typeError !== '' ||
                  linkError !== ''
                }
              >
                Add
              </Button>
              {/* TABLE */}
              <Flex width={'100%'} flexDir={'column'}>
                <Text size='md' my={2}>
                  Existing Links
                </Text>
                {linksData.length > 0 ? (
                  <Table variant='simple' size='sm' mt={4}>
                    <Thead>
                      <Tr my='.8rem'>
                        <Th pl={0} width={'260px'}>
                          Link
                        </Th>
                        <Th pl={0}>Type</Th>
                        {/* <Th pl={0}></Th> */}
                      </Tr>
                    </Thead>
                    <Tbody>
                      {linksData.map((item, index) => (
                        <Tr key={index}>
                          <Td
                            pl={0}
                            fontSize={'xs'}
                            width={'260px'}
                            wordBreak={'break-all'}
                          >
                            {item.url ? (
                              <Tooltip label={item.url}>
                                {item.url.length > 35
                                  ? `${item.url.substring(0, 35)}...`
                                  : item.url}
                              </Tooltip>
                            ) : null}
                          </Td>
                          <Td pl={0} fontSize={'xs'}>
                            {item.name}
                          </Td>
                          {/* <Td pl={0}>
                            <Icon
                              as={DeleteIcon}
                              color={'red'}
                              cursor={'pointer'}
                              onClick={() => handleLinkRemove(index)}
                            />
                          </Td> */}
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                ) : (
                  <Text mt={4} color={'darkgrey'}>
                    No existing links
                  </Text>
                )}
              </Flex>
            </Flex>
          </form>
        </DrawerBody>
        <DrawerFooter>
          <Button variant='outline' mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme='blue'
            onClick={handleSave}
            isDisabled={isPart ? isCurrentEqual : isExternalEqual}
          >
            Save
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default VulnLinkDrawer
