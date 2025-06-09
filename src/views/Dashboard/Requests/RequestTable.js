import { useMutation } from '@apollo/client'
import React, { useCallback, useMemo, useState } from 'react'
import { getFullDate, timeSince } from 'utils'
import { getStatusColor } from 'utils/styleUtils'

import { Flex, Menu, Portal, Stack, Text } from '@chakra-ui/react'
import { Tooltip, useDisclosure } from '@chakra-ui/react'
import { Tag, TagLabel } from '@chakra-ui/react'
import { MenuItem, MenuList } from '@chakra-ui/react'

import AddButton from 'components/Icons/AddButton'
import RefreshBtn from 'components/Icons/RefreshBtn'
import SearchFilter from 'components/Licenses/LicenseSearchFilter'
import LynkTable from 'components/LynkTable'
import LynkAction from 'components/Misc/LynkAction'

import useCustomToast from 'hooks/useCustomToast'
import { useHasPermission } from 'hooks/useHasPermission'
import { useThemeColor } from 'hooks/useThemeColors'

import { RequestCancel, RequestResend } from 'graphQL/Mutation'

import Pagination from '../../../components/Pagination'
import ConfirmationModal from '../Products/components/ConfirmationModal'
import Filters from './Filters'
import RequestAcceptModal from './RequestAcceptModal'
import RequestModal from './RequestModal'

const RequestTable = (props) => {
  const { data, loading, filters, setFilters, paginationProps } = props

  const { showToast } = useCustomToast()

  const addReq = useHasPermission({
    parentKey: 'view_requests',
    childKey: 'edit_requests'
  })

  const { primaryTextColor, primaryErrorColor } = useThemeColor([
    'primaryTextColor',
    'primaryErrorColor'
  ])

  const [resendRequest] = useMutation(RequestResend)
  const [cancelRequest] = useMutation(RequestCancel)

  const { search } = filters
  const { isOpen, onOpen, onClose } = useDisclosure()

  const {
    isOpen: isAcceptOpen,
    onOpen: onAcceptOpen,
    onClose: onAcceptClose
  } = useDisclosure()

  const {
    isOpen: isWarningOpen,
    onOpen: onWarningOpen,
    onClose: onWarningClose
  } = useDisclosure()

  const [filterText, setFilterText] = useState(search || '')
  const [activeRow, setActiveRow] = useState(null)

  const setSearchFilter = useCallback(
    (value) => {
      setFilters((oldFilter) => ({
        ...oldFilter,
        search: value
      }))
    },
    [setFilters]
  )

  // CLEAR SERACH
  const handleClear = useCallback(() => {
    setFilterText('')
    setFilters((oldFilter) => ({
      ...oldFilter,
      search: undefined
    }))
  }, [setFilters])

  // SEARCH COMPONENT
  const handleSearch = useCallback(
    (event) => {
      const {
        key,
        target: { value }
      } = event
      if (key === 'Enter') {
        setSearchFilter(value)
      }
    },
    [setSearchFilter]
  )

  const onSearchInputChange = useCallback(
    (e) => {
      const { value } = e.target
      if (value === '') {
        handleClear()
      } else {
        setFilterText(value)
      }
    },
    [handleClear]
  )

  const handleSort = async (column, sortDirection) => {
    if (column && column.id && sortDirection) {
      setFilters((oldFilters) => ({
        ...oldFilters,
        field: column?.id,
        direction: sortDirection.toUpperCase()
      }))
    }
  }

  // SUB HEADER
  const subHeader = useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Stack spacing={3} alignItems={'center'} direction={'row'}>
          {/* SEARCH COMPONENTS */}
          <SearchFilter
            id='support'
            filterText={filterText}
            onChange={onSearchInputChange}
            onClear={handleClear}
            onFilter={handleSearch}
          />
          {/* FILTERS */}
          <Filters setFilters={setFilters} />
        </Stack>
        <Stack spacing={2} alignItems={'center'} direction={'row'}>
          <AddButton
            label='Request SBOM'
            isDisabled={!addReq}
            onClick={() => {
              setActiveRow(null)
              onOpen()
            }}
            aria-label='request_sbom'
          />
          <RefreshBtn />
        </Stack>
      </Flex>
    )
  }, [
    addReq,
    filterText,
    handleClear,
    handleSearch,
    onOpen,
    onSearchInputChange,
    setFilters
  ])

  const handleResend = (row) => {
    resendRequest({
      variables: {
        id: row.id
      }
    }).then((res) => {
      if (res?.data?.requestResend?.errors?.length === 0) {
        showToast({
          description: 'Request Resent',
          status: 'success'
        })
      }
    })
  }

  const handleCancel = (row) => {
    cancelRequest({
      variables: {
        id: row.id
      }
    }).then((res) => {
      if (res?.data?.requestCancel?.errors?.length === 0) {
        showToast({
          description: 'Request Canceled',
          status: 'success'
        })
      }
    })
  }

  const handleAccept = (row) => {
    onAcceptOpen()
    setActiveRow(row)
  }

  // COLUMNS
  const columns = [
    {
      id: 'EMAIL',
      name: 'EMAIL',
      selector: (row) => (
        <Text fontSize={14} color={primaryTextColor} data-testid='request_id'>
          {row?.email}
        </Text>
      )
    },
    {
      id: 'PRODUCT',
      name: 'PRODUCT',
      selector: (row) => {
        return (
          <Stack my={4}>
            <Text fontSize={14} color={primaryTextColor}>
              {row?.productName}
            </Text>
            <Text color={primaryTextColor}>{row?.productVersion}</Text>
          </Stack>
        )
      },
      wrap: true
    },
    {
      id: 'REQUESTED',
      name: 'REQUESTED',
      selector: (row) => (
        <Tooltip label={getFullDate(row?.requestedAt)} placement={'top'}>
          <Text fontSize={14} color={primaryTextColor}>
            {timeSince(row?.requestedAt)}
          </Text>
        </Tooltip>
      ),
      wrap: true
    },
    {
      id: 'RESPONDED',
      name: 'RESPONDED',
      selector: (row) => {
        const { uploadedAt } = row
        return (
          <Tooltip placement={'top'} label={getFullDate(row?.uploadedAt)}>
            <Text fontSize={14} color={primaryTextColor}>
              {uploadedAt ? timeSince(row?.uploadedAt) : ''}
            </Text>
          </Tooltip>
        )
      },
      wrap: true
    },
    {
      id: 'STATUS',
      name: 'STATUS',
      selector: (row) => (
        <Tag colorScheme={getStatusColor(row?.status)} width={'100px'}>
          <TagLabel mx={'auto'}>{row?.status}</TagLabel>
        </Tag>
      ),
      width: '10%',
      wrap: true
    },
    {
      id: 'ACTION',
      name: 'ACTION',
      selector: (row) => {
        return (
          <Menu>
            <LynkAction aria-label={`req action for ${row?.email}`} />
            <Portal>
              <MenuList fontSize={'sm'}>
                <MenuItem
                  isDisabled={!row.blob || !addReq}
                  onClick={() => handleAccept(row)}
                  hidden={row.status === 'Accepted'}
                >
                  Accept
                </MenuItem>
                <MenuItem
                  isDisabled={!addReq}
                  aria-label={`resend req ${row?.email}`}
                  onClick={() => handleResend(row)}
                >
                  Resend
                </MenuItem>
                <MenuItem
                  isDisabled={
                    !addReq ||
                    row.blob ||
                    row.status === 'Canceled' ||
                    row.status === 'Declined'
                  }
                  aria-label={`cancel req ${row?.email}`}
                  color={primaryErrorColor}
                  onClick={() => {
                    onWarningOpen()
                    setActiveRow(row)
                  }}
                >
                  Cancel
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        )
      },
      right: 'true'
    }
  ]

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <LynkTable
          columns={columns}
          data={data}
          onSort={handleSort}
          defaultSortFieldId='REQUESTS_REQUESTED_AT'
          progressPending={loading}
          persistTableHead
          subHeader
          subHeaderComponent={subHeader}
        />
      </Flex>

      <Pagination {...paginationProps} />

      {isOpen && <RequestModal isOpen={isOpen} onClose={onClose} data={null} />}

      {isAcceptOpen && (
        <RequestAcceptModal
          isOpen={isAcceptOpen}
          onClose={onAcceptClose}
          data={activeRow}
        />
      )}

      {isWarningOpen && (
        <ConfirmationModal
          isOpen={isWarningOpen}
          onClose={onWarningClose}
          title='Cancel Request'
          description={`This will cancel the request by ${activeRow.email}`}
          onConfirm={() => {
            handleCancel(activeRow)
            onWarningClose()
          }}
        />
      )}
    </>
  )
}

export default RequestTable
