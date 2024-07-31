import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { validateUrl } from 'utils'

import { AddIcon, DeleteIcon } from '@chakra-ui/icons'
import {
  Button,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  IconButton,
  Input,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Tooltip,
  Tr
} from '@chakra-ui/react'

import ActionWrapper from 'components/Misc/ActionWrapper'

import { UpdateCompLinks } from 'graphQL/Mutation'

const CompLinks = ({ onClose, component, refetch }) => {
  const params = useParams()
  const sbomId = params.sbomid

  const [type, setType] = useState('')
  const [link, setLink] = useState('')
  const [linksData, setLinksData] = useState([])
  const [error, setError] = useState('')
  const { id, externalUrls } = component
  const [linkError, setLinkError] = useState('')
  const [updateLinks] = useMutation(UpdateCompLinks)

  const containsSpace = /\s/.test(link)

  useEffect(() => {
    const urls = []
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
      .then((res) => res.data && refetch())
      .finally(() => onClose())
  }

  return (
    <form onSubmit={handleLinkAdd}>
      <Flex
        direction={'column'}
        alignItems={'flex-start'}
        gap={3}
        px={6}
        pb={20}
      >
        {/* HEADING */}
        <Text color={'gray.500'} fontWeight={'medium'}>
          ADD LINK
        </Text>
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
          mt={1}
          type='submit'
          variant='outline'
          colorScheme='blue'
          leftIcon={<AddIcon />}
          isDisabled={
            !validateUrl(link.trim()) || error !== '' || linkError !== ''
          }
        >
          Add Link
        </Button>
        <Divider my={2} pos={'relative'} left={0} right={0} />
        {/* TABLE */}
        <Flex width={'100%'} flexDir={'column'}>
          <Text size='md' color={'gray.500'}>
            Existing Links
          </Text>
          {linksData.length > 0 ? (
            <Table variant='simple' size='sm' mt={4}>
              <Tbody>
                {linksData.map((item, index) => (
                  <Tr key={index}>
                    <Td pl={0} wordBreak={'break-all'}>
                      <Text>
                        {item.url ? (
                          <Tooltip label={item.url}>
                            {item.url.length > 35
                              ? `${item.url.substring(0, 35)}...`
                              : item.url}
                          </Tooltip>
                        ) : null}
                      </Text>
                      <Text mt={2} color={'gray.500'}>
                        {item.name}
                      </Text>
                    </Td>
                    <Td pl={0} isNumeric>
                      <IconButton
                        color={'red'}
                        variant='outline'
                        cursor={'pointer'}
                        icon={<DeleteIcon />}
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
        {/* ACTIONS */}
        <ActionWrapper>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            colorScheme='blue'
            width={'fit-content'}
            onClick={handleSave}
            hidden={linksData?.length === 0}
          >
            Save
          </Button>
        </ActionWrapper>
      </Flex>
    </form>
  )
}

export default CompLinks
