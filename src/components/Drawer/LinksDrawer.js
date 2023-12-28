import { useEffect, useState } from 'react'
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  Flex,
  Text,
  FormControl,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Table,
  Icon,
  Select,
  FormLabel,
  Input,
  FormErrorMessage,
  Tooltip,
  Tag
} from '@chakra-ui/react'
import { DeleteIcon } from '@chakra-ui/icons'
import { useMutation } from '@apollo/client'
import { UpdateCompLinks } from 'graphQL/Mutation'
import { validateUrl } from 'utils'

const LinksDrawer = ({ isOpen, onClose, component, sbomId, fetchCompData }) => {
  const [type, setType] = useState('')
  const [link, setLink] = useState('')
  const [linksData, setLinksData] = useState([])
  const [error, setError] = useState('')
  const { id, externalUrls } = component
  const [linkError, setLinkError] = useState('')
  const [updateLinks] = useMutation(UpdateCompLinks)

  const containsSpace = /\s/.test(link)

  const urls = []

  useEffect(() => {
    externalUrls?.map((item) => {
      urls.push({
        name: item.name,
        url: item.url
      })
    })
    setLinksData(urls)
  }, [externalUrls])

  const handleTypeChange = (e) => {
    const { value } = e.target
    setType(value)
    const isExists =
      linksData.length > 0 && linksData.find((item) => item.name === value)
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
    setLinkError('')
    if (trimmedLink.length > 1024) {
      setLinkError('Input must be 1024 characters')
    } else {
      setLinkError('')
    }
  }

  const handleLinkAdd = async (e) => {
    e.preventDefault()
    setLinksData((prev) => [{ url: link, name: type }, ...prev])
    setType('')
    setLink('')
  }

  const handleLinkRemove = (id) => {
    const updatedList = linksData.filter((_, index) => index !== id)
    setLinksData(updatedList)
  }

  const handleSave = async () => {
    await updateLinks({
      variables: {
        id: id,
        sbomId: sbomId,
        urls: linksData
      }
    })
      .then((res) => res.data && fetchCompData())
      .finally(() => onClose())
  }

  return (
    <>
      <Drawer isOpen={isOpen} placement='right' onClose={onClose} size='md'>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth='1px' color='gray.600'>
            Edit Links
          </DrawerHeader>
          <DrawerBody>
            {component && (
              <Flex
                width='100%'
                direction={'row'}
                alignItems={'center'}
                justifyContent={'flex-start'}
                wrap={'wrap'}
                gap={2}
                my={4}
              >
                <Text fontWeight={'medium'}>{component.name}</Text>
                <Tag colorScheme='blue'>{component.version}</Tag>
              </Flex>
            )}
            <form onSubmit={handleLinkAdd}>
              <Flex direction={'column'} alignItems={'flex-start'} gap={3}>
                {/* NAME */}
                <FormControl isRequired isInvalid={error}>
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
                  <FormErrorMessage>{error}</FormErrorMessage>
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
                    error !== '' ||
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
                          <Th pl={0}></Th>
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
                            <Td pl={0}>
                              <Icon
                                as={DeleteIcon}
                                color={'red'}
                                cursor={'pointer'}
                                onClick={() => handleLinkRemove(index)}
                              />
                            </Td>
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
            <Button mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button variant='solid' colorScheme='blue' onClick={handleSave}>
              Save
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default LinksDrawer
