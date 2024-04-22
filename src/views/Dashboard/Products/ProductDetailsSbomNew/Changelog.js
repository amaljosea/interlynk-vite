import { useQuery } from '@apollo/client'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useLocation, useParams } from 'react-router-dom'
import { customStyles, getFullDateAndTime, timeSince } from 'utils'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { RepeatIcon } from '@chakra-ui/icons'
import {
  Box,
  Flex,
  IconButton,
  Stack,
  Tag,
  TagLabel,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CustomLoader from 'components/CustomLoader'
import PurlCard from 'components/Misc/PurlCard'
import Pagination from 'components/Pagination'

import { useGlobalState } from 'hooks/useGlobalState'

import { GetSbomLogFilters } from 'graphQL/Queries'
import { GetChangeLogs } from 'graphQL/Queries'

import LogFilters from './LogFilters'

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

const Changelog = () => {
  const params = useParams()
  const productId = params.productid
  const sbomId = params.sbomid
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const activeTab = queryParams.get('tab')

  const { totalRows, setTotalRows, sbomLogState, dispatch } = useGlobalState()
  const {
    filters,
    field,
    direction,
    pageIndex,
    searchInput,
    users,
    objects,
    types
  } = sbomLogState
  const { sbomLogDispatch } = dispatch

  const getUndefinedIfEmptyOrAll = (value, allValue = 'all') =>
    value.includes(allValue) || value.length === 0 ? undefined : value

  // GET CHANGE LOG DATA
  const { data, refetch, error } = useQuery(GetChangeLogs, {
    skip: activeTab === 'changelog' ? false : true,
    variables: {
      projectId: productId,
      sbomId: sbomId,
      first: totalRows,
      last: undefined,
      search: searchInput !== '' ? searchInput : undefined,
      changedBy: getUndefinedIfEmptyOrAll(users),
      changeObject: getUndefinedIfEmptyOrAll(objects),
      changeType: getUndefinedIfEmptyOrAll(types),
      field,
      direction
    }
  })

  const { activityLogs } = data?.sbom || ''

  // GET SBOM CHANGELOG FILTER HEADS
  useQuery(GetSbomLogFilters, {
    skip: activeTab === 'changelog' ? false : true,
    variables: {
      projectId: productId,
      sbomId
    },
    onCompleted: (data) =>
      sbomLogDispatch({
        type: 'ADD_FILTER_HEADS',
        payload: data?.sbom?.activityLogFilters
      })
  })

  //This part is needed for the pagination to work. (Modify with caution)
  const paginationSizes = [25, 50, 100]

  const [isPrevActive, setIsPrevActive] = useState(false)
  const [isNextActive, setIsNextActive] = useState(false)
  const [activeRow, setActiveRow] = useState('')

  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    if (activityLogs) {
      setIsPrevActive(activityLogs?.pageInfo?.hasPreviousPage)
      setIsNextActive(activityLogs?.pageInfo?.hasNextPage)
    }
  }, [activityLogs])

  const setPaginationControl = (data) => {
    setIsPrevActive(data?.sbom?.activityLogs?.pageInfo?.hasPreviousPage)
    setIsNextActive(data?.sbom?.activityLogs?.pageInfo?.hasNextPage)
  }

  const disablePaginationControl = () => {
    setIsPrevActive(false)
    setIsNextActive(false)
  }

  //end

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
      wrap: true,
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
                width={'fit-content'}
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
      wrap: true,
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

        if (event === 'purl') {
          return (
            <Text
              my={3}
              cursor={'pointer'}
              onClick={() => {
                setActiveRow(orig)
                onOpen()
              }}
            >
              {orig}
            </Text>
          )
        }

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
      },
      wrap: true
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

        if (event === 'purl') {
          return (
            <Text
              my={3}
              cursor={'pointer'}
              onClick={() => {
                setActiveRow(updated)
                onOpen()
              }}
            >
              {updated}
            </Text>
          )
        }

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
      },
      wrap: true
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
      width: '200px',
      right: 'true',
      wrap: true
    },
    // CHANGED ON
    {
      id: 'ACTIVITY_LOGS_CREATED_AT',
      name: 'CHANGED',
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
      width: '180px',
      right: 'true',
      wrap: true
    }
  ]

  const handlePreviousPage = async () => {
    disablePaginationControl()
    await refetch({
      projectId: productId,
      sbomId: sbomId,
      first: undefined,
      last: totalRows,
      after: undefined,
      before: activityLogs?.pageInfo?.startCursor,
      field: field,
      direction: direction
    }).then(
      (res) =>
        res?.data &&
        sbomLogDispatch({
          type: 'DECREMENT_PAGE',
          payload: data?.pageInfo?.startCursor
        })
    )
  }

  const handleNextPage = async () => {
    disablePaginationControl()
    refetch({
      projectId: productId,
      sbomId: sbomId,
      first: totalRows,
      last: undefined,
      after: activityLogs?.pageInfo?.endCursor,
      before: undefined,
      field: field,
      direction: direction
    }).then(
      (res) =>
        res?.data &&
        sbomLogDispatch({
          type: 'INCREMENT_PAGE',
          payload: {
            total: activityLogs?.totalCount,
            after: activityLogs?.pageInfo?.endCursor
          }
        })
    )
  }

  // CLEAR SERACH
  const handleClear = useCallback(async () => {
    disablePaginationControl()
    setLogSearch('')
    await refetch({
      projectId: productId,
      sbomId: sbomId,
      search: undefined,
      first: totalRows
    }).then((res) => {
      if (res?.data) {
        setPaginationControl(res?.data)
        sbomLogDispatch({
          type: 'CLEAR_SEARCH_INPUT'
        })
      }
    })
  }, [productId, refetch, sbomId, sbomLogDispatch, totalRows])

  // ON SEARCH INPUT CHANGE
  const onSearchInputChange = useCallback(
    (e) => {
      const { value } = e.target
      if (value === '') {
        handleClear()
      } else {
        setLogSearch(value)
      }
    },
    [handleClear]
  )

  // SEARCH COMPONENT
  const handleSearch = useCallback(
    async (event) => {
      disablePaginationControl()
      const { value } = event.target
      if (event.key === 'Enter' && logSearch !== '') {
        await refetch({
          projectId: productId,
          sbomId: sbomId,
          search: value,
          first: totalRows,
          last: undefined,
          after: undefined,
          before: undefined
        }).then((res) => {
          if (res.data) {
            setPaginationControl(res?.data)
            sbomLogDispatch({ type: 'CHANGE_SEARCH_INPUT', payload: value })
          }
        })
      }
    },
    [logSearch, productId, refetch, sbomId, sbomLogDispatch, totalRows]
  )

  // SET ROW LENGTH
  const handleSetRow = async (e) => {
    disablePaginationControl()

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
    }).then((res) => {
      if (res.data) {
        setPaginationControl(res?.data)
        sbomLogDispatch({ type: 'FETCH_DATA_SUCCESS' })
      }
    })
  }

  const handleSort = async (column, sortDirection) => {
    disablePaginationControl()

    await refetch({
      projectId: productId,
      sbomId: sbomId,
      first: totalRows,
      last: undefined,
      field: column.id,
      direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
    }).then((res) => {
      if (res.data) {
        setPaginationControl(res?.data)
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
          {filters && <LogFilters />}
        </Stack>
        <Tooltip label='Refresh'>
          <IconButton
            onClick={handleClear}
            colorScheme='blue'
            icon={<RepeatIcon />}
          />
        </Tooltip>
      </Flex>
    )
  }, [logSearch, onSearchInputChange, handleSearch, handleClear, filters])

  if (error) {
    return (
      <Card>
        <Text>Something went wrong</Text>
      </Card>
    )
  }

  return (
    <>
      <Flex flexDir={'column'} width={'100%'} position={'relative'}>
        <DataTable
          columns={columns}
          data={activityLogs?.nodes}
          onSort={handleSort}
          defaultSortAsc={false}
          defaultSortFieldId={field}
          customStyles={customStyles}
          progressPending={activityLogs ? false : true}
          progressComponent={<CustomLoader />}
          subHeader
          persistTableHead
          subHeaderComponent={subHeaderComponentMemo}
          responsive={true}
        />
      </Flex>

      {/* PAGINATION */}
      {activityLogs && (
        <Pagination
          paginationSizes={paginationSizes}
          pageIndex={pageIndex}
          totalRows={totalRows}
          totalCount={activityLogs?.totalCount}
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
          onSetRow={handleSetRow}
          hasNextPage={isNextActive}
          hasPreviousPage={isPrevActive}
        />
      )}

      {isOpen && (
        <PurlCard value={activeRow} isOpen={isOpen} onClose={onClose} />
      )}
    </>
  )
}

export default Changelog
