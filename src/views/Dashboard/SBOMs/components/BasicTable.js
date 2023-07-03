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
  Select
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
        <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
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
      </Flex>
    </>
  )
}

export default BasicTable
