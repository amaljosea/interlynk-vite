import {AddIcon, ExternalLinkIcon, RepeatIcon} from '@chakra-ui/icons'
import {
  Flex,
  Tag,
  Text,
  Stack,
  Link,
  TagLabel,
  Tooltip,
  IconButton,
  useDisclosure,
  Menu,
  MenuButton,
  Portal,
  MenuList,
  MenuItem, Grid, GridItem
} from '@chakra-ui/react'
import CustomLoader from 'components/CustomLoader'
import { useCallback, useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import LicenseDrawer from './LicenseDrawer'
import LicenseFilter from './LicenseFilter'
import SearchFilter from 'views/Sbom/components/SearchFilter'
import {customStyles} from 'utils'
import {FaEllipsisV} from 'react-icons/fa'
import Pagination from '../Pagination'
import {FaScaleBalanced} from "react-icons/fa6";

const LicenseTable = ({ data, refetch }) => {

  const licenses = data?.nodes

  const [direction, setDirection] = useState('ASC')

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
    setIsPrevActive(data.organization?.licenses?.pageInfo?.hasPreviousPage)
    setIsNextActive(data.organization?.licenses?.pageInfo?.hasNextPage)
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
    async (filterName, value) => {
      disablePaginationControl()
      setCurrentPage(1)

      switch (filterName) {
        case 'status':
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
          break
        case 'spdx':
          await refetch({
            licenseType: value[0],
            first: totalRows,
            last: undefined,
            after: undefined,
            before: undefined,
          }).then((res) => {
            if (res.data) {
              setPaginationControl(res.data)
            }
          })
          break
        default:
          break
      }
    },
    [refetch, totalRows]
  )

  const handleClear = useCallback(async () => {
    setSearchInput('')
    disablePaginationControl()
    setCurrentPage(1)
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
        setCurrentPage(1)
        refetch({
          search: value,
          first: totalRows,
          last: undefined,
          after: undefined,
          before: undefined,
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
    // NAME
    {
      id: 'NAME',
      name: 'NAME',
      width: '24%',
      wrap: true,
      selector: ({ content: { name, shortId, url } }) => {
        return (
          <Grid templateColumns='repeat(7, 1fr)' gap={2} my={3}>
            <GridItem colSpan={1} width={'50px'}>
              { (
                <IconButton
                  isRound={true}
                  variant='solid'
                  colorScheme='gray'
                  icon={<FaScaleBalanced fontSize={16} />}
                />
              )}
            </GridItem>
            <GridItem
              colSpan={6}
              display={'flex'}
              flexWrap={'wrap'}
              flexDirection={'column'}
              gap={2}
            >
              <Text data-tag='allowRowEvents'>{name}</Text>
              <Flex flexWrap={'wrap'} gap={2} alignItems={'center'}>
                {shortId && (
                  <Tag
                    width={'fit-content'}
                    size={'sm'}
                    variant='subtle'
                    colorScheme='blue'
                  >
                    <TagLabel>{shortId}</TagLabel>
                  </Tag>
                )}
                {url && (
                  <Link
                    href={shortId? url.replace('.json', '.html') : url}
                    isExternal
                    color={'blue.500'}
                    fontSize={'sm'}
                    fontWeight={'normal'}
                    display={'flex'}
                    alignItems={'center'}
                    gap={1}
                  >
                    <ExternalLinkIcon />
                  </Link>
                )}
              </Flex>
            </GridItem>
          </Grid>
        )
      }
    },
    // ATTRIBUTION
    {
      id: 'ATTRIBUTION',
      name: 'ATTRIBUTION',
      width: '14%',
      wrap: true,
      selector: ({ attribution }) => {
        if (!attribution || attribution === 'UNKNOWN') {
          attribution = 'Not Available'
        }
        return (
          <Text textTransform='capitalize'>{attribution.toLowerCase()}</Text>
        )
      }
    },
    // COPYLEFT
    {
      id: 'COPYLEFT',
      name: 'COPYLEFT',
      width: '14%',
      wrap: true,
      selector: ({ copyLeft }) => {
        if (!copyLeft || copyLeft === 'UNKNOWN') {
          copyLeft = 'Not Available'
        }
        return <Text textTransform='capitalize'>{copyLeft.toLowerCase()}</Text>
      }
    },
    // REQUIRES SOURCE CODE
    {
      id: 'REQUIRES SOURCE CODE',
      name: 'REQUIRES SOURCE CODE',
      width: '14%',
      wrap: true,
      selector: ({ sourceDistribution }) => {
        if (!sourceDistribution || sourceDistribution === 'UNKNOWN') {
          sourceDistribution = 'Not Available'
        }
        return (
          <Text textTransform='capitalize'>
            {sourceDistribution.toLowerCase()}
          </Text>
        )
      }
    },
    {
      id: 'PERMITS MODIFICATIONS',
      name: 'PERMITS MODIFICATIONS',
      width: '14%',
      wrap: true,
      selector: ({ modifications }) => {
        if (!modifications || modifications === 'UNKNOWN') {
          modifications = 'Not Available'
        }
        return (
          <Text textTransform='capitalize'>{modifications.toLowerCase()}</Text>
        )
      }
    },
    // STATUS
    {
      id: 'STATUS',
      name: 'STATUS',
      width: '12%',
      wrap: true,
      sortable: true,
      selector: ({ state }) => {
        state = state?.toLowerCase() || 'Not Available'
        return (
          <Tag
            size='md'
            variant='solid'
            colorScheme={
              state === 'approved'
                ? 'green'
                : state === 'rejected'
                  ? 'red'
                  : state === 'unspecified'
                    ? 'orange'
                    : 'blue'
            }
            width={'110px'}
          >
            <TagLabel mx={'auto'} textTransform={'capitalize'}>
              {state}
            </TagLabel>
          </Tag>
        )
      }
    },
    // ACTIONS
    {
      id: 'actions',
      name: 'ACTIONS',
      width: '8%',
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
                {/* Edit License */}
                <MenuItem
                  onClick={() => {
                    setActiveRow(row)
                    onOpen()
                  }}
                  isDisabled={false}
                >
                  Edit License
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        )
      },
      right: 'true'
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

export default LicenseTable
