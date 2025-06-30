import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import { truncatedValue } from 'utils'
import { hasWhiteSpace, validateUrl } from 'utils/formValidationUtils'

import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Stack,
  Tag,
  Text,
  Tooltip
} from '@chakra-ui/react'

import ConfirmDeleteButton from 'components/ConfirmDeleteButton'
import LynkDrawer from 'components/LynkDrawer'
import LynkSelect from 'components/LynkSelect'

import { useThemeColor } from 'hooks/useThemeColors'

import {
  ComponentVulnUpdate,
  DispositionByParentUpdate
} from 'graphQL/Mutation'

const VulnLinkDrawer = ({ data, isOpen, onClose }) => {
  const { id, sbomId, externalUrls, currentExternalUrls, vuln, isPart } =
    data || {}
  const [type, setType] = useState('')
  const [link, setLink] = useState('')
  const [externalData, setExternalData] = useState([])
  const [currentData, setCurrentData] = useState([])
  const [error, setError] = useState('')
  const [linkError, setLinkError] = useState('')

  const [addUrls, { loading }] = useMutation(ComponentVulnUpdate, {
    refetchQueries: ['GetVulnProductDetails']
  })
  const [addPartsUrls] = useMutation(DispositionByParentUpdate, {
    refetchQueries: ['GetVulnProductDetails']
  })

  const { secondaryTextInverse, sameSecondaryText, grayBorderColor } =
    useThemeColor([
      'secondaryTextInverse',
      'sameSecondaryText',
      'grayBorderColor'
    ])

  const containsSpace = hasWhiteSpace(link)

  const handleTypeChange = (selectedItem) => {
    const { value } = selectedItem
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

  const DeleteAction = ({ id }) => (
    <ConfirmDeleteButton
      deleteBtnProps={{
        'data-testid': 'delete_vuln_link',
        hidden: isPart
      }}
      handleDelete={handleLinkRemove}
      itemId={id}
    />
  )

  const isDisabled =
    !validateUrl(link.trim()) || linkError !== '' || error !== '' || !type

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

  const typeOptions = [
    { label: '-- Select --', value: '' },
    { label: 'Issue Tracker', value: 'issue-tracker' },
    { label: 'Advisories', value: 'advisories' },
    { label: 'Documentation', value: 'documentation' },
    { label: 'Other', value: 'other' }
  ]

  const vulnLinks = [...(externalData || []), ...(currentData || [])]

  const divider =
    vulnLinks.length === 1 ? `none` : `1px solid ${grayBorderColor}`

  //
  return (
    <LynkDrawer
      title={'Edit Links'}
      subtitle={data && <Tag colorScheme='blue'>{vuln?.vulnId}</Tag>}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSave}
      isLoading={loading}
    >
      <form onSubmit={handleLinkAdd}>
        <Flex
          alignItems={'flex-start'}
          sx={{ mt: 4, gap: 3, flexDir: 'column' }}
        >
          {/* NAME */}
          <FormControl isRequired isInvalid={error !== ''}>
            <FormLabel>Type</FormLabel>
            <LynkSelect
              value={typeOptions.find((option) => option.value === type)}
              onChange={(selectedOption) => handleTypeChange(selectedOption)}
              options={typeOptions}
              dropDown
            />

            <FormErrorMessage data-testid='vuln_link_error'>
              {error}
            </FormErrorMessage>
          </FormControl>
          {/* URL */}
          <FormControl
            isRequired
            isInvalid={
              (linkError !== '' && link !== '' && !validateUrl(link.trim())) ||
              containsSpace
            }
          >
            <FormLabel>Link</FormLabel>
            <Input
              value={link}
              fontSize={'sm'}
              placeholder='Add URL'
              onBlur={handleCheckUrl}
              onChange={handleLinkChange}
            />
            <FormErrorMessage>{linkError}</FormErrorMessage>
          </FormControl>
          {/* ACTIONS */}
          <Button
            type='submit'
            title='Add link'
            colorScheme='blue'
            isDisabled={isDisabled}
          >
            Add
          </Button>
          {/* TABLE */}
          <Flex width={'100%'} flexDir={'column'}>
            <Text size='md' my={2}>
              Existing Links
            </Text>
            {vulnLinks.length > 0 ? (
              <Stack mt={4} spacing={3}>
                {vulnLinks.map((item) => (
                  <Flex
                    pb={2}
                    align='flex-center'
                    borderBottom={divider}
                    justify='space-between'
                    key={item?.id || item?.url}
                  >
                    <Stack spacing={0} flex='1' minW='0'>
                      {item?.url && (
                        <Tooltip label={item.url}>
                          <Text w={'fit-content'} wordBreak='break-all'>
                            {truncatedValue(item.url, 45)}
                          </Text>
                        </Tooltip>
                      )}
                      {item?.name && (
                        <Text color={sameSecondaryText}>{item.name}</Text>
                      )}
                    </Stack>
                    <DeleteAction id={item?.id} />
                  </Flex>
                ))}
              </Stack>
            ) : (
              <Text mt={4} color={secondaryTextInverse}>
                No existing links
              </Text>
            )}
          </Flex>
        </Flex>
      </form>
    </LynkDrawer>
  )
}

export default VulnLinkDrawer
