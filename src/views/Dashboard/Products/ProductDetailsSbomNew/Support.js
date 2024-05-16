import { useQuery } from '@apollo/client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useLocation, useParams } from 'react-router-dom'
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

import Card from 'components/Card/Card'
import CustomLoader from 'components/CustomLoader'
import Pagination from 'components/Pagination'

import { useGlobalState } from 'hooks/useGlobalState'

import { GetSbomSupportTab } from 'graphQL/Queries'

import { FaEllipsisV } from 'react-icons/fa'
import { FaPlus } from 'react-icons/fa6'

const Support = () => {
  const params = useParams()
  const projectId = params.productid
  const sbomId = params.sbomid
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const activeTab = queryParams.get('tab')

  const { data, refetch, error } = useQuery(GetSbomSupportTab, {
    skip: activeTab === 'support' ? false : true,
    variables: { projectId: projectId, sbomId }
  })

  const { supports } = data?.sbom || ''

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
  const [filterText, setFilterText] = useState(searchInput)

  const setPaginationControl = (data) => {
    setIsPrevActive(data?.pageInfo?.hasPreviousPage)
    setIsNextActive(data?.pageInfo?.hasNextPage)
  }

  const handleRefetch = async (after, before) => {
    disablePaginationControl()
    await refetch({
      search: searchInput === '' ? undefined : searchInput,
      first: after ? totalRows : undefined,
      after: after ? after : undefined,
      last: before ? totalRows : undefined,
      before: before ? before : undefined,
      field,
      direction
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
      await refetch({ projectId, sbomId })
    } else {
      await refetch({
        search: searchInput === '' ? undefined : searchInput,
        first: totalRows,
        field,
        direction
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
    if (sbomId) {
      return null
    } else {
      await refetch({
        search: undefined,
        first: totalRows,
        field: field,
        direction: direction
      }).then(
        (res) => res?.data && supportDispatch({ type: 'CLEAR_SEARCH_INPUT' })
      )
    }
  }, [direction, field, refetch, sbomId, supportDispatch, totalRows])

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
      if (sbomId) {
        return null
      } else {
        if (event.key === 'Enter' && filterText !== '') {
          refetch({ search: value, first: totalRows, field, direction }).then(
            (res) =>
              res?.data &&
              supportDispatch({ type: 'CHANGE_SEARCH_INPUT', payload: value })
          )
        }
      }
    },
    [direction, field, filterText, refetch, sbomId, supportDispatch, totalRows]
  )

  const handleSort = async (column, sortDirection) => {
    if (sbomId) {
      return null
    } else {
      await refetch({
        search: searchInput === '' ? undefined : searchInput,
        first: totalRows,
        field: column.id,
        direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
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
  }

  // SET ROW LENGTH
  const handleSetRow = async (e) => {
    setTotalRows(Number(e.target.value))
    disablePaginationControl()
    await refetch({
      search: searchInput === '' ? undefined : searchInput,
      first: Number(e.target.value),
      field: field,
      direction: direction
    }).then((res) => {
      if (res.data) {
        setPaginationControl(res.data)
        supportDispatch({ type: 'FETCH_DATA_SUCCESS' })
      }
    })
  }

  const handlePreviousPage = async () => {
    disablePaginationControl()
    handleRefetch(null, supports?.pageInfo?.startCursor)
    supportDispatch({
      type: 'DECREMENT_PAGE',
      payload: supports?.pageInfo?.startCursor
    })
  }

  const handleNextPage = async () => {
    disablePaginationControl()
    handleRefetch(supports?.pageInfo?.endCursor, null)
    supportDispatch({
      type: 'INCREMENT_PAGE',
      payload: {
        total: supports?.totalCount,
        after: supports?.pageInfo?.endCursor
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
      width: '8%',
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
      width: '20%',
      sortable: true
    },
    {
      id: 'IDS',
      name: 'IDS',
      selector: (row) => <Text my={4}>{row?.idUri}</Text>,
      wrap: true,
      width: '20%'
    },
    {
      id: 'COMPONENT_SUPPORT_OVERRIDES_PRODUCT_VERSION',
      name: 'VERSION',
      selector: (row) => row?.productVersion,
      width: '12%',
      wrap: true,
      sortable: true,
      omit: true
    },
    {
      id: 'DEPRECATED',
      name: 'DEPRECATED',
      selector: (row) =>
        row?.deprecated ? <CheckIcon color={'red.500'} /> : '',
      width: '12%',
      wrap: true
    },
    {
      id: 'OUTDATED',
      name: 'OUTDATED',
      selector: (row) => (row?.outdated ? <CheckIcon color={'red.500'} /> : ''),
      width: '12%',
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
      width: '12%',
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
      width: '12%',
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
      width: '8%',
      right: 'true',
      omit: sbomId ? true : false
    }
  ]

  useEffect(() => {
    if (supports) {
      setIsPrevActive(supports?.pageInfo?.hasPreviousPage)
      setIsNextActive(supports?.pageInfo?.hasNextPage)
    }
  }, [supports])

  if (error) {
    return (
      <Card>
        <Text>Something went wrong</Text>
      </Card>
    )
  }

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={supports?.nodes || []}
          customStyles={customStyles}
          onSort={handleSort}
          defaultSortFieldId={field}
          defaultSortAsc={false}
          progressPending={supports ? false : true}
          persistTableHead
          subHeader
          subHeaderComponent={subHeader}
          progressComponent={<CustomLoader />}
          responsive={true}
        />

        {/* PAGINATION */}
        {supports?.pageInfo && (
          <Pagination
            paginationSizes={paginationSizes}
            pageIndex={pageIndex}
            totalRows={totalRows}
            totalCount={supports?.totalCount}
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
          supports={supports?.nodes || []}
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

export default Support
