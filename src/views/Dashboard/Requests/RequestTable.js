import { useMutation } from '@apollo/client'
import React, { useCallback, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { customStyles, getFullDateAndTime, timeSince } from 'utils'

import {
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Stack,
  Tag,
  TagLabel,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import RefreshBtn from 'components/Icons/RefreshBtn'
import SearchFilter from 'components/Licenses/LicenseSearchFilter'

import useCustomToast from 'hooks/useCustomToast'
import { useHasPermission } from 'hooks/useHasPermission'
import { useThemeColor } from 'hooks/useThemeColors'

import { RequestCancel, RequestResend } from 'graphQL/Mutation'

import { FaEllipsisV } from 'react-icons/fa'
import { FaPlus } from 'react-icons/fa6'

import Pagination from '../../../components/Pagination'
import ConfirmationModal from '../Products/components/ConfirmationModal'
import Filters from './Filters'
import RequestAcceptModal from './RequestAcceptModal'
import RequestModal from './RequestModal'

const RequestTable = ({
  data,
  loading,
  filters,
  setFilters,
  paginationProps
}) => {
  const { showToast } = useCustomToast()

  const addReq = useHasPermission({
    parentKey: 'view_requests',
    childKey: 'create_request'
  })

  const {
    headingTextColor,
    primaryTextColor,
    secondaryTextColor,
    primaryErrorColor
  } = useThemeColor([
    'headingTextColor',
    'primaryTextColor',
    'secondaryTextColor',
    'primaryErrorColor'
  ])

  const [resendRequest] = useMutation(RequestResend)
  const [cancelRequest] = useMutation(RequestCancel)

  const { field, search } = filters
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
    setFilters((oldFilters) => ({
      ...oldFilters,
      field: column?.id,
      direction: sortDirection.toUpperCase()
    }))
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
          <Filters setFilters={setFilters} data={data} />
        </Stack>
        <Stack spacing={2} alignItems={'center'} direction={'row'}>
          <Tooltip label='Request SBOM'>
            <IconButton
              isDisabled={!addReq}
              colorScheme='blue'
              onClick={() => {
                setActiveRow(null)
                onOpen()
              }}
              icon={<FaPlus />}
            />
          </Tooltip>

          <RefreshBtn />
        </Stack>
      </Flex>
    )
  }, [
    data,
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

  const getColor = (status) => {
    switch (status) {
      case 'Sent':
        return 'green'
      case 'Bounced':
        return 'orange'
      case 'Canceled':
        return 'red'
      case 'Uploaded':
        return 'blue'
      case 'Declined':
        return 'red'
      case 'Accepted':
        return 'green'
    }
  }

  // COLUMNS
  const columns = [
    {
      id: 'EMAIL',
      name: 'EMAIL',
      selector: (row) => <Text color={primaryTextColor}>{row?.email}</Text>
    },
    {
      id: 'PRODUCT',
      name: 'PRODUCT',
      selector: (row) => {
        return (
          <Stack my={4}>
            <Text color={primaryTextColor}>{row?.productName}</Text>
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
        <Tooltip label={getFullDateAndTime(row?.requestedAt)} placement={'top'}>
          <Text color={primaryTextColor}>{timeSince(row?.requestedAt)}</Text>
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
          <Tooltip
            placement={'top'}
            label={getFullDateAndTime(row?.uploadedAt)}
          >
            <Text color={primaryTextColor}>
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
        <Tag colorScheme={getColor(row?.status)} width={'100px'}>
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
            <MenuButton
              width={'10%'}
              as={IconButton}
              icon={<FaEllipsisV />}
              variant='none'
              color={secondaryTextColor}
            />
            <Portal>
              <MenuList fontSize={'sm'}>
                <MenuItem
                  isDisabled={!row.blob || !addReq}
                  onClick={() => handleAccept(row)}
                >
                  Accept
                </MenuItem>
                <MenuItem
                  isDisabled={!addReq}
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
        <DataTable
          columns={columns}
          data={data}
          customStyles={customStyles(headingTextColor)}
          onSort={handleSort}
          defaultSortFieldId={field}
          defaultSortAsc={false}
          progressPending={loading}
          persistTableHead
          subHeader
          subHeaderComponent={subHeader}
          progressComponent={<CustomLoader />}
          responsive={true}
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
