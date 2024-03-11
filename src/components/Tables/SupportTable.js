import { Flex, IconButton, Stack, Tooltip } from '@chakra-ui/react'
import CustomLoader from 'components/CustomLoader'
import DataTable from 'react-data-table-component'
import { useMemo, useState, useEffect } from 'react'
import SearchFilter from 'views/Sbom/components/SearchFilter'
import { FaCheckDouble } from 'react-icons/fa6'
import { customStyles } from 'utils'
import { BiSolidWrench } from 'react-icons/bi'
import { GoSkip } from 'react-icons/go'
import { useGlobalState } from 'hooks/useGlobalState'
import Pagination from 'components/Pagination'

const SupportTable = ({ sbomId, data, refetch }) => {
  const { totalRows, setTotalRows, supportState, dispatch } = useGlobalState()
  const { pageIndex, searchInput, field, direction } = supportState
  const { supportDispatch } = dispatch

  const paginationSizes = [25, 50, 100]
  const [isPrevActive, setIsPrevActive] = useState(false)
  const [isNextActive, setIsNextActive] = useState(false)
  const [filterText, setFilterText] = useState('')

  const supportData = {
    sbomId,
    first: totalRows,
    field,
    direction
  }

  const handleRefetch = async (after, before) => {
    disablePaginationControl()
    await refetch({
      variables: {
        sbomId,
        first: after ? totalRows : undefined,
        after: after ? after : undefined,
        last: before ? totalRows : undefined,
        before: before ? before : undefined,
        search: searchInput !== '' ? searchInput : undefined,
        field,
        direction
      }
    }).then((res) => {
      if (res?.data) {
        setPaginationControl(res?.data)
      }
    })
  }

  const setPaginationControl = (data) => {
    setIsPrevActive(data?.pageInfo?.hasPreviousPage)
    setIsNextActive(data?.pageInfo?.hasNextPage)
  }

  const disablePaginationControl = () => {
    setIsPrevActive(false)
    setIsNextActive(false)
  }

  const handleRefresh = async () => {
    disablePaginationControl()
    await refetch({
      variables: {
        ...supportData,
        first: totalRows
      }
    }).then(
      (res) => res?.data && supportDispatch({ type: 'CLEAR_SEARCH_INPUT' })
    )
  }

  // CLEAR SERACH
  const handleClear = async () => {
    setFilterText('')
    await refetch({
      variables: {
        ...supportData,
        first: totalRows,
        search: undefined
      }
    }).then(
      (res) => res?.data && supportDispatch({ type: 'CLEAR_SEARCH_INPUT' })
    )
  }

  // ON SEARCH INPUT CHANGE
  const onSearchInputChange = (e) => {
    const { value } = e.target
    if (value === '') {
      handleClear()
    } else {
      setFilterText(value)
    }
  }

  // SEARCH COMPONENT
  const handleSearch = async (event) => {
    const { value } = event.target
    if (event.key === 'Enter' && filterText !== '') {
      refetch({
        variables: {
          ...supportData,
          search: value,
          first: totalRows
        }
      }).then(
        (res) =>
          res?.data &&
          supportDispatch({ type: 'CHANGE_SEARCH_INPUT', payload: value })
      )
    }
  }

  const handleSort = async (column, sortDirection) => {
    await refetch({
      variables: {
        sbomId,
        first: totalRows,
        field: column.id,
        direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
      }
    }).then((res) => {
      if (res.data) {
        supportDispatch({
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
    disablePaginationControl()
    await refetch({
      variables: {
        sbomId,
        first: Number(e.target.value),
        field,
        direction
      }
    }).then((res) => {
      if (res.data) {
        setPaginationControl(res.data)
        supportDispatch({ type: 'FETCH_DATA_SUCCESS' })
      }
    })
  }

  const handlePreviousPage = async () => {
    disablePaginationControl()
    handleRefetch(null, data.pageInfo.startCursor)
    supportDispatch({
      type: 'DECREMENT_PAGE',
      payload: data.pageInfo.startCursor
    })
  }

  const handleNextPage = async () => {
    disablePaginationControl()
    handleRefetch(data.pageInfo.endCursor, null)
    supportDispatch({
      type: 'INCREMENT_PAGE',
      payload: {
        total: data.totalCount,
        after: data.pageInfo.endCursor
      }
    })
  }

  // SUB HEADER
  const subHeader = useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        {/* SEARCH COMPONENTS */}
        <SearchFilter
          id='support'
          filterText={filterText}
          onChange={onSearchInputChange}
          onClear={handleClear}
          onFilter={handleSearch}
        />
        <Tooltip label='Refresh'>
          <IconButton
            colorScheme='blue'
            onClick={handleRefresh}
            icon={<FaCheckDouble />}
          />
        </Tooltip>
      </Flex>
    )
  }, [
    filterText,
    onSearchInputChange,
    handleClear,
    handleSearch,
    handleRefresh
  ])

  // COLUMNS
  const columns = [
    {
      id: 'EOL_INFOS_NAME',
      name: 'COMPONENT',
      selector: (row) => row?.name,
      wrap: true,
      width: '200px',
      sortable: true
    },
    {
      id: 'EOL_INFOS_VERSION',
      name: 'VERSION',
      selector: (row) => row?.version,
      width: '200px',
      wrap: true,
      sortable: true
    },
    {
      id: 'EOL_INFOS_LTS',
      name: 'LTS',
      selector: (row) => (row?.lts ? 'True' : 'False'),
      width: '200px',
      wrap: true,
      sortable: true
    },
    {
      id: 'EOL_INFOS_EOL_DATE',
      name: 'END-OF-LIFE',
      selector: (row) => row?.eolDate || '',
      width: '250px',
      wrap: true,
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a.eolDate)
        const dateB = new Date(b.eolDate)
        return dateA - dateB
      }
    },
    {
      id: 'EOL_INFOS_EOL_SUPPORT',
      name: 'END-OF-SERVICE',
      selector: (row) => row?.eolSupport || '',
      width: '250px',
      wrap: true,
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a.eolSupport)
        const dateB = new Date(b.eolSupport)
        return dateA - dateB
      }
    },
    {
      id: 'ACTION',
      name: 'ACTION',
      selector: (row) => {
        return (
          <Stack direction={'row'} alignItems={'center'} spacing={2}>
            <Tooltip label='Fix'>
              <IconButton
                size='sm'
                variant='solid'
                colorScheme='blue'
                fontWeight='normal'
                icon={<BiSolidWrench size={18} />}
              />
            </Tooltip>

            <Tooltip label='Ignore'>
              <IconButton
                size='sm'
                variant='solid'
                colorScheme='blue'
                fontWeight='normal'
                icon={<GoSkip size={18} />}
              />
            </Tooltip>
          </Stack>
        )
      },
      right: 'true'
    }
  ]

  useEffect(() => {
    if (data) {
      setIsPrevActive(data?.pageInfo?.hasPreviousPage)
      setIsNextActive(data?.pageInfo?.hasNextPage)
    }
  }, [data])

  return (
    <Flex flexDir={'column'} width={'100%'}>
      <DataTable
        columns={columns}
        data={data?.nodes || []}
        customStyles={customStyles}
        onSort={handleSort}
        defaultSortFieldId={field}
        defaultSortAsc={false}
        progressPending={data ? false : true}
        persistTableHead
        subHeader
        subHeaderComponent={subHeader}
        progressComponent={<CustomLoader />}
        responsive={true}
      />

      {/* PAGINATION */}
      {data?.pageInfo && (
        <Pagination
          paginationSizes={paginationSizes}
          pageIndex={pageIndex}
          totalRows={totalRows}
          totalCount={data.totalCount}
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
          onSetRow={handleSetRow}
          hasNextPage={isNextActive}
          hasPreviousPage={isPrevActive}
        />
      )}
    </Flex>
  )
}

export default SupportTable
