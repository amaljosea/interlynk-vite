import { useMutation, useQuery } from '@apollo/client'
import { useMemo, useState } from 'react'
import { getFullDate, timeSince, truncatedValue } from 'utils'
import { getShareLinklUrl } from 'utils/url'

import {
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Stack,
  Tag,
  Text,
  Tooltip,
  useClipboard
} from '@chakra-ui/react'

import ConfirmDeleteButton from 'components/ConfirmDeleteButton'
import AddButton from 'components/Icons/AddButton'
import CopyButton from 'components/Icons/CopyButton'
import LynkDate from 'components/LynkDate'
import LynkDrawer from 'components/LynkDrawer'
import LynkTable from 'components/LynkTable'

import useCustomToast from 'hooks/useCustomToast'
import { useThemeColor } from 'hooks/useThemeColors'

import { CreateShareLynk, DeleteSharelynk } from 'graphQL/Mutation'
import { GetSharelynks } from 'graphQL/Queries'

import { LuFileSymlink } from 'react-icons/lu'

const ShareLynkDrawer = ({ isOpen, onClose, prodData }) => {
  const { showToast } = useCustomToast()

  const BACKEND_URL = process.env.REACT_APP_SERVER

  const { name, id: groupId } = prodData || {}

  const { primaryTextColor } = useThemeColor(['primaryTextColor'])

  const defaultDate = new Date()
  defaultDate.setDate(defaultDate.getDate() + 90)

  const [selectedDate, setSelectedDate] = useState('')
  const [isValidDate, setIsValidDate] = useState(true)
  const [noExpire, setNoExpire] = useState(false)
  const [show, setShow] = useState(false)

  const [createLynk, { loading: createLoading }] = useMutation(
    CreateShareLynk,
    { refetchQueries: ['GetSharelynks'] }
  )
  const [deleteLynk, { loading: deleteLoading }] = useMutation(
    DeleteSharelynk,
    { refetchQueries: ['GetSharelynks'] }
  )

  const { data, loading } = useQuery(GetSharelynks, {
    skip: isOpen ? false : true,
    fetchPolicy: 'network-only',
    variables: {
      ids: [groupId]
    }
  })
  const { nodes } = data?.shareLynks || {}

  const svgLink = useClipboard(
    `${BACKEND_URL}/api/v1/badges?type=hcard&project_group_id=${groupId}`
  )

  const onToggle = useMemo(
    () => (value) => {
      setNoExpire(false)
      setIsValidDate(true)
      setSelectedDate(null)
      setShow(value)
    },
    []
  )

  const handleDateChange = (newDate) => {
    const currentDate = new Date()
    const isValidDate = newDate && !isNaN(newDate) && newDate?._d > currentDate
    setSelectedDate(newDate._d)
    if (isValidDate) {
      setIsValidDate(true)
    } else {
      if (typeof newDate === 'string' && newDate === '') {
        setIsValidDate(true)
      } else {
        setIsValidDate(false)
      }
    }
  }

  const handleExpireChange = (e) => {
    const { checked } = e.target
    setNoExpire(checked)
    setIsValidDate(true)
    if (checked === true) {
      setSelectedDate('')
    } else {
      setSelectedDate(defaultDate)
    }
  }

  const handleCreateLynk = () => {
    createLynk({
      variables: {
        enabled: true,
        id: [groupId],
        expiresAt: noExpire ? undefined : new Date(selectedDate).toISOString()
      }
    }).then(() => onToggle(false))
  }

  const handleDeleteLynk = (id) => {
    deleteLynk({
      variables: { id: id }
    }).then((res) => {
      if (res?.data?.shareLynkDelete?.error?.length > 0) {
        showToast({
          description: res?.data?.shareLynkDelete?.error[0],
          status: 'error'
        })
      } else {
        showToast({
          description: 'Lynk Delete',
          status: 'success'
        })
      }
    })
  }

  const isDisabled =
    (selectedDate !== '' && !isValidDate) ||
    (!selectedDate && noExpire === false)

  // HEADER SECTION
  const subHeader = useMemo(() => {
    const onCopySvg = () => {
      svgLink.onCopy()
      showToast({ description: 'SVG link copied' })
    }

    return (
      <Flex gap={2} alignItems={'center'} justifyContent={'flex-end'}>
        {nodes?.length > 0 && (
          <Tooltip label='SVG Link' placement='left'>
            <Box>
              <CopyButton
                size={'md'}
                onCopy={onCopySvg}
                hasCopied={svgLink?.hasCopied}
                icon={<LuFileSymlink size={18} />}
                colorScheme={{ copied: 'green', default: 'blue' }}
              />
            </Box>
          </Tooltip>
        )}
        <AddButton
          label='Add ShareLynk'
          tooltipPlacement='left'
          aria-label='add_sharelynk'
          onClick={() => onToggle(true)}
        />
      </Flex>
    )
  }, [svgLink, nodes?.length, showToast, onToggle])

  // COLUMNS
  const columns = [
    // URL
    {
      id: 'SIGNED_URL',
      name: 'LINK',
      selector: (row) => {
        const { enabled, contents } = row
        const projectGroup = contents[0]
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const sbomLink = useClipboard(
          getShareLinklUrl({
            signedUrlParams: row?.signedUrlParams,
            productgroupid: projectGroup.id,
            productid: projectGroup.defaultProject.id
          })
        )
        return (
          <Flex my={4} gap={2} alignItems={'center'}>
            <CopyButton
              size={'md'}
              isDisabled={!enabled}
              hasCopied={sbomLink?.hasCopied}
              onCopy={() => sbomLink.onCopy()}
              colorScheme={{ copied: 'green', default: 'blue' }}
            />
            <Input
              isReadOnly
              w={'290px'}
              fontSize={'sm'}
              aria-label='lynk_url'
              color={primaryTextColor}
              defaultValue={sbomLink?.value || ''}
            />
          </Flex>
        )
      },
      width: '55%',
      wrap: true
    },
    // UPDATED AT
    {
      id: 'UPDATED_AT',
      name: 'UPDATED',
      selector: (row) => (
        <Tooltip label={getFullDate(row?.updatedAt)} placement={'top'}>
          <Text color={primaryTextColor} textAlign={'right'}>
            {timeSince(row?.updatedAt)}
          </Text>
        </Tooltip>
      ),
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a.updatedAt)
        const dateB = new Date(b.updatedAt)
        return dateA - dateB // Sort in descending order
      },
      width: '25%',
      right: 'true',
      wrap: true
    },
    // ACTION
    {
      id: 'ACTION',
      name: 'ACTION',
      selector: (row) => (
        <ConfirmDeleteButton
          itemId={row.id}
          handleDelete={handleDeleteLynk}
          loading={deleteLoading}
        />
      ),
      right: 'true'
    }
  ]

  const SubTitle = () => {
    return (
      <Tag colorScheme='blue' wordBreak={'break-all'}>
        {name ? truncatedValue(name, 20) : ''}
      </Tag>
    )
  }

  return (
    <LynkDrawer
      noFooter
      size='lg'
      isOpen={isOpen}
      onClose={onClose}
      title={'ShareLynks'}
      subtitle={<SubTitle />}
    >
      <Stack hidden={!show} mt={1} spacing={3}>
        <FormControl isInvalid={!isValidDate} hidden={noExpire}>
          <FormLabel htmlFor='expire'>Expiration Date</FormLabel>
          <LynkDate
            key={selectedDate}
            value={selectedDate}
            onChange={handleDateChange}
          />
          {!isValidDate && (
            <FormErrorMessage>
              Please enter a valid expiry date
            </FormErrorMessage>
          )}
        </FormControl>
        <FormControl>
          <Checkbox isChecked={noExpire} onChange={handleExpireChange}>
            No Expiration
          </Checkbox>
        </FormControl>
        <Flex gap={2} justifyContent={'flex-end'} alignItems={'center'}>
          <Button fontSize={'sm'} onClick={() => onToggle(false)}>
            Cancel
          </Button>
          <Button
            fontSize={'sm'}
            colorScheme='blue'
            isDisabled={isDisabled}
            isLoading={createLoading}
            onClick={handleCreateLynk}
            aria-label='save_sharelynk'
          >
            Add
          </Button>
        </Flex>
      </Stack>
      <Divider hidden={!show} my={4} />
      <LynkTable
        subHeader={!show}
        columns={columns}
        data={nodes || []}
        defaultSortAsc={false}
        progressPending={loading}
        subHeaderComponent={subHeader}
        defaultSortFieldId={'UPDATED_AT'}
      />
    </LynkDrawer>
  )
}

export default ShareLynkDrawer
