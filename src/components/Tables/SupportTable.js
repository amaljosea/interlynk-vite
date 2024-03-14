import { Flex, IconButton, Stack, Switch, Text, Tooltip } from '@chakra-ui/react'
import CustomLoader from 'components/CustomLoader'
import DataTable from 'react-data-table-component'
import { useMemo, useState, useEffect } from 'react'
import SearchFilter from 'views/Sbom/components/SearchFilter'
import { customStyles, timeSince, getFullDateAndTime } from 'utils'
import { BiSolidWrench } from 'react-icons/bi'
import { GoSkip } from 'react-icons/go'
import { useGlobalState } from 'hooks/useGlobalState'
import Pagination from 'components/Pagination'
import { RepeatIcon } from '@chakra-ui/icons'
import { FaCheck } from 'react-icons/fa6'
import { FaTimes } from 'react-icons/fa'

const SupportTable = ({ projectId, sbomId, data, refetch }) => {
  const { totalRows, setTotalRows, supportState, dispatch } = useGlobalState()
  const { pageIndex, field, direction } = supportState
  const { supportDispatch } = dispatch

  const paginationSizes = [25, 50, 100]
  const [isPrevActive, setIsPrevActive] = useState(false)
  const [isNextActive, setIsNextActive] = useState(false)
  const [filterText, setFilterText] = useState('')

  const supportData = { sbomId, first: totalRows, field, direction }

  const setPaginationControl = (data) => {
    setIsPrevActive(data?.pageInfo?.hasPreviousPage)
    setIsNextActive(data?.pageInfo?.hasNextPage)
  }

  const handleRefetch = async (after, before) => {
    disablePaginationControl()
    await refetch({
      variables: {
        projectId: projectId || undefined,
        sbomId: sbomId || undefined
      }
    }).then((res) => {
      if (res?.data) {
        console.log('res', res?.data?.componentSupportInfos);
        setPaginationControl(res?.data?.componentSupportInfos)
      }
    })
  }


  const disablePaginationControl = () => {
    setIsPrevActive(false)
    setIsNextActive(false)
  }

  const handleRefresh = async () => {
    disablePaginationControl()
    await refetch({
      variables: {
        projectId: projectId || undefined,
        sbomId: sbomId || undefined
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
        projectId: projectId || undefined,
        sbomId: sbomId || undefined
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
          projectId: projectId || undefined,
          sbomId: sbomId || undefined
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
        projectId: projectId || undefined,
        sbomId: sbomId || undefined
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
        projectId: projectId || undefined,
        sbomId: sbomId || undefined
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
      <Flex width={'100%'} alignItems={'center'} justifyContent={'space-between'}>
        {/* SEARCH COMPONENTS */}
        <SearchFilter id='support' filterText={filterText} onChange={onSearchInputChange} onClear={handleClear} onFilter={handleSearch} />
        <Tooltip label='Refresh'>
          <IconButton colorScheme='blue' onClick={handleRefresh} icon={<RepeatIcon />} />
        </Tooltip>
      </Flex>
    )
  }, [filterText, onSearchInputChange, handleClear, handleSearch, handleRefresh])

  // COLUMNS
  const columns = [
    {
      id: 'ENABLED',
      name: 'ACTIVE',
      selector: (row) => {
        const { enabled } = row
        return <Switch size='md' defaultChecked={enabled} isReadOnly />
      },
      width: '150px',
      omit: true,
    },
    {
      id: 'EOL_INFOS_NAME',
      name: 'COMPONENT',
      selector: (row) => <Text my={4}>{row?.productName}</Text>,
      wrap: true,
      width: '350px'
    },
    {
      id: 'EOL_INFOS_VERSION',
      name: 'VERSION',
      selector: (row) => row?.productVersion,
      width: '200px',
      wrap: true
    },
    {
      id: 'DEPRECATED',
      name: 'DEPRECATED',
      selector: (row) => row?.deprecated ? <IconButton pointerEvents={'none'} colorScheme='green' size='sm' icon={<FaCheck />} /> : <IconButton pointerEvents={'none'}  size='sm' icon={<FaTimes />}/>,
      wrap: true
    },
    {
      id: 'OUTDATED',
      name: 'OUTDATED',
      selector: (row) => row?.outdated ? <IconButton pointerEvents={'none'} colorScheme='green' size='sm' icon={<FaCheck />} /> : <IconButton pointerEvents={'none'} size='sm' icon={<FaTimes />}/>,
      wrap: true
    },
    {
      id: 'EOL_INFOS_EOL_DATE',
      name: 'END-OF-LIFE',
      selector: (row) => row?.eol || '',
      width: '250px',
      wrap: true
    },
    {
      id: 'EOL_INFOS_EOL_SUPPORT',
      name: 'END-OF-SERVICE',
      selector: (row) => row?.eos || '',
      width: '250px',
      wrap: true
    },
    // UPDATED AT
    {
      id: 'UPDATED_AT',
      name: 'UPDATED',
      selector: (row) => (
        <Tooltip label={getFullDateAndTime(row.updatedAt)} placement={'top'}>{timeSince(row.updatedAt)}</Tooltip>
      ),
      width: '160px',
      right: 'true',
      wrap: true
    },
    {
      id: 'ACTION',
      name: 'ACTION',
      selector: (row) => {
        return (
          <Stack direction={'row'} alignItems={'center'} spacing={2}>
            <Tooltip label='Fix'>
              <IconButton size='sm' variant='solid' colorScheme='blue' fontWeight='normal' icon={<BiSolidWrench size={18} />} />
            </Tooltip>

            <Tooltip label='Ignore'>
              <IconButton size='sm' variant='solid' colorScheme='blue' fontWeight='normal' icon={<GoSkip size={18} />} />
            </Tooltip>
          </Stack>
        )
      },
      right: 'true',
      omit: true
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
          totalCount={data?.totalCount}
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
