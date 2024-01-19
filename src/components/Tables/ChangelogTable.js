import { Button, Flex, Stack, Tag, Tooltip, Text, Box } from '@chakra-ui/react'
import CustomLoader from 'components/CustomLoader'
import { useGlobalState } from 'hooks/useGlobalState'
import React, { useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useLocation } from 'react-router-dom'
import { timeSince } from 'utils'
import { getFullDateAndTime, customStyles } from 'utils'
import ChangelogFilterMenu from 'views/Sbom/components/ChangelogFilterMenu'
import RowLimit from 'views/Sbom/components/RowLimit'
import SearchFilter from 'views/Sbom/components/SearchFilter'

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
  const { totalRows, setTotalRows, prodLogState, dispatch } = useGlobalState()
  const { field, direction, pageIndex } = prodLogState
  const { prodLogDispatch } = dispatch

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)

  const productId = queryParams.get('id')

  const [searchInput, setSearchInput] = useState('')
  const [userFilters, setUserFilters] = useState([])
  const [typeFilters, setTypeFilters] = useState([])

  useEffect(() => {
    if (data) {
      const users = data?.nodes?.map((item) => item.changedBy) || []
      const actions = data?.nodes?.map((item) => item.action) || []
      setUserFilters(users)
      setTypeFilters(actions)
    }
  }, [data])

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

  const onPreviousPage = async () => {
    await refetch({
      variables: {
        id: activeEnv,
        last: totalRows,
        before: data.pageInfo.startCursor,
        field: field,
        direction: direction
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

  const onNextPage = async () => {
    await refetch({
      variables: {
        id: activeEnv,
        first: totalRows,
        after: data?.pageInfo?.endCursor,
        field: field,
        direction: direction
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
          id: activeEnv,
          search: value,
          first: totalRows,
          field: field,
          direction: direction
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
        id: activeEnv,
        search: undefined,
        first: totalRows,
        field: field,
        direction: direction
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
        id: activeEnv,
        first: Number(e.target.value),
        field: field,
        direction: direction
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

          <ChangelogFilterMenu
            refetch={refetch}
            users={userFilters}
            actions={typeFilters}
            id={activeEnv}
          />
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
        <Flex
          width={'100%'}
          flexDir={'row'}
          gap={4}
          alignItems={'center'}
          mt={6}
          justifyContent={'space-between'}
        >
          <Stack alignItems={'center'} direction={'row'} spacing={4}>
            <Button
              colorScheme='blue'
              onClick={onPreviousPage}
              isDisabled={!data.pageInfo.hasPreviousPage}
            >
              Previous
            </Button>
            <Button
              colorScheme='blue'
              onClick={onNextPage}
              isDisabled={!data.pageInfo.hasNextPage}
            >
              Next
            </Button>
            <Box>
              Page {pageIndex} of{' '}
              {data.totalCount === 0
                ? 1
                : Math.ceil(data.totalCount / totalRows)}
            </Box>
          </Stack>

          <RowLimit onChange={handleSetRow} name='prodChangelogRow' />
        </Flex>
      )}
    </>
  )
}

export default ChangelogTable
