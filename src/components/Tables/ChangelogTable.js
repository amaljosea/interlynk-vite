import { Button, Flex, Stack, Tag, Tooltip, Text, Box } from '@chakra-ui/react'
import React, { useEffect, useMemo, useState } from 'react'
import { timeSince, getFullDateAndTime, customStyles } from 'utils'
import DataTable from 'react-data-table-component'
import CustomLoader from 'components/CustomLoader'
import { useGlobalState } from 'hooks/useGlobalState'
import ChangelogFilterMenu from 'views/Sbom/components/ChangelogFilterMenu'
import RowLimit from 'views/Sbom/components/RowLimit'
import SearchFilter from 'views/Sbom/components/SearchFilter'
import Pagination from "../Pagination";

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

const ChangelogTable = ({ data, refetch, activeEnv }) => {
  const paginationSizes = [25, 50, 100]

  const { totalRows, setTotalRows, prodLogState, dispatch } = useGlobalState()
  const {
    field,
    direction,
    pageIndex,
    searchInput: search,
    type,
    object,
    user
  } = prodLogState
  const { prodLogDispatch } = dispatch

  const [searchInput, setSearchInput] = useState('')

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
      width: '150px',
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
            <Text my={2}>
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
            <Text overflow={'auto'} my={2}>
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
          {row.changedBy}
        </Tooltip>
      ),
      right: 'true',
      wrap: true,
      sortable: true
    },
    // CHANGED ON
    {
      id: 'ACTIVITY_LOGS_CREATED_AT',
      name: 'CHANGED ON',
      selector: (row) => (
        <Tooltip label={getFullDateAndTime(row.updatedAt)} placement={'top'}>
          <Text>{timeSince(row.updatedAt)}</Text>
        </Tooltip>
      ),
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a.updatedAt)
        const dateB = new Date(b.updatedAt)
        return dateA - dateB // Sort in descending order
      },
      width: '14%',
      right: 'true'
    }
  ]

  const logData = {
    id: activeEnv,
    changeType: type?.length === 0 ? undefined : type,
    changedBy: user?.length === 0 ? undefined : user,
    changeObject: object?.length === 0 ? undefined : object,
    field,
    direction
  }

  const handlePreviousPage = async () => {
    await refetch({
      variables: {
        last: totalRows,
        before: data.pageInfo.startCursor,
        search: search !== '' ? search : undefined,
        ...logData
      }
    }).then(
      (res) =>
        res.data &&
        prodLogDispatch({
          type: 'DECREMENT_PAGE',
          payload: data.pageInfo.startCursor
        })
    )
  }

  const handleNextPage = async () => {
    await refetch({
      variables: {
        first: totalRows,
        after: data?.pageInfo?.endCursor,
        search: search !== '' ? search : undefined,
        ...logData
      }
    }).then(
      (res) =>
        res.data &&
        prodLogDispatch({
          type: 'INCREMENT_PAGE',
          payload: {
            total: data.totalCount,
            after: data.pageInfo.endCursor
          }
        })
    )
  }

  // SEARCH COMPONENT
  const handleSearch = async (event) => {
    const { value } = event.target
    if (event.key === 'Enter' && value !== '') {
      await refetch({
        variables: {
          search: value,
          first: totalRows,
          ...logData
        }
      }).then(
        (res) =>
          res.data &&
          prodLogDispatch({ type: 'CHANGE_SEARCH_INPUT', payload: value })
      )
    }
  }

  // CLEAR SERACH
  const handleClear = async () => {
    setSearchInput('')
    await refetch({
      variables: {
        search: undefined,
        first: totalRows,
        ...logData
      }
    }).then(
      (res) =>
        res.data &&
        prodLogDispatch({
          type: 'CLEAR_SEARCH_INPUT'
        })
    )
  }

  // ON SEARCH INPUT CHANGE
  const onSearchInputChange = (e) => {
    const { value } = e.target
    if (value === '') {
      handleClear()
    } else {
      setSearchInput(value)
    }
  }

  // SORTING
  const handleSort = async (column, sortDirection) => {
    await refetch({
      variables: {
        id: activeEnv,
        first: totalRows,
        search: search !== '' ? search : undefined,
        changeType: type?.length === 0 ? undefined : type,
        changedBy: user?.length === 0 ? undefined : user,
        changeObject: object?.length === 0 ? undefined : object,
        field: column.id,
        direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
      }
    }).then((res) => {
      if (res.data) {
        prodLogDispatch({
          type: 'SET_SORT_ORDER',
          payload: {
            field: column.id,
            direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
          }
        })
      }
    })
  }

  // SET ROW LENGTH
  const handleSetRow = async (e) => {
    setTotalRows(Number(e.target.value))
    await refetch({
      variables: {
        search: search !== '' ? search : undefined,
        first: Number(e.target.value),
        ...logData
      }
    }).then(
      (res) =>
        res.data &&
        prodLogDispatch({
          type: 'FETCH_DATA_SUCCESS'
        })
    )
  }

  const subHeaderComponentMemo = useMemo(() => {
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

          <ChangelogFilterMenu refetch={refetch} id={activeEnv} />
        </Stack>
      </Flex>
    )
  }, [searchInput, onSearchInputChange, handleClear, handleSearch])

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={data && data.nodes}
          customStyles={customStyles}
          defaultSortAsc={false}
          defaultSortFieldId={field}
          subHeader
          progressPending={data ? false : true}
          progressComponent={<CustomLoader />}
          subHeaderComponent={subHeaderComponentMemo}
          onSort={handleSort}
          responsive={true}
          persistTableHead
        />
      </Flex>

      {/* PAGINATION */}
      {data && (
          <Pagination
              paginationSizes={paginationSizes}
              pageIndex={pageIndex}
              totalRows={totalRows}
              totalCount={data.totalCount}
              onPreviousPage={handlePreviousPage}
              onNextPage={handleNextPage}
              onSetRow={handleSetRow}
              hasNextPage={data.pageInfo.hasNextPage}
              hasPreviousPage={data.pageInfo.hasPreviousPage}
          />
      )}
    </>
  )
}

export default ChangelogTable
