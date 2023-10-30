import {
  Button,
  Flex,
  Stack,
  Tag,
  Text,
  Box,
  Select,
  TagLabel,
  Tooltip,
  Skeleton,
  Badge
} from '@chakra-ui/react'
import CustomLoader from 'components/CustomLoader'
import GlobalContext from 'context/GlobalContext'
import React, { useMemo, useState, useContext } from 'react'
import DataTable from 'react-data-table-component'
import { useLocation } from 'react-router-dom'
import { timeSince } from 'utils'
import { getFullDateAndTime } from 'utils'
import LogFilterMenu from 'views/Sbom/components/LogFilterMenu'
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

const SbomChangelogTable = ({ data, refetch, totalRows, setTotalRows }) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)

  const { logFilters, logField, setLogField, logDirection, setLogDirection } =
    useContext(GlobalContext)

  const productId = queryParams.get('p')
  const sbomId = queryParams.get('sbom')

  const [filterText, setFilterText] = useState('')
  const [pageIndex, setPageIndex] = useState(1)

  // COLUMNS
  const columns = [
    // CHANGE TYPE
    {
      id: 'ACTION',
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
      sortable: true,
      width: '90px'
    },
    // CHANGED OBJECT
    {
      id: 'EVENT',
      name: 'CHANGED',
      selector: (row) => {
        const { event, loggablePrefix, loggableType } = row
        return (
          <Tooltip placement='top' label={loggablePrefix}>
            <Stack direction={'column'} spacing={0}>
              <Badge
                fontSize={'sm'}
                fontWeight={'medium'}
                width={'fit-content'}
                colorScheme='blue'
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                <Text>{loggableType === 'Sbom' ? 'SBOM' : loggablePrefix}</Text>
              </Badge>
              <Text>{event}</Text>
            </Stack>
          </Tooltip>
        )
      },
      width: '300px',
      sortable: true,
      width: '300px'
    },
    // PRIOR VALUE
    {
      id: 'priorValue',
      name: 'PREVIOUS VALUE',
      selector: (row) => {
        const { orig, event } = row
        const license =
          (event === 'licenses' || event === 'cpes') && JSON.parse(orig)
        const urls = event === 'external_urls' && JSON.stringify(orig)

        return (
          <Flex flexWrap={'wrap'} gap={2} my={2} whiteSpace={'break-spaces'}>
            <Tooltip
              placement='top'
              label={license.length === 0 ? '' : orig}
              textTransform={'capitalize'}
            >
              <Box textOverflow={'wrap'}>
                {orig === 'f' ? (
                  'False'
                ) : orig === 't' ? (
                  'True'
                ) : license.length > 0 ? (
                  license.map((item, index) => (
                    <Flex flexWrap={'wrap'} gap={2} my={2} direction={'column'}>
                      <Tag
                        size={'sm'}
                        key={index}
                        variant='subtle'
                        colorScheme='red'
                        width={'fit-content'}
                      >
                        <TagLabel pt={1}>{item}</TagLabel>
                      </Tag>
                    </Flex>
                  ))
                ) : license.length === 0 ? (
                  ''
                ) : (
                  <Text whiteSpace={'wrap'}>{orig}</Text>
                )}
              </Box>
            </Tooltip>
          </Flex>
        )
      },
      width: '400px'
    },
    // UPDATED VALUE
    {
      id: 'updatedValue',
      name: 'UPDATED VALUE',
      selector: (row) => {
        const { updated, event } = row
        const updatedValue =
          (event === 'licenses' || event === 'cpes') && JSON.parse(updated)
        const urls = event === 'external_urls' && JSON.parse(updated)

        return (
          <Flex flexWrap={'wrap'} gap={2} my={2}>
            <Tooltip
              placement='top'
              label={updatedValue.length === 0 ? '' : updated}
              textTransform={'capitalize'}
              whiteSpace={'wrap'}
            >
              <Box>
                {updated === 'f' ? (
                  'False'
                ) : updated === 't' ? (
                  'True'
                ) : updatedValue.length > 0 ? (
                  updatedValue.map((item, index) => (
                    <Flex flexWrap={'wrap'} gap={2} my={2} direction={'column'}>
                      <Tag
                        size={'sm'}
                        key={index}
                        variant='subtle'
                        colorScheme='green'
                        width={'fit-content'}
                      >
                        <TagLabel pt={1}>{item}</TagLabel>
                      </Tag>
                    </Flex>
                  ))
                ) : updatedValue.length === 0 ? (
                  ''
                ) : urls && urls.length > 0 ? (
                  urls.map((item, index) => (
                    <Flex flexWrap={'wrap'} gap={2} my={2} direction={'column'}>
                      <Tag
                        size={'sm'}
                        key={index}
                        variant='subtle'
                        colorScheme='green'
                        width={'fit-content'}
                      >
                        <TagLabel pt={1}>
                          {item.name} - {item.url}
                        </TagLabel>
                      </Tag>
                    </Flex>
                  ))
                ) : (
                  <Text whiteSpace={'wrap'}>{updated}</Text>
                )}
              </Box>
            </Tooltip>
          </Flex>
        )
      },
      width: '400px'
    },
    // CHANGED BY
    {
      id: 'CHANGED_BY',
      name: 'BY',
      selector: (row) => row.changedBy,
      width: '150px',
      sortable: true
    },
    // CHANGED ON
    {
      id: 'CREATED_AT',
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
      }
    }
  ]

  const [loading, setLoading] = useState(false)

  const onPreviousPage = async () => {
    setLoading(true)
    setPageIndex((prev) => pageIndex !== 0 && prev - 1)
    await refetch({
      projectId: productId,
      sbomId: sbomId,
      last: totalRows,
      before: data.pageInfo.startCursor,
      field: logField,
      direction: logDirection
    }).then(() => {
      setTimeout(() => {
        setLoading(false)
      }, 1000)
    })
  }

  const onNextPage = async () => {
    setLoading(true)
    setPageIndex((prev) => prev < Math.ceil(data.totalCount) && prev + 1)
    refetch({
      projectId: productId,
      sbomId: sbomId,
      first: totalRows,
      after: data.pageInfo.endCursor,
      field: logField,
      direction: logDirection
    }).then(() => {
      setTimeout(() => {
        setLoading(false)
      }, 1000)
    })
  }

  // SEARCH COMPONENT
  const handleSearch = async (event) => {
    if (event.key === 'Enter' && filterText !== '') {
      await refetch({
        projectId: productId,
        sbomId: sbomId,
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
      sbomId: sbomId,
      search: undefined,
      first: totalRows
    })
    setFilterText('')
    setPageIndex(1)
  }

  // SET ROW LENGTH
  const handleSetRow = async (e) => {
    setTotalRows(Number(e.target.value))
    await refetch({
      projectId: productId,
      sbomId: sbomId,
      first: Number(e.target.value),
      field: logField,
      direction: logDirection
    })
    setFilterText('')
    setPageIndex(1)
  }

  const handleSort = (column, sortDirection) => {
    // console.log(`column`, column)
    // console.log(`sortDirection`, sortDirection)
    setLogField(column.id)
    setLogDirection(sortDirection === 'asc' ? 'ASC' : 'DESC')
    refetch({
      projectId: productId,
      sbomId: sbomId,
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
            filterText={filterText}
            setFilterText={setFilterText}
            onFilter={handleSearch}
            onClear={handleClear}
          />

          {/* FILTER COMPONENTS BASED ON ECOSYSTEM */}
          {logFilters && (
            <LogFilterMenu
              refetch={refetch}
              productId={productId}
              sbomId={sbomId}
              logFilters={logFilters}
              setPageIndex={setPageIndex}
              totalRows={totalRows}
            />
          )}
        </Stack>
      </Flex>
    )
  }, [filterText, logFilters, handleClear, handleSearch])

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={data.nodes}
          onSort={handleSort}
          defaultSortAsc={false}
          defaultSortFieldId={logField}
          customStyles={customStyles}
          progressPending={loading}
          progressComponent={<CustomLoader />}
          subHeader
          persistTableHead
          subHeaderComponent={subHeaderComponentMemo}
          responsive={true}
        />
      </Flex>

      {/* PAGINATION */}
      {!loading && (
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

          <Stack alignItems={'center'} direction={'row'} spacing={4}>
            <Text>Show</Text>
            <Select width={20} value={totalRows} onChange={handleSetRow}>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </Select>
          </Stack>
        </Flex>
      )}
    </>
  )
}

export default SbomChangelogTable
