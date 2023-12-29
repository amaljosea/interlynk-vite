import {
  Button,
  Flex,
  Stack,
  Tag,
  Text,
  Box,
  TagLabel,
  Tooltip
} from '@chakra-ui/react'
import CustomLoader from 'components/CustomLoader'
import React, { useMemo, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useLocation } from 'react-router-dom'
import { timeSince } from 'utils'
import { getFullDateAndTime, customStyles } from 'utils'
import LogFilterMenu from 'views/Sbom/components/LogFilterMenu'
import RowLimit from 'views/Sbom/components/RowLimit'
import SearchFilter from 'views/Sbom/components/SearchFilter'
import { useGlobalState } from 'hooks/useGlobalState'
import { useLazyQuery } from '@apollo/client'
import { GetLogsFilterData } from 'graphQL/Queries'

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

const SbomChangelogTable = ({ data, refetch }) => {
  // GET LOGS FILTER HEADS
  const [getLogsFilters] = useLazyQuery(GetLogsFilterData)

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('id')
  const sbomId = queryParams.get('sbom')

  const { totalRows, setTotalRows, sbomLogState, dispatch } = useGlobalState()
  const { filters, field, direction, pageIndex, searchInput } = sbomLogState
  const { sbomLogDispatch } = dispatch

  const [logSearch, setLogSearch] = useState('')

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
      sortable: true,
      width: '90px'
    },
    // CHANGED OBJECT
    {
      id: 'ACTIVITY_LOGS_EVENT',
      name: 'CHANGED',
      selector: (row) => {
        const { event, loggablePrefix, loggableType } = row
        return (
          <Tooltip placement='top' label={loggablePrefix}>
            <Stack direction={'column'} spacing={0} my={2}>
              <Tag
                fontSize={'sm'}
                fontWeight={'medium'}
                colorScheme='blue'
                overflow={'auto'}
              >
                <TagLabel>
                  {loggableType === 'Sbom' ? 'SBOM' : loggablePrefix}
                </TagLabel>
              </Tag>
              <Text>{event}</Text>
            </Stack>
          </Tooltip>
        )
      },
      sortable: true
    },
    // PRIOR VALUE
    {
      id: 'priorValue',
      name: 'PREVIOUS VALUE',
      selector: (row) => {
        const { orig, event } = row
        const license =
          (event === 'licenses' || event === 'cpes') && JSON.parse(orig)

        const urls = event === 'external_urls' && JSON.parse(orig)

        return (
          <Flex flexWrap={'wrap'} gap={2} my={2} whiteSpace={'break-spaces'}>
            <Tooltip
              placement='top'
              label={license ? orig : ''}
              textTransform={'capitalize'}
            >
              <Box textOverflow={'wrap'}>
                {orig === 'f' ? (
                  'False'
                ) : orig === 't' ? (
                  'True'
                ) : license?.length > 0 ? (
                  license.map((item, index) => (
                    <Flex
                      key={index}
                      flexWrap={'wrap'}
                      gap={2}
                      my={2}
                      direction={'column'}
                    >
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
                ) : license?.length === 0 ? (
                  ''
                ) : urls && urls.length > 0 ? (
                  urls.map((item, index) => (
                    <Flex
                      key={index}
                      flexWrap={'wrap'}
                      gap={2}
                      my={2}
                      direction={'column'}
                    >
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
                  <Text whiteSpace={'wrap'}>{orig}</Text>
                )}
              </Box>
            </Tooltip>
          </Flex>
        )
      }
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
              label={updatedValue ? updated : ''}
              textTransform={'capitalize'}
              whiteSpace={'wrap'}
            >
              <Box>
                {updated === 'f' ? (
                  'False'
                ) : updated === 't' ? (
                  'True'
                ) : updatedValue?.length > 0 ? (
                  updatedValue.map((item, index) => (
                    <Flex
                      key={index}
                      flexWrap={'wrap'}
                      gap={2}
                      my={2}
                      direction={'column'}
                    >
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
                ) : updatedValue?.length === 0 ? (
                  ''
                ) : urls && urls.length > 0 ? (
                  urls.map((item, index) => (
                    <Flex
                      key={index}
                      flexWrap={'wrap'}
                      gap={2}
                      my={2}
                      direction={'column'}
                    >
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
      sortable: true,
      width: '12%',
      right: 'true'
    },
    // CHANGED ON
    {
      id: 'ACTIVITY_LOGS_CREATED_AT',
      name: 'CHANGED ON',
      selector: (row) => (
        <Box width={'fit-content'}>
          <Tooltip label={getFullDateAndTime(row.updatedAt)} placement={'top'}>
            <Text width={'fit-content'}>{timeSince(row.updatedAt)}</Text>
          </Tooltip>
        </Box>
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

  const onPreviousPage = async () => {
    await refetch({
      projectId: productId,
      sbomId: sbomId,
      last: totalRows,
      before: data.pageInfo.startCursor,
      field: field,
      direction: direction
    }).then(
      (res) =>
        res.data &&
        sbomLogDispatch({
          type: 'DECREMENT_PAGE',
          payload: data.pageInfo.startCursor
        })
    )
  }

  const onNextPage = async () => {
    refetch({
      projectId: productId,
      sbomId: sbomId,
      first: totalRows,
      after: data.pageInfo.endCursor,
      field: field,
      direction: direction
    }).then(
      (res) =>
        res.data &&
        sbomLogDispatch({
          type: 'INCREMENT_PAGE',
          payload: { total: data.totalCount, after: data.pageInfo.endCursor }
        })
    )
  }

  // CLEAR SERACH
  const handleClear = async () => {
    setLogSearch('')
    await refetch({
      projectId: productId,
      sbomId: sbomId,
      search: undefined,
      first: totalRows
    }).then(
      (res) =>
        res.data &&
        sbomLogDispatch({
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
      setLogSearch(value)
    }
  }

  // SEARCH COMPONENT
  const handleSearch = async (event) => {
    const { value } = event.target
    if (event.key === 'Enter' && logSearch !== '') {
      await refetch({
        projectId: productId,
        sbomId: sbomId,
        search: value,
        first: totalRows
      }).then(
        (res) =>
          res.data &&
          sbomLogDispatch({ type: 'CHANGE_SEARCH_INPUT', payload: value })
      )
    }
  }

  // SET ROW LENGTH
  const handleSetRow = async (e) => {
    setTotalRows(Number(e.target.value))
    await refetch({
      projectId: productId,
      sbomId: sbomId,
      first: Number(e.target.value),
      last: undefined,
      after: undefined,
      before: undefined,
      field: field,
      direction: direction
    }).then(
      (res) => res.data && sbomLogDispatch({ type: 'FETCH_DATA_SUCCESS' })
    )
  }

  const handleSort = async (column, sortDirection) => {
    await refetch({
      projectId: productId,
      sbomId: sbomId,
      first: totalRows,
      last: undefined,
      field: column.id,
      direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
    }).then((res) => {
      if (res.data) {
        sbomLogDispatch({
          type: 'SET_SORT_ORDER',
          payload: {
            field: column.id,
            direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
          }
        })
      }
    })
  }

  const subHeaderComponentMemo = useMemo(() => {
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
          <SearchFilter
            id='changelog'
            filterText={logSearch}
            onChange={onSearchInputChange}
            onFilter={handleSearch}
            onClear={handleClear}
          />

          {/* FILTER COMPONENTS BASED ON ECOSYSTEM */}
          {filters && (
            <LogFilterMenu
              refetch={refetch}
              productId={productId}
              sbomId={sbomId}
            />
          )}
        </Stack>
      </Flex>
    )
  }, [logSearch, filters, onSearchInputChange, handleClear, handleSearch])

  useEffect(() => {
    if (data) {
      getLogsFilters({
        variables: {
          projectId: productId,
          sbomId: sbomId
        }
      }).then((res) => {
        if (res.data) {
          console.log('filters', res.data)
          sbomLogDispatch({
            type: 'ADD_FILTER_HEADS',
            payload: res.data.sbom.filters
          })
        }
      })
    }
  }, [data])

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={data && data.nodes}
          onSort={handleSort}
          defaultSortAsc={false}
          defaultSortFieldId={field}
          customStyles={customStyles}
          progressPending={data ? false : true}
          progressComponent={<CustomLoader />}
          subHeader
          persistTableHead
          subHeaderComponent={subHeaderComponentMemo}
          responsive={true}
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

          <RowLimit onChange={handleSetRow} name='changelogRow' />
        </Flex>
      )}
    </>
  )
}

export default SbomChangelogTable
