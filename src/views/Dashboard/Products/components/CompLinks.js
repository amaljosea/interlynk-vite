import { gql, useMutation, useQuery } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { useContext, useState } from 'react'
import { hasWhiteSpace, validateUrl } from 'utils/formValidationUtils'
import { componentLinkTypes } from 'variables/general'

import { DeleteIcon } from '@chakra-ui/icons'
import {
  Divider,
  Flex,
  Grid,
  GridItem,
  IconButton,
  Input,
  Stack,
  Text
} from '@chakra-ui/react'
import { Button, ButtonGroup } from '@chakra-ui/react'
import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'
import LynkSelect from 'components/LynkSelect'

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

  const {
    secondaryTextInverse,
    sameSecondaryText,
    primaryErrorColor,
    grayBorderColor
  } = useThemeColor([
    'secondaryTextInverse',
    'sameSecondaryText',
    'primaryErrorColor',
    'grayBorderColor'
  ])

  const [error, setError] = useState('')
  const [activeLink, setActiveLink] = useState(null)
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
    setActiveLink(null)
  }

  const checkData = () => {
    // eslint-disable-next-line no-unused-vars
    const { links, ...rest } = unsavedChanges
    alertMessageSetter(rest)
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
        <Stack spacing={alert ? 4 : 0}>
          {alert && <LynkAlert status='warning' msg={alertMessage} />}
          <ActionButton
            title={'Save'}
            isDisabled={isInvalid}
            onClick={alert ? handleLinkAdd : handleSubmit}
          />
        </Stack>
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
