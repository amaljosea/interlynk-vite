import { Flex, IconButton, Menu, MenuButton, MenuItem, MenuList, Portal, Stack, Switch, Text, Tooltip, useDisclosure
} from '@chakra-ui/react'
import CustomLoader from 'components/CustomLoader'
import DataTable from 'react-data-table-component'
import { useMemo, useState, useEffect } from 'react'
import SearchFilter from 'views/Sbom/components/SearchFilter'
import { customStyles, timeSince, getFullDateAndTime } from 'utils'
import { useGlobalState } from 'hooks/useGlobalState'
import Pagination from 'components/Pagination'
import { RepeatIcon } from '@chakra-ui/icons'
import { FaCheck, FaPlus } from 'react-icons/fa6'
import { FaEllipsisV, FaTimes } from 'react-icons/fa'
import SupportModal from 'views/Dashboard/Support/SupportModal'
import { useLocation } from 'react-router-dom'
import { DeleteCompSupportOverride } from 'graphQL/Mutation'
import { useMutation } from '@apollo/client'
import { UpdateCompSupportOverride } from 'graphQL/Mutation'

const SupportTable = ({ data, refetch }) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const projectId = queryParams.get('id')
  const sbomId = queryParams.get('sbom')

  const { totalRows, setTotalRows, supportState, dispatch } = useGlobalState()
  const { pageIndex, searchInput, field, direction } = supportState
  const { supportDispatch } = dispatch

  const { isOpen, onOpen, onClose } = useDisclosure()

  const paginationSizes = [25, 50, 100]
  const [activeRow, setActiveRow] = useState(null)
  const [isPrevActive, setIsPrevActive] = useState(false)
  const [isNextActive, setIsNextActive] = useState(false)
  const [filterText, setFilterText] = useState('')

  const supportData = { search: searchInput === '' ? undefined : searchInput, first: totalRows, field: field, direction: direction }

  const [deleteSupport] = useMutation(DeleteCompSupportOverride)
  const [updateSupport] = useMutation(UpdateCompSupportOverride)

  const setPaginationControl = (data) => {
    setIsPrevActive(data?.pageInfo?.hasPreviousPage)
    setIsNextActive(data?.pageInfo?.hasNextPage)
  }

  const handleRefetch = async (after, before) => {
    disablePaginationControl()
    await refetch({
      variables: {
        search: searchInput === '' ? undefined : searchInput,
        first: after ? totalRows : undefined,
        after: after ? after : undefined,
        last: before ? totalRows : undefined,
        before: before ? before : undefined,
        field: field,
        direction: direction
      }
    }).then((res) => {
      if (res?.data) {
        console.log('res', res?.data?.supports)
        setPaginationControl(res?.data?.supports)
      }
    })
  }

  const disablePaginationControl = () => {
    setIsPrevActive(false)
    setIsNextActive(false)
  }

  const handleRefresh = async () => {
    disablePaginationControl()
    if (sbomId) {
      await refetch({ variables: { projectId, sbomId } })
    } else {
      await refetch({ variables: { search: searchInput === '' ? undefined : searchInput, first: totalRows, field: field, direction: direction }
      }).then((res) => res?.data && supportDispatch({ type: 'CLEAR_SEARCH_INPUT' }))
    }
  }

  // CLEAR SERACH
  const handleClear = async () => {
    setFilterText('')
    await refetch({ variables: { search: undefined, first: totalRows, field: field, direction: direction } })
    .then((res) => res?.data && supportDispatch({ type: 'CLEAR_SEARCH_INPUT' }))
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
      refetch({ variables: { search: value, first: totalRows, field: field, direction: direction }
      }).then((res) => res?.data && supportDispatch({ type: 'CHANGE_SEARCH_INPUT', payload: value }) )
    }
  }

  const handleSort = async (column, sortDirection) => {
    await refetch({
      variables: { search: searchInput === '' ? undefined : searchInput, first: totalRows, field: column.id, direction: sortDirection === 'asc' ? 'ASC' : 'DESC' }
    }).then((res) => {
      if (res.data) {
        supportDispatch({ type: 'SET_SORT_ORDER', payload: { field: column.id, direction: sortDirection === 'asc' ? 'ASC' : 'DESC' } })
      }
    })
  }

  // SET ROW LENGTH
  const handleSetRow = async (e) => {
    setTotalRows(Number(e.target.value))
    disablePaginationControl()
    await refetch({ variables: { search: searchInput === '' ? undefined : searchInput, first: Number(e.target.value), field: field, direction: direction }
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
    supportDispatch({ type: 'DECREMENT_PAGE', payload: data.pageInfo.startCursor })
  }

  const handleNextPage = async () => {
    disablePaginationControl()
    handleRefetch(data.pageInfo.endCursor, null)
    supportDispatch({ type: 'INCREMENT_PAGE', payload: { total: data.totalCount, after: data.pageInfo.endCursor } })
  }

  // SUB HEADER
  const subHeader = useMemo(() => {
    return (
      <Flex width={'100%'} alignItems={'center'} justifyContent={'space-between'}>
        {/* SEARCH COMPONENTS */}
        <SearchFilter id='support' filterText={filterText} onChange={onSearchInputChange} onClear={handleClear} onFilter={handleSearch} />
        <Stack spacing={2} alignItems={'center'} direction={'row'}>
          {!sbomId && (
            <Tooltip label='Create Support'>
              <IconButton
                colorScheme='blue'
                onClick={() => {
                  setActiveRow(null)
                  onOpen()
                }}
                icon={<FaPlus />}
              />
            </Tooltip>
          )}
          <Tooltip label='Refresh'>
            <IconButton colorScheme='blue' onClick={handleRefresh} icon={<RepeatIcon />}/>
          </Tooltip>
        </Stack>
      </Flex>
    )
  }, [filterText,onSearchInputChange,handleClear,handleSearch,handleRefresh])

  // const onChangeStatus = async (e, row) => {
  //   e.preventDefault()
  //   await updateSupport({
  //     variables: { id: row?.id, enabled: e.target.checked }
  //   }).then((res) => res?.data && refetch({ ...supportData }))
  // }

  const onDeleteSupport = async (id) => {
    await deleteSupport({ variables: { id } }).then((res) => res?.data && refetch({ variables: { ...supportData } }))
  }

  // COLUMNS
  const columns = [
    {
      id: 'COMPONENT_SUPPORT_OVERRIDES_ENABLED',
      name: 'ACTIVE',
      selector: (row) => {
        const { enabled } = row
        return (
          <Switch
            size='md'
            defaultChecked={enabled}
            isReadOnly
            // onChange={(e) => onChangeStatus(e, row)}
          />
        )
      },
      width: '150px',
      omit: sbomId ? true : false,
      sortable: true
    },
    {
      id: 'COMPONENT_SUPPORT_OVERRIDES_PRODUCT_NAME',
      name: 'COMPONENT',
      selector: (row) => <Text my={4}>{row?.productName}</Text>,
      wrap: true,
      width: '350px',
      sortable: true
    },
    {
      id: 'COMPONENT_SUPPORT_OVERRIDES_PRODUCT_VERSION',
      name: 'VERSION',
      selector: (row) => row?.productVersion,
      width: '200px',
      wrap: true,
      sortable: true
    },
    {
      id: 'DEPRECATED',
      name: 'DEPRECATED',
      selector: (row) =>
        row?.deprecated ? (
          <IconButton
            pointerEvents={'none'}
            colorScheme='green'
            size='xs'
            icon={<FaCheck />}
          />
        ) : (
          <IconButton
            colorScheme='red'
            pointerEvents={'none'}
            size='xs'
            icon={<FaTimes />}
          />
        ),
      width: '150px',
      wrap: true
    },
    {
      id: 'OUTDATED',
      name: 'OUTDATED',
      selector: (row) =>
        row?.outdated ? (
          <IconButton
            pointerEvents={'none'}
            colorScheme='green'
            size='xs'
            icon={<FaCheck />}
          />
        ) : (
          <IconButton
            colorScheme='red'
            pointerEvents={'none'}
            size='xs'
            icon={<FaTimes />}
          />
        ),
      width: '150px',
      wrap: true
    },
    {
      id: 'EOL_INFOS_EOL_DATE',
      name: 'END-OF-LIFE',
      selector: (row) => row?.eol || '',
      width: '200px',
      wrap: true
    },
    {
      id: 'EOL_INFOS_EOL_SUPPORT',
      name: 'END-OF-SERVICE',
      selector: (row) => row?.eos || '',
      width: '200px',
      wrap: true
    },
    // UPDATED AT
    {
      id: 'COMPONENT_SUPPORT_OVERRIDES_UPDATED_AT',
      name: 'UPDATED',
      selector: (row) => (
        <Tooltip label={getFullDateAndTime(row.updatedAt)} placement={'top'}>
          {timeSince(row.updatedAt)}
        </Tooltip>
      ),
      width: '160px',
      right: 'true',
      wrap: true,
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a.updatedAt)
        const dateB = new Date(b.updatedAt)
        return dateA - dateB
      }
    },
    {
      id: 'ACTION',
      name: 'ACTION',
      selector: (row) => {
        return (
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FaEllipsisV />}
              variant='none'
              color='gray.400'
            />
            <Portal>
              <MenuList fontSize={'sm'}>
                {/* EDIT SUPPORT */}
                <MenuItem
                  onClick={() => {
                    setActiveRow(row)
                    onOpen()
                  }}
                >
                  Edit Support
                </MenuItem>
                {/* DELETE SUPPORT  */}
                <MenuItem color='red' onClick={() => onDeleteSupport(row?.id)}>
                  Archive Support
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        )
      },
      right: 'true',
      omit: sbomId ? true : false
    }
  ]

  useEffect(() => {
    if (data) {
      setIsPrevActive(data?.pageInfo?.hasPreviousPage)
      setIsNextActive(data?.pageInfo?.hasNextPage)
    }
  }, [data])

  return (
    <>
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

      {isOpen && <SupportModal data={activeRow} isOpen={isOpen} onClose={onClose} refetch={refetch} />}
    </>
  )
}

export default SupportTable
