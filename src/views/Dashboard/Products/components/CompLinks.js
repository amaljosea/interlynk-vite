import { gql, useMutation, useQuery } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { useContext, useState } from 'react'
import { truncatedValue, validateUrl } from 'utils'
import { isCustomerView } from 'utils'

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
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Tooltip,
  Tr
} from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'

import useCustomToast from 'hooks/useCustomToast'

import { UpdateCompLinks } from 'graphQL/Mutation'

import ActionButton from './ActionButton'

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

const CompLinks = ({ data }) => {
  const { showToast } = useCustomToast()
  const { id, sbomId } = data || ''
  const customerView = isCustomerView()

  const {
    tabData,
    setTabData,
    handleChange,
    saveChanges,
    unsavedChanges,
    alert,
    setAlert
  } = useContext(TabContext)
  const { links } = tabData

  const { data: compUrls } = useQuery(GetCompUrls, {
    skip: customerView,
    variables: { id, sbomId }
  })
  const { externalUrls } = compUrls?.component || ''

  const filterUrls = externalUrls?.map((item) => ({
    name: item?.name,
    url: item?.url || ''
  }))

  const [error, setError] = useState('')
  const [activeLink, setActiveLink] = useState(null)
  const [linkError, setLinkError] = useState('')

  const [updateLinks, { loading }] = useMutation(UpdateCompLinks)

  const containsSpace = /\s/.test(links?.url)

  const handleTypeChange = (e) => {
    const { value } = e.target
    handleChange('links', 'name', value)
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
    const trimmedLink = links?.url?.trim()
    if (!validateUrl(trimmedLink)) {
      setLinkError('Please enter a valid URL')
    }
  }

  const handleLinkChange = (e) => {
    const { value } = e.target
    const trimmedLink = value.trim()
    handleChange('links', 'url', value)
    setLinkError('')
    if (trimmedLink.length > 1024) {
      setLinkError('Input must be 1024 characters')
    } else {
      setLinkError('')
    }
  }

  const handleLinkAdd = () => {
    const result = { url: links?.url, name: links?.name }
    updateLinks({
      variables: {
        id,
        sbomId,
        urls: filterUrls?.length > 0 ? [result, ...filterUrls] : [result]
      }
    }).then((res) => {
      if (res?.data) {
        saveChanges()
        showToast({
          description: 'Links updated successfully',
          status: 'success'
        })
      }
    })
    setTabData((prev) => ({ ...prev, links: { name: '', url: '' } }))
    setActiveLink(null)
  }

  const checkData = () => {
    const { links, ...rest } = unsavedChanges
    return Object.values(rest).some((value) => value === true)
  }

  const handleSubmit = () => {
    if (checkData()) {
      setAlert(true)
    } else {
      handleLinkAdd()
    }
  }

  const onDelete = (data) => {
    setActiveLink(data)
  }

  const handleLinkRemove = () => {
    const updatedList = filterUrls?.filter(
      (url) => url?.name !== activeLink?.name
    )
    updateLinks({
      variables: {
        id,
        sbomId,
        urls: updatedList
      }
    })
  }

  const isInvalid =
    !validateUrl(links?.url.trim()) ||
    error !== '' ||
    linkError !== '' ||
    loading

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
          <Select
            fontSize={'sm'}
            value={links?.name}
            onChange={handleTypeChange}
          >
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
            (links?.url !== '' && !validateUrl(links?.url?.trim())) ||
            containsSpace
          }
        >
          <FormLabel>Link</FormLabel>
          <Input
            fontSize={'sm'}
            value={links?.url}
            placeholder='Add URL'
            onBlur={handleCheckUrl}
            onChange={handleLinkChange}
          />
          <FormErrorMessage>{linkError}</FormErrorMessage>
        </FormControl>
        {alert ? (
          <Stack spacing={4}>
            <LynkAlert
              status='warning'
              msg='Saving will apply changes to this tab only. save other tabs separately to retain their data.'
            />
            <ActionButton
              title={'Save Link'}
              isDisabled={isInvalid}
              onClick={handleLinkAdd}
            />
          </Stack>
        ) : (
          <ActionButton
            title={'Add Link'}
            leftIcon={<AddIcon />}
            isDisabled={isInvalid}
            onClick={handleSubmit}
          />
        )}
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
                            {truncatedValue(item.url, 45)}
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
                            isDisabled={loading}
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
