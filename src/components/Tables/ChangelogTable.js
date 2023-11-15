import {
  Button,
  Flex,
  Stack,
  Tag,
  Input,
  Tooltip,
  Text,
  Badge,
  Skeleton,
  Box,
  IconButton
} from '@chakra-ui/react'
import GlobalContext from 'context/GlobalContext'
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useLocation } from 'react-router-dom'
import { timeSince } from 'utils'
import { getFullDateAndTime } from 'utils'
import ChangelogFilterMenu from 'views/Sbom/components/ChangelogFilterMenu'
import SearchFilter from 'views/Sbom/components/SearchFilter'

const customStyles = {
  headCells: {
    style: {
      fontWeight: 'bold',
      color: '#2D3748',
      fontSize: '12px',
      letterSpacing: '1px'
    }
  },
  subHeader: {
    style: {
      padding: 0,
      margin: 0
    }
  }
}

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
  const {
    totalRows,
    changelogData,
    prodLogField,
    setProdLogField,
    prodLogDirection,
    setProdLogDirection
  } = useContext(GlobalContext)

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)

  const productId = queryParams.get('id')

  const [filterText, setFilterText] = useState('')
  const [pageIndex, setPageIndex] = useState(1)
  const [userFilters, setUserFilters] = useState([])
  const [typeFilters, setTypeFilters] = useState([])

  useEffect(() => {
    if (userFilters.length === 0 || typeFilters.length === 0) {
      const users = data.nodes.map((item) => item.changedBy)
      const actions = data.nodes.map((item) => item.action)
      setUserFilters(users)
      setTypeFilters(actions)
    }
  }, [])

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
      selector: (row) => row.changedBy,
      width: '14%',
      right: 'true',
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

  const onPreviousPage = () => {
    setPageIndex((prev) => pageIndex !== 0 && prev - 1)
    refetch({
      projectId: productId,
      first: undefined,
      after: undefined,
      last: totalRows,
      before: data.pageInfo.startCursor
    })
  }

  const onNextPage = () => {
    setPageIndex((prev) => prev < Math.ceil(data.totalCount) && prev + 1)
    refetch({
      projectId: productId,
      first: totalRows,
      after: data.pageInfo.endCursor,
      last: undefined,
      before: undefined
    })
  }

  // SEARCH COMPONENT
  const handleSearch = async (event) => {
    if (event.key === 'Enter' && filterText !== '') {
      await refetch({
        id: productId,
        search: filterText,
        first: totalRows
      })
      setPageIndex(1)
    }
  }

  // CLEAR SERACH
  const handleClear = async () => {
    await refetch({
      projectId: productId,
      search: undefined,
      first: totalRows
    })
    setFilterText('')
    setPageIndex(1)
  }

  // SORTING
  const handleSort = (column, sortDirection) => {
    setProdLogField(column.id)
    setProdLogDirection(sortDirection === 'asc' ? 'ASC' : 'DESC')
    refetch({
      projectId: productId,
      first: totalRows,
      last: undefined,
      field: column.id,
      direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
    })
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
            setPageIndex={setPageIndex}
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
          defaultSortFieldId={prodLogField}
          subHeader
          subHeaderComponent={subHeaderComponentMemo}
          onSort={handleSort}
          responsive={true}
        />
      </Flex>

      {/* PAGINATION */}
      <Flex
        flexDir={'row'}
        gap={4}
        alignItems={'center'}
        mt={6}
        justifyContent={'flex-start'}
      >
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
          Page {pageIndex} of {Math.ceil(data.totalCount / totalRows)}
        </Box>
      </Flex>
    </>
  )
}

export default ChangelogTable
