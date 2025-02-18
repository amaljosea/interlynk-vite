import { gql, useMutation, useQuery } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { useContext, useState } from 'react'
import { truncatedValue } from 'utils'
import { hasWhiteSpace, validateUrl } from 'utils/formValidationUtils'
import { componentLinkTypes } from 'variables/general'

import { AddIcon, DeleteIcon } from '@chakra-ui/icons'
import {
  Divider,
  Flex,
  IconButton,
  Input,
  Select,
  Stack,
  Text,
  Tooltip
} from '@chakra-ui/react'
import { Table, Tbody, Td, Tr } from '@chakra-ui/react'
import { Button, ButtonGroup } from '@chakra-ui/react'
import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'

import useCustomToast from 'hooks/useCustomToast'
import { useThemeColor } from 'hooks/useThemeColors'

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

  const {
    tab,
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
    skip: tab === 'links' ? false : true,
    variables: { id, sbomId }
  })

  const { externalUrls } = compUrls?.component || ''

  const filterUrls = externalUrls?.map((item) => ({
    name: item?.name,
    url: item?.url || ''
  }))

  const { secondaryTextInverse, sameSecondaryText, primaryErrorColor } =
    useThemeColor([
      'secondaryTextInverse',
      'sameSecondaryText',
      'primaryErrorColor'
    ])

  const [error, setError] = useState('')
  const [activeLink, setActiveLink] = useState(null)
  const [linkError, setLinkError] = useState('')

  const [updateLinks, { loading }] = useMutation(UpdateCompLinks)

  const containsSpace = hasWhiteSpace(links?.url)

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
    // eslint-disable-next-line no-unused-vars
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
    }).then(() => setActiveLink(null))
  }

  const isInvalid =
    !validateUrl(links?.url.trim()) ||
    error !== '' ||
    linkError !== '' ||
    loading

  return (
    <>
      <Flex
        w={'100%'}
        px={6}
        gap={4}
        direction={'column'}
        alignItems={'flex-start'}
      >
        {/* NAME */}
        <FormControl isRequired isInvalid={error}>
          <FormLabel>Type</FormLabel>
          <Select
            fontSize={'sm'}
            value={links?.name}
            onChange={handleTypeChange}
          >
            <option value=''>-- Select --</option>
            {componentLinkTypes?.map((item, index) => (
              <option key={index} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <FormErrorMessage data-testid='link_type_error'>
            {error}
          </FormErrorMessage>
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
              title={'Save'}
              isDisabled={isInvalid}
              onClick={handleLinkAdd}
            />
          </Stack>
        ) : (
          <ActionButton
            title={'Save'}
            leftIcon={<AddIcon />}
            isDisabled={isInvalid}
            onClick={handleSubmit}
          />
        )}
        <Divider />
        {/* TABLE */}
        <Flex mb={4} width={'100%'} flexDir={'column'}>
          <Text fontWeight={'medium'} color={secondaryTextInverse}>
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
                        ) : (
                          'N:A'
                        )}
                      </Text>
                      <Text mt={2} color={sameSecondaryText}>
                        {item?.name}
                      </Text>
                    </Td>
                    <Td px={0} isNumeric>
                      {activeLink?.name === item?.name ? (
                        <ButtonGroup>
                          <Button
                            size='sm'
                            title='No'
                            fontSize={'sm'}
                            variant='outline'
                            onClick={() => setActiveLink(null)}
                          >
                            No
                          </Button>
                          <Button
                            size='sm'
                            title='Yes'
                            fontSize={'sm'}
                            variant='outline'
                            colorScheme='red'
                            isLoading={loading}
                            onClick={handleLinkRemove}
                            data-testid='confirm_delete_comp_link'
                          >
                            Yes
                          </Button>
                        </ButtonGroup>
                      ) : (
                        <IconButton
                          size='sm'
                          color={primaryErrorColor}
                          variant='outline'
                          cursor={'pointer'}
                          icon={<DeleteIcon />}
                          data-testid='delete_comp_link'
                          onClick={() => setActiveLink(item)}
                        />
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <Text mt={4} color={secondaryTextInverse}>
              No record to display
            </Text>
          )}
        </Flex>
      </Flex>
    </>
  )
}

export default CompLinks
