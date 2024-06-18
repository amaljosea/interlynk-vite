import { useMutation } from '@apollo/client'
import React, { useCallback, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { customStyles, getFullDateAndTime, timeSince } from 'utils'

import { RepeatIcon } from '@chakra-ui/icons'
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
  useColorModeValue,
  useDisclosure,
  useToast
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import SearchFilter from 'components/Licenses/LicenseSearchFilter'

import { RequestCancel, RequestResend } from 'graphQL/Mutation'

import { FaEllipsisV } from 'react-icons/fa'
import { FaPlus } from 'react-icons/fa6'

import Pagination from '../../../components/Pagination'
import Filters from './Filters'
import RequestAcceptModal from './RequestAcceptModal'
import RequestModal from './RequestModal'
import WarningModal from './WarningModal'

const RequestTable = ({
  data,
  loading,
  filters,
  setFilters,
  refetch,
  paginationProps
}) => {
  const toast = useToast()
  const headColor = useColorModeValue('#4A5568', '#CBD5E0')
  const textColor = useColorModeValue('#1A202C', '#F7FAFC')

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

  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])

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
              colorScheme='blue'
              onClick={() => {
                setActiveRow(null)
                onOpen()
              }}
              icon={<FaPlus />}
            />
          </Tooltip>
          <Tooltip label='Refresh'>
            <IconButton
              colorScheme='blue'
              onClick={handleRefresh}
              icon={<RepeatIcon />}
            />
          </Tooltip>
        </Stack>
      </Flex>
    )
  }, [
    data,
    filterText,
    handleClear,
    handleRefresh,
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
        toast({
          description: 'Request Resent',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top'
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
        toast({
          description: 'Request Cancelled',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top'
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
      selector: (row) => <Text color={textColor}>{row?.email}</Text>
    },
    {
      id: 'PRODUCT',
      name: 'PRODUCT',
      selector: (row) => {
        return (
          <Stack my={4}>
            <Text color={textColor}>{row?.productName}</Text>
            <Text color={textColor}>{row?.productVersion}</Text>
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
          <Text color={textColor}>{timeSince(row?.requestedAt)}</Text>
        </Tooltip>
      ),
      wrap: true
    },
    {
      id: 'RESPONDED',
      name: 'RESPONDED',
      selector: (row) => (
        <>
          {row?.uploadedAt ? (
            <Tooltip
              label={getFullDateAndTime(row?.uploadedAt)}
              placement={'top'}
            >
              {timeSince(row?.uploadedAt)}
            </Tooltip>
          ) : (
            <Text color={textColor}>...</Text>
          )}
        </>
      ),
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
              color='gray.400'
            />
            <Portal>
              <MenuList fontSize={'sm'}>
                <MenuItem
                  isDisabled={!row.blob}
                  onClick={() => handleAccept(row)}
                >
                  Accept
                </MenuItem>
                <MenuItem onClick={() => handleResend(row)}>Resend</MenuItem>
                <MenuItem
                  isDisabled={
                    row.blob ||
                    row.status === 'Canceled' ||
                    row.status === 'Declined'
                  }
                  color='red'
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
          customStyles={customStyles(headColor)}
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
        <WarningModal
          isOpen={isWarningOpen}
          onClose={onWarningClose}
          handleCancel={handleCancel}
          row={activeRow}
        />
      )}
    </>
  )
}

export default RequestTable
