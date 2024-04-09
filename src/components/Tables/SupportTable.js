import { useCallback, useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useLocation } from 'react-router-dom'
import { customStyles, getFullDateAndTime, timeSince } from 'utils'
import DeleteModal from 'views/Dashboard/Support/DeleteModal'
import StatusModal from 'views/Dashboard/Support/StatusModal'
import SupportModal from 'views/Dashboard/Support/SupportModal'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { CheckIcon, RepeatIcon } from '@chakra-ui/icons'
import {
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Stack,
  Switch,
  Tag,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import Pagination from 'components/Pagination'

import { useGlobalState } from 'hooks/useGlobalState'

import { FaEllipsisV } from 'react-icons/fa'
import { FaPlus } from 'react-icons/fa6'

const SupportTable = ({ data, refetch }) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const projectId = queryParams.get('id')
  const sbomId = queryParams.get('sbom')

  const { totalRows, setTotalRows, supportState, dispatch } = useGlobalState()
  const { pageIndex, searchInput, field, direction } = supportState
  const { supportDispatch } = dispatch

  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isActiveOpen,
    onOpen: onActiveOpen,
    onClose: onActiveClose
  } = useDisclosure()
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose
  } = useDisclosure()

  const paginationSizes = [25, 50, 100]
  const [activeRow, setActiveRow] = useState(null)
  const [isPrevActive, setIsPrevActive] = useState(false)
  const [isNextActive, setIsNextActive] = useState(false)
  const [filterText, setFilterText] = useState('')

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
        field,
        direction
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

  const handleRefresh = useCallback(async () => {
    disablePaginationControl()
    if (sbomId) {
      await refetch({ variables: { projectId, sbomId } })
    } else {
      await refetch({
        variables: {
          search: searchInput === '' ? undefined : searchInput,
          first: totalRows,
          field,
          direction
        }
      }).then(
        (res) => res?.data && supportDispatch({ type: 'CLEAR_SEARCH_INPUT' })
      )
    }
  }, [
    direction,
    field,
    projectId,
    refetch,
    sbomId,
    searchInput,
    supportDispatch,
    totalRows
  ])

  // CLEAR SERACH
  const handleClear = useCallback(async () => {
    setFilterText('')
    await refetch({
      variables: {
        search: undefined,
        first: totalRows,
        field: field,
        direction: direction
      }
    }).then(
      (res) => res?.data && supportDispatch({ type: 'CLEAR_SEARCH_INPUT' })
    )
  }, [direction, field, refetch, supportDispatch, totalRows])

  // ON SEARCH INPUT CHANGE
  const onSearchInputChange = useCallback(
    (e) => {
      const { value } = e.target
      if (value === '') {
        handleClear()
      } else {
        setFilterText(value)
      }
    },
    [handleClear]
  )

  // SEARCH COMPONENT
  const handleSearch = useCallback(
    async (event) => {
      const { value } = event.target
      if (event.key === 'Enter' && filterText !== '') {
        refetch({
          variables: { search: value, first: totalRows, field, direction }
        }).then(
          (res) =>
            res?.data &&
            supportDispatch({ type: 'CHANGE_SEARCH_INPUT', payload: value })
        )
      }
    },
    [direction, field, filterText, refetch, supportDispatch, totalRows]
  )

  const handleSort = async (column, sortDirection) => {
    await refetch({
      variables: {
        search: searchInput === '' ? undefined : searchInput,
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
        search: searchInput === '' ? undefined : searchInput,
        first: Number(e.target.value),
        field: field,
        direction: direction
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
      payload: { total: data.totalCount, after: data.pageInfo.endCursor }
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
            <IconButton
              colorScheme='blue'
              onClick={handleRefresh}
              icon={<RepeatIcon />}
            />
          </Tooltip>
        </Stack>
      </Flex>
    )
  }, [
    filterText,
    onSearchInputChange,
    handleClear,
    handleSearch,
    sbomId,
    handleRefresh,
    onOpen
  ])

  const getColor = (eolDate) => {
    const currentDate = new Date()
    const sixMonthsFromToday = new Date()
    sixMonthsFromToday.setMonth(sixMonthsFromToday.getMonth() + 6)

    if (new Date(eolDate) <= currentDate) {
      return 'red'
    } else if (new Date(eolDate) <= sixMonthsFromToday) {
      return 'orange'
    } else {
      return 'green'
    }
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
            isChecked={enabled}
            onChange={() => {
              setActiveRow(row)
              onActiveOpen()
            }}
          />
        )
      },
      width: '110px',
      omit: sbomId ? true : false,
      sortable: true
    },
    {
      id: 'COMPONENT_SUPPORT_OVERRIDES_PRODUCT_NAME',
      name: 'PRODUCT',
      selector: (row) => {
        return (
          <Stack my={4}>
            <Text>{row?.productName}</Text>
            <Text>{row?.productVersion}</Text>
          </Stack>
        )
      },
      wrap: true,
      width: '200px',
      sortable: true
    },
    {
      id: 'IDURI',
      name: 'URI',
      selector: (row) => <Text my={4}>{row?.idUri}</Text>,
      wrap: true,
      width: '320px'
    },
    {
      id: 'COMPONENT_SUPPORT_OVERRIDES_PRODUCT_VERSION',
      name: 'VERSION',
      selector: (row) => row?.productVersion,
      width: '150px',
      wrap: true,
      sortable: true,
      omit: true
    },
    {
      id: 'DEPRECATED',
      name: 'DEPRECATED',
      selector: (row) =>
        row?.deprecated ? <CheckIcon color={'red.500'} /> : '',
      width: '150px',
      wrap: true
    },
    {
      id: 'OUTDATED',
      name: 'OUTDATED',
      selector: (row) => (row?.outdated ? <CheckIcon color={'red.500'} /> : ''),
      width: '150px',
      wrap: true
    },
    {
      id: 'EOL_INFOS_EOL_DATE',
      name: 'END-OF-LIFE',
      selector: (row) => {
        const { eol } = row
        return (
          <Tag variant='solid' colorScheme={getColor(eol)} hidden={!eol}>
            {eol}
          </Tag>
        )
      },
      width: '160px',
      wrap: true
    },
    {
      id: 'EOL_INFOS_EOL_SUPPORT',
      name: 'END-OF-SERVICE',
      selector: (row) => {
        const { eos } = row
        return (
          <Tag variant='solid' colorScheme={getColor(eos)} hidden={!eos}>
            {eos}
          </Tag>
        )
      },
      width: '160px',
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
                <MenuItem
                  color='red'
                  onClick={() => {
                    setActiveRow(row)
                    onDeleteOpen()
                  }}
                >
                  Archive Support
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        )
      },
      width: '120px',
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

      {isOpen && (
        <SupportModal
          supports={data?.nodes || []}
          data={activeRow}
          isOpen={isOpen}
          onClose={onClose}
          refetch={refetch}
        />
      )}

      {isDeleteOpen && (
        <DeleteModal
          data={activeRow}
          isOpen={isDeleteOpen}
          onClose={onDeleteClose}
          refetch={refetch}
        />
      )}

      {isActiveOpen && (
        <StatusModal
          data={activeRow}
          isOpen={isActiveOpen}
          onClose={onActiveClose}
          refetch={refetch}
        />
      )}
    </>
  )
}

export default SupportTable
