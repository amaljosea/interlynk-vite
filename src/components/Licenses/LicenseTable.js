import { AddIcon, ExternalLinkIcon } from '@chakra-ui/icons'
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

const LicenseTable = ({ data, refetch }) => {
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

  // PAGINATION END

  const [searchInput, setSearchInput] = useState('')
  const [activeRow, setActiveRow] = useState(null)

  // SEARCH COMPONENT
  const handleSearch = async () => {}

  // CLEAR SERACH
  const handleClear = async () => {
    setSearchInput('')
  }

  // SORT

  const handleSort = useCallback(async (column, sortDirection) => {
    disablePaginationControl()

    setCurrentPage(1)

    await refetch({
      direction: sortDirection.toUpperCase(),
      first: totalRows,
      field: column.id,
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
          />
          <LicenseFilter />
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
      </Flex>
    )
  }, [searchInput, handleClear, handleSearch])

  // COLUMNS
  const columns = [
    // NAME
    {
      id: 'NAME',
      name: 'NAME',
      width: '250px',
      wrap: true,
      selector: ({ content: { name } }) => {
        const handleClick = () => {
          console.log('clicked')
        }
        return (
          <Flex
            direction='row'
            alignItems={'center'}
            gap={2}
            cursor={'pointer'}
          >
            <Link to={`/vendor/licenses/bal`} onClick={handleClick}>
              <Text
                color={'blue.500'}
                my={3}
                fontWeight={'medium'}
                _hover={{ textDecoration: 'underline' }}
              >
                {name}
              </Text>
            </Link>
          </Flex>
        )
      }
    },
    // SPDX ID
    {
      id: 'SPDX_ID',
      name: 'SPDX ID',
      width: '250px',
      wrap: true,
      selector: ({ content: { shortId, url } }) => {
        if (!url && shortId) {
          url = `https://spdx.org/licenses/${shortId}.html`
        }
        return (
          <Flex direction='row' alignItems={'center'} gap={2}>
            <Tag variant='subtle'>
              <TagLabel my={1} style={{ whiteSpace: 'normal' }}>
                {shortId || 'Not Available'}
              </TagLabel>
            </Tag>
            <Link href={url?.replace('.json', '.html')} isExternal>
              {url && (
                <Icon
                  as={ExternalLinkIcon}
                  h={'16px'}
                  w={'16px'}
                  color={'blue.500'}
                />
              )}
            </Link>
          </Flex>
        )
      }
    },
    // ATTRIBUTION
    {
      id: 'ATTRIBUTION',
      name: 'ATTRIBUTION',
      width: '180px',
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
      width: '180px',
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
      width: '250px',
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
      width: '250px',
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
      width: '150px',
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
                {/* EDIT PRODUCT */}
                <MenuItem
                  onClick={() => {
                    setActiveRow(row)
                    onOpen()
                  }}
                  isDisabled={false}
                >
                  Edit Product
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
