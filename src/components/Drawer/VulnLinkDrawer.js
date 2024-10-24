import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import { validateUrl } from 'utils'

import { DeleteIcon } from '@chakra-ui/icons'
import {
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

import LynkAlert from 'components/LynkAlert'

import { useThemeColor } from 'hooks/useThemeColors'

import { ComponentVulnUpdate } from 'graphQL/Mutation'
import { DispositionByParentUpdate } from 'graphQL/Mutation'

const VulnLinkDrawer = ({ data, isOpen, onClose, sbomId }) => {
  const { id, externalUrls, currentExternalUrls, vuln, isPart } = data || ''
  const [type, setType] = useState('')
  const [link, setLink] = useState('')
  const [externalData, setExternalData] = useState([])
  const [currentData, setCurrentData] = useState([])
  const [error, setError] = useState('')
  const [linkError, setLinkError] = useState('')

  const [addUrls, { loading }] = useMutation(ComponentVulnUpdate)
  const [addPartsUrls] = useMutation(DispositionByParentUpdate)

  const { primaryErrorColor, secondaryTextInverse } = useThemeColor([
    'primaryErrorColor',
    'secondaryTextInverse'
  ])

  const containsSpace = /\s/.test(link)

  useEffect(() => {
    if (externalUrls?.length > 0) {
      const urls = []
      externalUrls?.map((item, index) => {
        urls.push({
          id: index + 1,
          name: item.name,
          url: item.url
        })
      })
      setExternalData(urls)
    }
  }, [externalUrls])

  useEffect(() => {
    if (currentExternalUrls?.length > 0) {
      const urls = []
      currentExternalUrls?.map((item, index) => {
        urls.push({
          id: index + 1,
          name: item.name,
          url: item.url
        })
      })
      setCurrentData(urls)
    }
  }, [currentExternalUrls])

  const handleTypeChange = (e) => {
    const { value } = e.target
    setType(value)
    const isExists =
      externalData?.length > 0 &&
      externalData?.find((item) => item.name === value)
    if (isExists) {
      setError('Link type already exists!')
    } else {
      setError('')
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
    if (isPart) {
      const id = currentData?.length + 1
      setCurrentData((prev) => [{ id, name: type, url: link }, ...prev])
    } else {
      const id = externalData?.length + 1
      setExternalData((prev) => [{ id, name: type, url: link }, ...prev])
    }
    setType('')
    setLink('')
  }

  const handleLinkRemove = (id) => {
    if (isPart) {
      const currentList = currentData.filter((item) => item?.id !== id)
      setCurrentData(currentList)
    } else {
      const externalList = externalData.filter((item) => item?.id !== id)
      setExternalData(externalList)
    }
  }

  const handleSave = async () => {
    if (isPart) {
      const urls = []
      currentData?.map((item) =>
        urls.push({ name: item?.name, url: item?.url })
      )
      await addPartsUrls({
        variables: {
          sbomId,
          componentVulnId: id,
          externalUrls: urls
        }
      }).then((res) => {
        const errors = res?.data?.dispositionByParentUpdate?.errors
        if (errors?.length > 0) {
          setError(errors[0])
        } else {
          setError('')
          onClose()
        }
      })
    }
    const extUrls = []
    externalData?.map((item) =>
      extUrls.push({ name: item?.name, url: item?.url })
    )
    await addUrls({
      variables: {
        componentVulnId: id,
        externalUrls: extUrls
      }
    }).then((res) => {
      const errors = res?.data?.componentVulnUpdate?.errors
      if (errors?.length > 0) {
        setError(errors[0])
      } else {
        setError('')
        onClose()
      }
    })
  }

  return (
    <Drawer size='sm' isOpen={isOpen} placement='right' onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton mt={2} />
        <DrawerHeader borderBottomWidth='1px'>
          <Text>Edit Links</Text>
          {data && <Tag colorScheme='blue'>{vuln?.vulnId}</Tag>}
        </DrawerHeader>
        <DrawerBody>
          {error !== '' && <LynkAlert msg={error} />}
          <form onSubmit={handleLinkAdd}>
            <Flex mt={4} direction={'column'} alignItems={'flex-start'} gap={3}>
              {/* NAME */}
              <FormControl isRequired>
                <FormLabel>Type</FormLabel>
                <Select value={type} onChange={handleTypeChange}>
                  <option value=''>-- Select --</option>
                  {[
                    'issue-tracker',
                    'advisories',
                    'documentation',
                    'other'
                  ].map((item, index) => (
                    <option key={index} value={item}>
                      {item}
                    </option>
                  ))}
                </Select>
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
                isDisabled={!validateUrl(link.trim()) || linkError !== ''}
              >
                Add
              </Button>
              {/* TABLE */}
              <Flex width={'100%'} flexDir={'column'}>
                <Text size='md' my={2}>
                  Existing Links
                </Text>
                {externalData?.length > 0 || currentData?.length > 0 ? (
                  <Table variant='simple' size='sm' mt={4}>
                    <Thead>
                      <Tr my='.8rem'>
                        <Th pl={0}>Link</Th>
                        <Th pl={0}>Type</Th>
                        <Th pl={0}></Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {externalData?.length > 0 &&
                        externalData?.map((item, index) => (
                          <Tr key={index}>
                            <Td pl={0} fontSize={'xs'} wordBreak={'break-all'}>
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
                            <Td pl={0}>
                              <Icon
                                as={DeleteIcon}
                                color={primaryErrorColor}
                                cursor={'pointer'}
                                display={isPart ? 'none' : 'block'}
                                onClick={() => handleLinkRemove(item?.id)}
                              />
                            </Td>
                          </Tr>
                        ))}
                      {currentData?.length > 0 &&
                        currentData?.map((item, index) => (
                          <Tr key={index}>
                            <Td pl={0} fontSize={'xs'} wordBreak={'break-all'}>
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
                            <Td pl={0}>
                              <Icon
                                as={DeleteIcon}
                                color={primaryErrorColor}
                                cursor={'pointer'}
                                onClick={() => handleLinkRemove(item?.id)}
                              />
                            </Td>
                          </Tr>
                        ))}
                    </Tbody>
                  </Table>
                ) : (
                  <Text mt={4} color={secondaryTextInverse}>
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
          <Button colorScheme='blue' onClick={handleSave} isLoading={loading}>
            Save
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default VulnLinkDrawer
