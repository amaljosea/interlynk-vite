import {
  Button,
  Flex,
  Stack,
  Tag,
  Input,
  Tooltip,
  Text,
  Skeleton,
  Box,
  IconButton
} from '@chakra-ui/react'
import GlobalContext from 'context/GlobalContext'
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import DataTable from 'react-data-table-component'
import { MdRefresh } from 'react-icons/md'
import { useLocation } from 'react-router-dom'
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

const SbomChangelogTable = ({ data, refetch, pageIndex, setPageIndex }) => {
  const { changelogData } = useContext(GlobalContext)

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)

  const productId = queryParams.get('p')
  const sbomId = queryParams.get('sbom')

  const [filterText, setFilterText] = useState('')
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false)

  const users = data && data.nodes.map((item) => item.changedBy)
  const actions = data && data.nodes.map((item) => item.action)

  const filterItems =
    data &&
    data.nodes.filter(
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
      last: 10,
      before: data.pageInfo.startCursor,
      after: '',
      field: 'CREATED_AT',
      direction: 'ASC'
    })
  }

  const onNextPage = () => {
    setPageIndex((prev) => prev < Math.ceil(data.totalCount) && prev + 1)
    refetch({
      projectId: productId,
      sbomId: sbomId,
      first: 10,
      last: undefined,
      after: data.pageInfo.endCursor,
      before: '',
      field: 'CREATED_AT',
      direction: 'ASC'
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
      name: 'CHANGE TYPE',
      selector: (row) => {
        const { action } = row
        return (
          <Tag variant='subtle' colorScheme={setColor(action)}>
            {action}
          </Tag>
        )
      }
    },
    // CHANGED OBJECT
    {
      id: 'changedObject',
      name: 'CHANGED OBJECT',
      selector: (row) => {
        const { event } = row
        return <Text>{event}</Text>
      }
    },
    // PRIOR VALUE
    {
      id: 'priorValue',
      name: 'PRIOR VALUE',
      selector: (row) => {
        const { orig } = row
        return (
          <Tooltip label={orig} placement='top'>
            <Text>
              {orig !== null
                ? `${orig?.substring(0, 20)}${orig.length > 20 ? '...' : ''}`
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
            <Text>
              {updated !== null
                ? `${updated?.substring(0, 15)}${
                    updated.length > 15 ? '...' : ''
                  }`
                : ''}
            </Text>
          </Tooltip>
        )
      }
    },
    // CHANGED BY
    {
      id: 'changedBy',
      name: 'CHANGED BY',
      selector: (row) => row.changedBy,
      width: '200px'
    },
    // CHANGED ON
    {
      id: 'changedOn',
      name: 'CHANGED ON',
      selector: (row) => <Text>{getFullDateAndTime(row.updatedAt)}</Text>
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
          Page {pageIndex} of {Math.ceil(data.totalCount / 10)}
        </Box>
      </Flex>
    </>
  )
}

export default SbomChangelogTable
