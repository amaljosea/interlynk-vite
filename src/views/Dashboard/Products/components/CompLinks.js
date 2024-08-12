import { gql, useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { validateUrl } from 'utils'

import { AddIcon, DeleteIcon } from '@chakra-ui/icons'
import {
  Button,
  ButtonGroup,
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

import useCustomToast from 'hooks/useCustomToast'

import { UpdateCompLinks } from 'graphQL/Mutation'

const GetCompUrls = gql`
  query GetCompUrls($id: Uuid!, $sbomId: Uuid!) {
    component(id: $id, sbomId: $sbomId) {
      externalUrls {
        name
        url
      }
    }
  }
`

const CompLinks = ({ component }) => {
  const params = useParams()
  const sbomId = params.sbomid
  const { showToast } = useCustomToast()
  const { id } = component

  const { data } = useQuery(GetCompUrls, {
    variables: { id, sbomId }
  })
  const { externalUrls, refetch } = data?.component || ''
  const filterUrls = externalUrls?.map((item) => ({
    name: item?.name,
    url: item?.url
  }))

  const [type, setType] = useState('')
  const [link, setLink] = useState('')
  const [error, setError] = useState('')
  const [disabled, setDisabled] = useState(false)
  const [activeLink, setActiveLink] = useState(null)
  const [linkError, setLinkError] = useState('')

  const [updateLinks] = useMutation(UpdateCompLinks)

  const disableButtonTemporarily = () => {
    setDisabled(true)
    setTimeout(() => {
      setDisabled(false)
    }, 3000)
  }

  const containsSpace = /\s/.test(link)

  const handleTypeChange = (e) => {
    const { value } = e.target
    setType(value)
    const isExists =
      externalUrls?.length > 0 &&
      externalUrls?.find((item) => item.name === value)
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

  const handleLinkAdd = () => {
    disableButtonTemporarily()
    const result = { url: link, name: type }
    updateLinks({
      variables: {
        id,
        sbomId,
        urls: filterUrls?.length > 0 ? [result, ...filterUrls] : [result]
      }
    }).then((res) => {
      if (res?.data) {
        showToast({
          description: 'Links updated successfully',
          status: 'success'
        })
      }
    })
    setType('')
    setLink('')
    setActiveLink(null)
  }

  const onDelete = (data) => {
    setActiveLink(data)
  }

  const handleLinkRemove = () => {
    const updatedList = filterUrls?.filter(
      (url) => url?.name !== activeLink?.name
    )
    disableButtonTemporarily()
    updateLinks({
      variables: {
        id,
        sbomId,
        urls: updatedList
      }
    })
  }

  const isInvalid =
    !validateUrl(link.trim()) || error !== '' || linkError !== '' || disabled

  return (
    <>
      <Flex px={6} gap={4} direction={'column'} alignItems={'flex-start'}>
        {/* HEADING */}
        <Text color={'gray.500'} fontWeight={'medium'}>
          Add Link
        </Text>
        {/* NAME */}
        <FormControl isRequired isInvalid={error}>
          <FormLabel>Type</FormLabel>
          <Select fontSize={'sm'} value={type} onChange={handleTypeChange}>
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
            fontSize={'sm'}
            value={link}
            placeholder='Add URL'
            onBlur={handleCheckUrl}
            onChange={handleLinkChange}
          />
          <FormErrorMessage>{linkError}</FormErrorMessage>
        </FormControl>
        {/* ACTIONS */}
        <Button
          fontSize={'sm'}
          variant='outline'
          colorScheme='blue'
          leftIcon={<AddIcon />}
          onClick={handleLinkAdd}
          isDisabled={isInvalid}
        >
          Add Link
        </Button>
        <Divider my={2} pos={'relative'} left={0} right={0} />
        {/* TABLE */}
        <Flex mb={4} width={'100%'} flexDir={'column'}>
          <Text fontWeight={'medium'} color={'gray.500'}>
            Existing Links
          </Text>
          {externalUrls?.length > 0 ? (
            <Table variant='simple' size='sm' mt={4}>
              <Tbody>
                {externalUrls?.map((item, index) => (
                  <Tr key={index}>
                    <Td pl={0} wordBreak={'break-all'}>
                      <Text>
                        {item?.url ? (
                          <Tooltip label={item.url}>
                            {item.url.length > 50
                              ? `${item.url.substring(0, 50)}...`
                              : item.url}
                          </Tooltip>
                        ) : null}
                      </Text>
                      <Text mt={2} color={'gray.500'}>
                        {item?.name}
                      </Text>
                    </Td>
                    <Td px={0} isNumeric>
                      {activeLink?.name === item?.name ? (
                        <ButtonGroup>
                          <Button
                            size='sm'
                            fontSize={'sm'}
                            variant='outline'
                            onClick={() => setActiveLink(null)}
                          >
                            No
                          </Button>
                          <Button
                            size='sm'
                            fontSize={'sm'}
                            variant='outline'
                            colorScheme='red'
                            isDisabled={disabled}
                            onClick={handleLinkRemove}
                          >
                            Yes
                          </Button>
                        </ButtonGroup>
                      ) : (
                        <IconButton
                          size='sm'
                          color={'red'}
                          variant='outline'
                          cursor={'pointer'}
                          icon={<DeleteIcon />}
                          onClick={() => onDelete(item)}
                        />
                      )}
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
    </>
  )
}

export default CompLinks
