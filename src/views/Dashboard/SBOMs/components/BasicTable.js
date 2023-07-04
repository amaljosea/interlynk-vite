import React, { useMemo, useEffect } from 'react'
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  Button,
  chakra,
  Select,
  Tooltip,
  Box,
  Menu,
  MenuButton,
  MenuList,
  MenuOptionGroup,
  MenuItemOption
} from '@chakra-ui/react'
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  useFilters,
  usePagination,
  useRowSelect
} from 'react-table'
import GlobalFilter from './GlobalFilter'
import { IndeterminateCheckbox } from './IndeterminateCheckbox'
import {
  ArrowBackIcon,
  ArrowForwardIcon,
  TriangleDownIcon,
  TriangleUpIcon
} from '@chakra-ui/icons'
import { BiExport, BiImport } from 'react-icons/bi'
import { BsFilterRight } from 'react-icons/bs'

const BasicTable = ({ columns, data }) => {
  const COLUMNS = useMemo(() => columns, [columns])
  const DATA = useMemo(() => data, [data])

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    state,
    gotoPage,
    rows,
    pageCount,
    setPageSize,
    setGlobalFilter,
    selectedFlatRows
  } = useTable(
    {
      columns: COLUMNS,
      data: DATA,
      initialState: {
        pageSize: 10
        // sortBy: [
        //   {
        //     id: 'compName',
        //     desc: false,
        //   }
        // ]
      }
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        {
          id: 'selection',
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <chakra.span>
              <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
            </chakra.span>
          ),
          Cell: ({ row }) => (
            <chakra.span pos={'relative'} bottom={2.5}>
              <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
            </chakra.span>
          )
        },
        ...columns
      ])
    }
  )

  // useEffect(() => {
  //   console.log('Rows', rows)
  // }, [rows])

  const { globalFilter, pageIndex, pageSize } = state

  return (
    <>
      <Flex flexDir={'column'} gap={4} width={'100%'}>
        <Flex
          width={'100%'}
          gap={2}
          direction={'row'}
          alignItems={'center'}
          justifyContent={'space-between'}
        >
          <Flex gap={2} direction={'row'}>
            <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
            <Menu closeOnSelect={true}>
              <MenuButton
                as={Button}
                colorScheme='blue'
                leftIcon={<BsFilterRight size={24} />}
              >
                Filter
              </MenuButton>
              <MenuList minWidth='240px'>
                <MenuOptionGroup
                  title='Vulnerability Resolution'
                  type='checkbox'
                >
                  {['Unesolved', 'Total'].map((p, index) => (
                    <MenuItemOption
                      value={p}
                      key={index}
                      // onClick={() => handleStatusSelect(p)}
                    >
                      {p}
                    </MenuItemOption>
                  ))}
                </MenuOptionGroup>
              </MenuList>
            </Menu>
          </Flex>
          <Flex gap={2} direction={'row'}>
            <Box as={Flex} direction={'row'} gap={2}>
              <Tooltip label='Import'>
                <Button colorScheme='blue' size='md'>
                  <BiImport />
                </Button>
              </Tooltip>
              <Tooltip label='Export'>
                <Button colorScheme='blue' size='md'>
                  <BiExport />
                </Button>
              </Tooltip>
            </Box>
          </Flex>
        </Flex>
        <Table {...getTableProps()}>
          <Thead>
            {headerGroups.map((headerGroup) => (
              <Tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <Th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    fontSize={'md'}
                    alignItems={'center'}
                  >
                    {column.render('Header')}
                    <chakra.span ml={2}>
                      {column.isSorted ? (
                        column.isSortedDesc ? (
                          <TriangleDownIcon width={3} />
                        ) : (
                          <TriangleUpIcon width={3} />
                        )
                      ) : (
                        ''
                      )}
                    </chakra.span>
                  </Th>
                ))}
              </Tr>
            ))}
          </Thead>
          <Tbody {...getTableBodyProps()}>
            {page.map((row) => {
              prepareRow(row)
              return (
                <Tr {...row.getRowProps()}>
                  {row.cells.map((cell) => (
                    <Td {...cell.getCellProps()} py={1}>
                      {cell.render('Cell')}
                    </Td>
                  ))}
                </Tr>
              )
            })}
          </Tbody>
          {/* <Tfoot>
          {footerGroups.map((footerGroup) => (
            <Tr {...footerGroup.getFooterGroupProps()}>
              {footerGroup.headers.map((column) => (
                <Th {...column.getFooterProps()} fontSize={'md'}>
                  {column.render('Footer')}
                </Th>
              ))}
            </Tr>
          ))}
        </Tfoot> */}
        </Table>
        <Flex flexDirection={'row'} gap={2} alignItems={'center'}>
          <Select
            width={'fit-content'}
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            {[5, 8, 10, 12].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </Select>
          <Button
            colorScheme='blue'
            onClick={() => previousPage()}
            isDisabled={!canPreviousPage}
          >
            <ArrowBackIcon />
          </Button>
          <Button
            colorScheme='blue'
            onClick={() => nextPage()}
            isDisabled={!canNextPage}
          >
            <ArrowForwardIcon />
          </Button>
          <Flex gap={2} flexDir={'row'} alignItems={'center'}>
            <chakra.span>Page</chakra.span>
            <chakra.span fontWeight={'medium'}>
              {pageIndex + 1} of {pageOptions.length}
            </chakra.span>
          </Flex>
        </Flex>
        {/* <pre>
          <code>
            {JSON.stringify(
              {
                selectedRows: selectedFlatRows.map((row) => row.original)
              },
              null,
              2
            )}
          </code>
        </pre> */}
      </Flex>
    </>
  )
}

export default BasicTable
