import { useMutation } from '@apollo/client'
import React, { useCallback, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { customStyles } from 'utils'

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
  useDisclosure
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import SearchFilter from 'components/Licenses/LicenseSearchFilter'

import { RequestCancel, RequestResend } from 'graphQL/Mutation'

import { FaEllipsisV } from 'react-icons/fa'
import { FaPlus } from 'react-icons/fa6'

import Filters from './Filters'
import RequestAcceptModal from './RequestAcceptModal'
import RequestModal from './RequestModal'

const RequestTable = ({ data, loading, filters, setFilters, refetch }) => {
  const [resendRequest] = useMutation(RequestResend)
  const [cancelRequest] = useMutation(RequestCancel)

  const { field, search } = filters
  const { isOpen, onOpen, onClose } = useDisclosure()

  const {
    isOpen: isAcceptOpen,
    onOpen: onAcceptOpen,
    onClose: onAcceptClose
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
  }, [])

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
          <Filters setFilters={setFilters} />
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
    })
  }

  const handleCancel = (row) => {
    cancelRequest({
      variables: {
        id: row.id
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
      selector: (row) => <Text>{row?.email}</Text>
    },
    {
      id: 'PRODUCT',
      name: 'PRODUCT',
      selector: (row) => {
        return (
          <Stack my={4}>
            <Text>{row?.productName}</Text>
            <Text>{row?.productVersion}</Text>
          </Stack>
        )
      },
      wrap: true
    },
    {
      id: 'REQUESTED',
      name: 'REQUESTED',
      selector: (row) => <Text my={4}>{row?.requestedAt}</Text>,
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
                <MenuItem onClick={() => handleAccept(row)}>Accept</MenuItem>
                <MenuItem onClick={() => handleResend(row)}>Resend</MenuItem>
                <MenuItem onClick={() => handleCancel(row)}>Cancel</MenuItem>
                <MenuItem>Review</MenuItem>
                <MenuItem color='red'>Archive</MenuItem>
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
          customStyles={customStyles}
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

        {/* PAGINATION */}
        {/* <Pagination {...paginationProps} /> */}
      </Flex>

      {isOpen && <RequestModal isOpen={isOpen} onClose={onClose} data={null} />}
      {isAcceptOpen && (
        <RequestAcceptModal
          isOpen={isAcceptOpen}
          onClose={onAcceptClose}
          data={activeRow}
        />
      )}
    </>
  )
}

export default RequestTable
