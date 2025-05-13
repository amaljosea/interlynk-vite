import { gql, useMutation, useQuery } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { useContext, useState } from 'react'
import { hasWhiteSpace, validateUrl } from 'utils/formValidationUtils'
import { componentLinkTypes } from 'variables/general'

import {
  Divider,
  Flex,
  Grid,
  GridItem,
  Input,
  Stack,
  Text
} from '@chakra-ui/react'
import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/react'

import ConfirmDeleteButton from 'components/ConfirmDeleteButton'
import LynkAlert from 'components/LynkAlert'
import LynkSelect from 'components/LynkSelect'

import useCustomToast from 'hooks/useCustomToast'
import { useThemeColor } from 'hooks/useThemeColors'

import { UpdateCompLinks } from 'graphQL/Mutation'

import { FaPlus } from 'react-icons/fa6'

import ActionButton from './ActionButton'
import { LuCirclePlus } from 'react-icons/lu'

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
    setAlert,
    alertMessage,
    alertMessageSetter
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

  const { secondaryTextInverse, sameSecondaryText, grayBorderColor } =
    useThemeColor([
      'secondaryTextInverse',
      'sameSecondaryText',
      'grayBorderColor'
    ])

  const [error, setError] = useState('')
  const [linkError, setLinkError] = useState('')

  const [updateLinks, { loading }] = useMutation(UpdateCompLinks)

  const containsSpace = hasWhiteSpace(links?.url)

  const handleTypeChange = (selectedItem) => {
    handleChange('links', 'name', selectedItem)
    const isExists =
      externalUrls?.length > 0 &&
      externalUrls?.some((item) => item.name === selectedItem)
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
        saveChanges('links')
        showToast({
          description: 'Link added successfully',
          status: 'success'
        })
      }
    })
    setTabData((prev) => ({ ...prev, links: { name: '', url: '' } }))
  }

  const checkData = () => {
    // eslint-disable-next-line no-unused-vars
    const { links, ...rest } = unsavedChanges
    alertMessageSetter(rest)
    return Object.values(rest).some((value) => value === true)
  }

  const handleSubmit = () => {
    handleLinkAdd()
    if (checkData()) {
      setAlert(true)
    }
  }

  const handleLinkRemove = (activeLinkName) => {
    const updatedList = filterUrls?.filter(
      (url) => url?.name !== activeLinkName
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

  const container = {
    pb: 2,
    w: '100%',
    templateColumns: 'repeat(12, 1fr)',
    borderBottom: `1px solid ${grayBorderColor}`
  }

  const typeOptions = [
    { label: '-- Select --', value: '' },
    ...componentLinkTypes.map((item) => ({
      value: item,
      label: item
    }))
  ]

  const selectStyles = {
    menuList: (base) => ({
      ...base,
      minHeight: '300px'
    })
  }

  return (
    <>
      <Flex
        w={'100%'}
        gap={4}
        direction={'column'}
        alignItems={'flex-start'}
        minHeight='400px'
      >
        {alert && <LynkAlert status='warning' msg={alertMessage} />}
        {/* NAME */}
        <FormControl isRequired isInvalid={error}>
          <FormLabel>Type</FormLabel>
          <LynkSelect
            onChange={(selectedOption) =>
              handleTypeChange(selectedOption?.value)
            }
            value={typeOptions.find((option) => option.value === links?.name)}
            options={typeOptions}
            placeholder='-- Select --'
            dropDown
            styles={selectStyles}
          />

          <FormErrorMessage data-testid='link_type_error'>
            {error}
          </FormErrorMessage>
        </FormControl>
        {/* URL */}
        <FormControl
          isRequired
          isInvalid={
            (linkError !== '' &&
              links?.url !== '' &&
              !validateUrl(links?.url?.trim())) ||
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
        <ActionButton
          title={'Add Link'}
          isDisabled={isInvalid}
          onClick={alert ? handleLinkAdd : handleSubmit}
          icon={<LuCirclePlus size={18} />}
        />
        <Divider />
        {/* TABLE */}
        <Flex mb={4} width={'100%'} flexDir={'column'}>
          <Text fontWeight={'medium'} color={secondaryTextInverse}>
            Existing Links
          </Text>
          {externalUrls?.length > 0 ? (
            <Stack w={'100%'} spacing={3} mt={4}>
              {externalUrls?.map((item, index) => (
                <Grid {...container} key={index}>
                  <GridItem colSpan={8}>
                    {item?.url ? (
                      <Text
                        fontSize={'sm'}
                        lineHeight={'5'}
                        wordBreak={'break-all'}
                      >
                        {item.url}
                      </Text>
                    ) : (
                      <Text>N/A</Text>
                    )}
                    <Text fontSize={'sm'} color={sameSecondaryText}>
                      {item?.name}
                    </Text>
                  </GridItem>
                  <GridItem colSpan={4} justifyContent={'flex-end'}>
                    <Flex alignItems={'center'} justifyContent={'flex-end'}>
                      <ConfirmDeleteButton
                        itemId={item.name}
                        deleteBtnProps={{
                          'data-testid': 'delete_comp_link'
                        }}
                        customDeleteFunction={handleLinkRemove}
                        customDeleteVariable={item.name}
                        loading={loading}
                      />
                    </Flex>
                  </GridItem>
                </Grid>
              ))}
            </Stack>
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
