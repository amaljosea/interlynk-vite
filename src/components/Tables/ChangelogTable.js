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
import FilterChangelog from 'views/Sbom/components/FilterChangelog'

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

const FilterComponent = ({ filterText, onFilter, onClear }) => {
  const searchRef = useRef()

  const focusSearchInput = () => {
    if (searchRef?.current) {
      searchRef?.current.focus()
    }
  }

  const handleKeyPress = (e) => {
    if (e.ctrlKey && e.key === '/') {
      focusSearchInput()
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)

    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [])

  return (
    <>
      <Input
        width={'400px'}
        id='search'
        type='text'
        placeholder='Search'
        aria-label='Search Input'
        ref={searchRef}
      />
    </>
  )
}

const ChangelogTable = ({ data, refetch, type, totalRows, setTotalRows }) => {
  const { changelogData } = useContext(GlobalContext)

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)

  const productId = queryParams.get('p')
  const sbomId = queryParams.get('sbom')

  const [filterText, setFilterText] = useState('')
  const [pageIndex, setPageIndex] = useState(1)
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false)

  const users = data.map((item) => item.changedBy)
  const actions = data.map((item) => item.action)

  const filterItems = data.filter(
    (item) =>
      (item.event &&
        item.event.toLowerCase().includes(filterText.toLowerCase())) ||
      (item.changedBy &&
        item.changedBy.toLowerCase().includes(filterText.toLowerCase()))
  )

  const onPreviousPage = () => {
    setPageIndex((prev) => pageIndex !== 0 && prev - 1)
    refetch({
      projectId: productId,
      sbomId: sbomId,
      first: undefined,
      last: totalRows,
      before: data.pageInfo.startCursor,
      after: ''
    })
  }

  const onNextPage = () => {
    setPageIndex((prev) => prev < Math.ceil(data.totalCount) && prev + 1)
    refetch({
      projectId: productId,
      sbomId: sbomId,
      first: totalRows,
      last: undefined,
      after: data.pageInfo.endCursor,
      before: ''
    })
  }

  const handleChangelogChange = (selectedFilters) => {
    if (
      selectedFilters.type.length === 0 &&
      selectedFilters.user.length === 0
    ) {
      // IF NO FILTER SELECTED RETURN DEFAULT HEALTH CHECK DATA
      setFilteredChangelog(changelogData)
    } else {
      // IF ANY FILTER IS SELECTED RETURN SELECTED DATA
      const filtered = changelogData.filter(
        (item) =>
          (selectedFilters.type.length === 0 ||
            selectedFilters.type.includes(item.type)) &&
          (selectedFilters.user.length === 0 ||
            selectedFilters.user.includes(item.changedBy))
      )
      setFilteredChangelog(filtered)
    }
  }

  const subHeaderComponentMemo = useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle)
        setFilterText('')
      }
    }

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
          <FilterComponent
            onFilter={(e) => setFilterText(e.target.value)}
            onClear={handleClear}
            filterText={filterText}
          />

          <FilterChangelog
            onFilterChange={handleChangelogChange}
            users={users ? users : ['system']}
            actions={actions ? actions : ['created', 'updated']}
          />
        </Stack>
      </Flex>
    )
  }, [filterText, resetPaginationToggle, handleChangelogChange])

  // COLUMNS
  const columns = [
    // CHANGE TYPE
    {
      id: 'changeType',
      name: 'TYPE',
      selector: (row) => {
        const { action } = row
        return (
        <Tooltip placement='top' label={action} textTransform={'capitalize'}>
          <Tag variant='solid' colorScheme={setColor(action)} textTransform={'capitalize'}>
            {action.slice(0,1)}
          </Tag>
        </Tooltip>
      )
      },
      width: '150px'
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
      },
      width: '400px'
    },
    // UPDATED VALUE
    {
      id: 'updatedValue',
      name: 'UPDATED VALUE',
      selector: (row) => {
        const { updated } = row
        return (
          <Tooltip label={updated} placement='top'>
            <Text>
              {updated !== null
                ? `${updated?.substring(0, 400)}${
                    updated.length > 400 ? '...' : ''
                  }`
                : ''}
            </Text>
          </Tooltip>
        )
      },
      width: '400px'
    },
    // CHANGED BY
    {
      id: 'changedBy',
      name: 'BY',
      selector: (row) => row.changedBy,
      width: '150px'
    },
    // CHANGED ON
    {
      id: 'changedOn',
      name: 'CHANGED ON',
      selector: (row) => (
        <Tooltip label={getFullDateAndTime(row.updatedAt)} placement={'top'}>
          <Text>{timeSince(row.updatedAt)}</Text>
        </Tooltip>
      )
    }
  ]

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={filterItems}
          customStyles={customStyles}
          subHeader
          subHeaderComponent={subHeaderComponentMemo}
          responsive={true}
        />
      </Flex>

      {/* PAGINATION */}
      {/* <Flex
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
      </Flex> */}
    </>
  )
}

export default ChangelogTable
