import {AddIcon, ExternalLinkIcon, RepeatIcon} from '@chakra-ui/icons'
import {
  Flex,
  Tag,
  Text,
  Stack,
  Link,
  TagLabel,
  Icon,
  Tooltip,
  IconButton,
  useDisclosure,
  Menu,
  MenuButton,
  Portal,
  MenuList,
  MenuItem
} from '@chakra-ui/react'
import CustomLoader from 'components/CustomLoader'
import { useCallback, useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import LicenseDrawer from './LicenseDrawer'
import LicenseFilter from './LicenseFilter'
import SearchFilter from 'views/Sbom/components/SearchFilter'
import { customStyles } from 'utils'
import { FaEllipsisV } from 'react-icons/fa'
import Pagination from '../Pagination'

const SbomLicenseTable = ({ data, refetch }) => {
  const licenses = data?.nodes

  const [direction, setDirection] = useState('DESC')

  // PAGINATION
  const paginationSizes = [25, 50, 100]

  const [currentPage, setCurrentPage] = useState(1)
  const [totalRows, setTotalRows] = useState(paginationSizes[0])
  const [isPrevActive, setIsPrevActive] = useState(false)
  const [isNextActive, setIsNextActive] = useState(false)

  useEffect(() => {
    if (data) {
      setIsPrevActive(data?.pageInfo?.hasPreviousPage)
      setIsNextActive(data?.pageInfo?.hasNextPage)
    }
  }, [data])

  const setPaginationControl = (data) => {
    setIsPrevActive(data.sbom?.componentLicenses?.pageInfo?.hasPreviousPage)
    setIsNextActive(data.sbom?.componentLicenses?.pageInfo?.hasNextPage)
  }

  const disablePaginationControl = () => {
    setIsPrevActive(false)
    setIsNextActive(false)
  }

  const handlePreviousPage = useCallback(async () => {
    disablePaginationControl()
    setCurrentPage(currentPage - 1)

    await refetch({
      first: undefined,
      last: totalRows,
      after: undefined,
      before: data.pageInfo.startCursor,
      direction: direction
    }).then((res) => {
      if (res.data) {
        setPaginationControl(res.data)
      }
    })
  }, [refetch, totalRows, data, currentPage, direction])

  const handleSetRow = useCallback(
    async (e) => {
      const newTotalRows = Number(e.target.value)
      setCurrentPage(1)
      setTotalRows(newTotalRows)
      disablePaginationControl()
      await refetch({
        first: newTotalRows,
        last: undefined,
        after: undefined,
        before: undefined,
        direction: direction
      }).then((res) => {
        if (res.data) {
          setPaginationControl(res.data)
        }
      })
    },
    [refetch, setTotalRows, direction]
  )

  const handleNextPage = useCallback(async () => {
    disablePaginationControl()
    setCurrentPage(currentPage + 1)

    await refetch({
      first: totalRows,
      last: undefined,
      after: data.pageInfo.endCursor,
      before: undefined,
      direction: direction
    }).then((res) => {
      if (res.data) {
        setPaginationControl(res.data)
      }
    })
  }, [refetch, totalRows, data, currentPage, direction])

  // PAGINATION END

  const [searchInput, setSearchInput] = useState('')
  const [activeRow, setActiveRow] = useState(null)


  // SORT

  const handleSort = useCallback(async (column, sortDirection) => {
    disablePaginationControl()

    setCurrentPage(1)

    await refetch({
      direction: sortDirection.toUpperCase(),
      first: totalRows,
      after: undefined,
      before: undefined,
      last: undefined,

    }).then((res) => {
      if (res.data) {
        setDirection(sortDirection.toUpperCase())
        setPaginationControl(res.data)
      }
    })
  },[refetch, totalRows, direction])


  const handleFilter = useCallback(
    async (value) => {
      disablePaginationControl()

      setCurrentPage(1)

      await refetch({
        status: value[0],
        first: totalRows,
        last: undefined,
        after: undefined,
        before: undefined,
      }).then((res) => {
        if (res.data) {
          setPaginationControl(res.data)
        }
      })
    },
    [refetch, totalRows]
  )

  const handleClear = useCallback(async () => {
    setSearchInput('')
    disablePaginationControl()
    await refetch({
      search: undefined,
      first: totalRows,
      last: undefined,
      after: undefined,
      before: undefined,
    }).then((res) => {
      if (res.data) {
        setPaginationControl(res.data)
      }
    })
  }, [refetch, totalRows])

  const onSearchInputChange = useCallback(
    (event) => {
      const { value } = event.target

      if (value === '') {
        handleClear()
      } else {
        setSearchInput(value)
      }
    },
    [handleClear]
  )

  const handleSearch = useCallback(
    (event) => {
      const { key, target: { value } } = event

      if (key === 'Enter' && searchInput) {
        disablePaginationControl()
        refetch({
          search: value,
          first: totalRows,
        }).then((res) => {
          if (res.data) {
            setPaginationControl(res.data)
          }
        })
      }
    },
    [refetch, searchInput, totalRows]
  )

  const handleRefresh = useCallback(async () => {
    disablePaginationControl()
    await refetch({}).then((res) => {
      if (res.data) {
        setPaginationControl(res.data)
      }
    })
  })


  const { isOpen, onOpen, onClose } = useDisclosure()

  const subHeaderComponent = useMemo(() => {
    return (
      <Flex width={'100%'} alignItems={'center'} gap={3}>
        <Stack
          width={'100%'}
          direction={'row'}
          spacing={4}
          alignItems={'center'}
        >
          {/* SEARCH FILTER */}
          <SearchFilter
            id='license'
            filterText={searchInput}
            setFilterText={setSearchInput}
            onFilter={handleSearch}
            onClear={handleClear}
            onChange={onSearchInputChange}
          />
          <LicenseFilter onFilter={handleFilter}/>
        </Stack>

        {/* ADD LICNESE */}
        <Tooltip label='Add License'>
          <IconButton
            onClick={() => {
              setActiveRow(null)
              onOpen()
            }}
            icon={<AddIcon />}
            colorScheme='blue'
            variant='solid'
            fontWeight='normal'
            fontSize={'sm'}
          />
        </Tooltip>
        <Tooltip label='Refresh'>
          <IconButton
            onClick={handleRefresh}
            colorScheme='blue'
            icon={<RepeatIcon />}
          ></IconButton>
        </Tooltip>
      </Flex>
    )
  }, [searchInput, handleClear, handleSearch])

  // COLUMNS
  const columns = [
    // LICENSE EXPRESSION
    {
      id: 'LICENSE_EXPRESSION',
      name: 'LICENSE EXPRESSION',
      wrap: true,
      selector: ({ licenseExpression }) => {
        return (
          <Flex
            direction='row'
            alignItems={'center'}
            gap={2}
          >
            <Text
              color={'blue.500'}
              my={3}
              fontWeight={'medium'}
            >
              {licenseExpression || 'Not Available'}
            </Text>
          </Flex>
        )
      }
    },
    // COMPONENT LIST
    {
      id: 'COMPONENT_LIST',
      name: 'COMPONENT LIST',
      wrap: true,
      selector: ({ components }) => {
        return (
          <Flex direction='row' alignItems={'center'} gap={2}>
            {components?.map(
              (component, index) =>
                <Tag variant='subtle' key={index}>
                  <TagLabel my={1} style={{ whiteSpace: 'normal' }}>
                    {component.name}
                  </TagLabel>
                </Tag>
            )}
          </Flex>
        )
      }
    },
    // STATUS
    {
      id: 'STATUS',
      name: 'STATUS',
      wrap: true,
      sortable: true,
      selector: ({ derivedState }) => {
        derivedState = derivedState?.toLowerCase() || 'Not Available'
        return (
          <Tag
            size='md'
            variant='solid'
            colorScheme={
              derivedState === 'approved'
                ? 'green'
                : derivedState === 'rejected'
                  ? 'red'
                  : derivedState === 'unspecified'
                    ? 'orange'
                    : 'blue'
            }
            width={'110px'}
          >
            <TagLabel mx={'auto'} textTransform={'capitalize'}>
              {derivedState}
            </TagLabel>
          </Tag>
        )
      }
    }
  ]

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={licenses}
          customStyles={customStyles}
          defaultSortAsc={false}
          defaultSortFieldId={'UPDATED_AT'}
          progressPending={data ? false : true}
          progressComponent={<CustomLoader />}
          onSort={handleSort}
          subHeader
          subHeaderComponent={subHeaderComponent}
          responsive
          persistTableHead
        />
      </Flex>

      {/* PAGINATION */}
      {data?.pageInfo && (
        <Pagination
          paginationSizes={paginationSizes}
          pageIndex={currentPage}
          totalRows={totalRows}
          totalCount={data.totalCount}
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
          onSetRow={handleSetRow}
          hasNextPage={isNextActive}
          hasPreviousPage={isPrevActive}
        />
      )}

      {isOpen && (
        <LicenseDrawer
          isOpen={isOpen}
          refetch={refetch}
          onClose={onClose}
          data={activeRow}
        />
      )}
    </>
  )
}

export default SbomLicenseTable
