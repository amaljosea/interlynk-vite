import React, { useCallback, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useLocation } from 'react-router-dom'
import { customStyles, getFullDateAndTime, timeSince } from 'utils'
import { ProductDetailsTabs } from 'utils/TabsObjects'
import ChangelogFilterMenu from 'views/Sbom/components/ChangelogFilterMenu'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { RepeatIcon } from '@chakra-ui/icons'
import {
  Flex,
  IconButton,
  Stack,
  Tag,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import UserCard from 'components/Misc/UserCard'

import { usePaginatatedQuery } from 'hooks/usePaginatatedQuery'

import { GetProjectLogs } from 'graphQL/Queries'

import Pagination from '../Pagination'

const setColor = (type) => {
  switch (type) {
    case 'create':
      return 'green'
    case 'created':
      return 'green'
    case 'update':
      return 'blue'
    case 'updated':
      return 'blue'
    case 'modified':
      return 'pink'
    case 'destroyed':
      return 'red'
    case 'rerun':
      return 'purple'
  }
}

const ChangelogTable = ({ activeEnv }) => {
  const headColor = useColorModeValue('#4A5568', '#CBD5E0')
  const textColor = useColorModeValue('#1A202C', '#F7FAFC')

  const [prodLogState, setProdLogState] = useState({
    field: 'ACTIVITY_LOGS_CREATED_AT',
    direction: 'DESC'
  })
  const [searchInput, setSearchInput] = useState('')
  const [activeRow, setActiveRow] = useState('')

  const {
    isOpen: isUserOpen,
    onOpen: onUserOpen,
    onClose: onUserClose
  } = useDisclosure()

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const tab = queryParams.get('tab')

  const { CHANGE_LOG } = ProductDetailsTabs

  const { nodes, paginationProps, refetch, loading, reset } =
    usePaginatatedQuery(GetProjectLogs, {
      fetchPolicy: 'network-only',
      skip: tab === CHANGE_LOG ? false : true,
      selector: 'project.activityLogs',
      variables: {
        id: activeEnv,
        ...prodLogState
      }
    })

  // COLUMNS
  const columns = [
    // CHANGE TYPE
    {
      id: 'ACTIVITY_LOGS_ACTION',
      name: 'TYPE',
      selector: (row) => {
        const { action } = row
        return (
          <Tooltip placement='top' label={action} textTransform={'capitalize'}>
            <Tag
              variant='solid'
              colorScheme={setColor(action)}
              textTransform={'capitalize'}
            >
              {action.slice(0, 1)}
            </Tag>
          </Tooltip>
        )
      },
      width: '8%',
      sortable: true
    },
    // PRIOR VALUE
    {
      id: 'priorValue',
      name: 'PREVIOUS VALUE',
      wrap: true,
      selector: (row) => {
        const { event } = row
        const { orig } = row
        return (
          <Tooltip label={orig} placement='top'>
            <Text color={textColor} my={2}>
              {orig !== null
                ? `${event} / ${orig.substring(0, 400)}${
                    orig.length > 400 ? '...' : ''
                  }`
                : ''}
            </Text>
          </Tooltip>
        )
      }
    },
    // UPDATED VALUE
    {
      id: 'updatedValue',
      name: 'UPDATED VALUE',
      wrap: true,
      selector: (row) => {
        const { event } = row
        const { updated } = row
        return (
          <Tooltip label={updated} placement='top'>
            <Text color={textColor} overflow={'auto'} my={2}>
              {updated !== null
                ? `${event} / ${updated.substring(0, 400)}${
                    updated.length > 400 ? '...' : ''
                  }`
                : ''}
            </Text>
          </Tooltip>
        )
      }
    },
    // CHANGED BY
    {
      id: 'ACTIVITY_LOGS_CHANGED_BY',
      name: 'BY',
      selector: (row) => (
        <Tooltip placement='top' label={row.changedBy}>
          <Text
            color={textColor}
            cursor={'pointer'}
            onClick={() => {
              setActiveRow(row)
              onUserOpen()
            }}
          >
            {row.changedBy}
          </Text>
        </Tooltip>
      ),
      right: 'true',
      wrap: true,
      sortable: true
    },
    // CHANGED ON
    {
      id: 'ACTIVITY_LOGS_CREATED_AT',
      name: 'CHANGED',
      selector: (row) => (
        <Tooltip label={getFullDateAndTime(row.updatedAt)} placement={'top'}>
          <Text color={textColor}>{timeSince(row.updatedAt)}</Text>
        </Tooltip>
      ),
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a.updatedAt)
        const dateB = new Date(b.updatedAt)
        return dateA - dateB // Sort in descending order
      },
      width: '12%',
      right: 'true'
    }
  ]

  const handleRefresh = useCallback(async () => {
    reset()
    refetch()
  }, [refetch, reset])

  const setSearchFilter = useCallback(
    (value) => {
      setProdLogState((oldFilter) => ({
        ...oldFilter,
        search: value
      }))
      reset()
    },
    [reset]
  )

  // CLEAR SERACH
  const handleClear = useCallback(() => {
    setSearchInput('')
    setProdLogState((oldFilter) => ({
      ...oldFilter,
      search: undefined
    }))
    reset()
  }, [reset])

  // SEARCH COMPONENT
  const handleSearch = useCallback(
    async (event) => {
      const {
        key,
        target: { value }
      } = event
      if (key === 'Enter' && value !== '') {
        setSearchFilter(value)
      }
    },
    [setSearchFilter]
  )

  // ON SEARCH INPUT CHANGE
  const onSearchInputChange = useCallback(
    (e) => {
      const { value } = e.target
      if (value === '') {
        handleClear()
      } else {
        setSearchInput(value)
      }
    },
    [handleClear]
  )

  // SORTING
  const handleSort = (column, sortDirection) => {
    setProdLogState((oldFilters) => ({
      ...oldFilters,
      field: column?.id,
      direction: sortDirection.toUpperCase()
    }))
  }

  const subHeader = useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
        mb={4}
      >
        <Stack
          width={'100%'}
          direction={'row'}
          spacing={4}
          alignItems={'flex-start'}
        >
          <SearchFilter
            id='prodChangelog'
            filterText={searchInput}
            onChange={onSearchInputChange}
            onClear={handleClear}
            onFilter={handleSearch}
          />

          <ChangelogFilterMenu
            id={activeEnv}
            setFilter={(newFilters) => {
              setProdLogState(newFilters)
              reset()
            }}
          />
        </Stack>
        <Tooltip label='Refresh'>
          <IconButton
            onClick={handleRefresh}
            colorScheme='blue'
            icon={<RepeatIcon />}
          ></IconButton>
        </Tooltip>
      </Flex>
    )
  }, [
    searchInput,
    onSearchInputChange,
    handleClear,
    handleSearch,
    activeEnv,
    handleRefresh,
    reset
  ])

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          subHeader
          data={nodes}
          persistTableHead
          columns={columns}
          responsive={true}
          onSort={handleSort}
          defaultSortAsc={false}
          progressPending={loading}
          customStyles={customStyles(headColor)}
          subHeaderComponent={subHeader}
          progressComponent={<CustomLoader />}
          defaultSortFieldId={prodLogState?.field}
        />

        {/* PAGINATION */}
        <Pagination {...paginationProps} />
      </Flex>

      {isUserOpen && (
        <UserCard
          name={activeRow?.changedBy}
          isOpen={isUserOpen}
          onClose={onUserClose}
        />
      )}
    </>
  )
}

export default ChangelogTable
