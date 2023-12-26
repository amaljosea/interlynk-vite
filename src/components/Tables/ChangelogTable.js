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

const ChangelogTable = ({ data, refetch }) => {
  const { totalRows, setTotalRows, prodLogState, dispatch } = useGlobalState()
  const { field, direction, pageIndex } = prodLogState
  const { prodLogDispatch } = dispatch

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)

  const productId = queryParams.get('id')

  const [filterText, setFilterText] = useState('')
  const [userFilters, setUserFilters] = useState([])
  const [typeFilters, setTypeFilters] = useState([])

  useEffect(() => {
    if (data && (userFilters.length === 0 || typeFilters.length === 0)) {
      const users = data.nodes.map((item) => item.changedBy)
      const actions = data.nodes.map((item) => item.action)
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
        const { orig } = row
        return (
          <Tooltip label={orig} placement='top'>
            <Text>
              {orig !== null
                ? `${orig?.substring(0, 400)}${orig.length > 400 ? '...' : ''}`
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
        const { updated } = row
        return (
          <Tooltip label={updated} placement='top'>
            <Text overflow={'auto'}>
              {updated !== null
                ? `${updated?.substring(0, 50)}${
                    updated.length > 50 ? '...' : ''
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
        id: productId,
        last: totalRows,
        before: data.pageInfo.startCursor,
        field: field,
        direction: direction
      }
    }).then(
      (res) =>
        res.data &&
        prodLogDispatch({
          type: 'DECREMENT_PAGE'
        })
    )
  }

  const onNextPage = async () => {
    await refetch({
      variables: {
        id: productId,
        first: totalRows,
        after: data.pageInfo.endCursor,
        field: field,
        direction: direction
      }
    }).then(
      (res) =>
        res.data &&
        prodLogDispatch({
          type: 'INCREMENT_PAGE',
          payload: data.totalCount
        })
    )
  }

  // SEARCH COMPONENT
  const handleSearch = async (event) => {
    if (event.key === 'Enter' && filterText !== '') {
      await refetch({
        variables: {
          id: productId,
          search: filterText,
          first: totalRows,
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
  }

  // CLEAR SERACH
  const handleClear = async () => {
    await refetch({
      variables: {
        id: productId,
        search: undefined,
        first: totalRows,
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

  // SORTING
  const handleSort = async (column, sortDirection) => {
    await refetch({
      variables: {
        id: productId,
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
        id: productId,
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
            filterText={filterText}
            setFilterText={setFilterText}
            onFilter={handleSearch}
            onClear={handleClear}
          />

          <ChangelogFilterMenu
            refetch={refetch}
            users={userFilters}
            actions={typeFilters}
            totalRows={totalRows}
            id={productId}
          />
        </Stack>
      </Flex>
    )
  }, [filterText, handleClear, handleSearch])

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
