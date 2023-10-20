import {
  Button,
  Flex,
  Stack,
  Tag,
  Text,
  Box,
  Select,
  TagLabel
} from '@chakra-ui/react'
import React, { useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useLocation } from 'react-router-dom'
import { getFullDateAndTime } from 'utils'
import LogFilterMenu from 'views/Sbom/components/LogFilterMenu'
import SearchFilter from 'views/Sbom/components/SearchFilter'

const customStyles = {
  headCells: {
    style: {
      fontWeight: 'bold',
      color: '#2D3748',
      fontSize: '12px',
      letterSpacing: '1px'
    }
  },
  subHeader: {
    style: {
      padding: 0,
      margin: 0
    }
  }
}

const setColor = (type) => {
  switch (type) {
    case 'create':
      return 'green'
    case 'created':
      return 'green'
    case 'update':
      return 'blue'
    case 'updated':
      return 'blue'
    case 'modified':
      return 'pink'
    case 'destroyed':
      return 'red'
    case 'rerun':
      return 'purple'
  }
}

const SbomChangelogTable = ({
  data,
  refetch,
  totalRows,
  setTotalRows,
  filterHeads
}) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)

  const productId = queryParams.get('p')
  const sbomId = queryParams.get('sbom')

  const [filterText, setFilterText] = useState('')
  const [pageIndex, setPageIndex] = useState(1)

  // COLUMNS
  const columns = [
    // CHANGE TYPE
    {
      id: 'changeType',
      name: 'CHANGE TYPE',
      selector: (row) => {
        const { action } = row
        return (
          <Tag variant='solid' colorScheme={setColor(action)}>
            {action}
          </Tag>
        )
      },
      width: '150px'
    },
    // CHANGED OBJECT
    {
      id: 'changedObject',
      name: 'CHANGED OBJECT',
      selector: (row) => {
        const { event } = row
        return <Text>{event}</Text>
      },
      width: '200px'
    },
    // PRIOR VALUE
    {
      id: 'priorValue',
      name: 'PRIOR VALUE',
      selector: (row) => {
        const { orig, event } = row
        const license =
          (event === 'licenses' || event === 'cpes') && JSON.parse(orig)

        return (
          <Text>
            {orig === 'f'
              ? 'False'
              : orig === 't'
              ? 'True'
              : license.length > 0
              ? license.map((item, index) => (
                  <Tag
                    size={'sm'}
                    mr={2}
                    key={index}
                    variant='subtle'
                    colorScheme='red'
                    width={'fit-content'}
                    textTransform={'capitalize'}
                  >
                    <TagLabel pt={1}>{item}</TagLabel>
                  </Tag>
                ))
              : license.length === 0
              ? ''
              : orig}
          </Text>
        )
      },
      width: '250px'
    },
    // UPDATED VALUE
    {
      id: 'updatedValue',
      name: 'UPDATED VALUE',
      selector: (row) => {
        const { updated, event } = row
        const updatedValue =
          (event === 'licenses' || event === 'cpes') && JSON.parse(updated)

        return (
          <Text>
            {updated === 'f'
              ? 'False'
              : updated === 't'
              ? 'True'
              : updatedValue.length > 0
              ? updatedValue.map((item, index) => (
                  <Tag
                    size={'sm'}
                    mr={2}
                    key={index}
                    variant='subtle'
                    colorScheme='green'
                    width={'fit-content'}
                    textTransform={'capitalize'}
                  >
                    <TagLabel pt={1}>{item}</TagLabel>
                  </Tag>
                ))
              : updatedValue.length === 0
              ? ''
              : updated}
          </Text>
        )
      }
    },
    // CHANGED BY
    {
      id: 'changedBy',
      name: 'CHANGED BY',
      selector: (row) => row.changedBy,
      width: '200px'
    },
    // CHANGED ON
    {
      id: 'createdAt',
      name: 'CREATED_AT',
      selector: (row) => <Text>{getFullDateAndTime(row.updatedAt)}</Text>,
      sortable: true
    }
  ]

  const onPreviousPage = () => {
    setPageIndex((prev) => pageIndex !== 0 && prev - 1)
    refetch({
      projectId: productId,
      sbomId: sbomId,
      last: totalRows,
      before: data.pageInfo.startCursor,
      first: undefined,
      after: undefined,
      field: 'CREATED_AT',
      direction: 'DESC'
    })
  }

  const onNextPage = () => {
    setPageIndex((prev) => prev < Math.ceil(data.totalCount) && prev + 1)
    refetch({
      projectId: productId,
      sbomId: sbomId,
      first: totalRows,
      after: data.pageInfo.endCursor,
      last: undefined,
      before: undefined,
      field: 'CREATED_AT',
      direction: 'DESC'
    })
  }

  // SEARCH COMPONENT
  // const handleSearch = async (event) => {
  //   if (event.key === 'Enter') {
  //     await refetch({
  //       projectId: productId,
  //       sbomId: sbomId,
  //       search: filterText,
  //       first: totalRows,
  //       last: undefined,
  //       after: undefined,
  //       last: undefined,
  //       field: 'CREATED_AT',
  //       direction: 'DESC'
  //     })
  //     setPageIndex(1)
  //   }
  // }

  // CLEAR SERACH
  const handleClear = async () => {
    await refetch({
      projectId: productId,
      sbomId: sbomId,
      first: totalRows,
      last: undefined,
      after: undefined,
      last: undefined,
      search: undefined,
      field: 'CREATED_AT',
      direction: 'DESC'
    })
    setFilterText('')
    setPageIndex(1)
  }

  // SET ROW LENGTH
  const handleSetRow = async (e) => {
    setTotalRows(Number(e.target.value))
    await refetch({
      projectId: productId,
      sbomId: sbomId,
      first: Number(e.target.value),
      last: undefined,
      after: undefined,
      last: undefined,
      search: undefined,
      field: 'CREATED_AT',
      direction: 'DESC'
    })
    setFilterText('')
    setPageIndex(1)
  }

  const filteredItems =
    data &&
    data.nodes.filter(
      (item) =>
        (item.action &&
          item.action.toLowerCase().includes(filterText.toLowerCase())) ||
        (item.changedBy &&
          item.changedBy.toLowerCase().includes(filterText.toLowerCase())) ||
        (item.event &&
          item.event.toLowerCase().includes(filterText.toLowerCase())) ||
        (item.orig &&
          item.orig.toLowerCase().includes(filterText.toLowerCase())) ||
        (item.updated &&
          item.updated.toLowerCase().includes(filterText.toLowerCase()))
    )

  const subHeaderComponentMemo = useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
        mb={4}
      >
        <Stack
          width={'100%'}
          direction={'row'}
          spacing={4}
          alignItems={'flex-start'}
        >
          {/* <Flex alignItems={'center'} gap={4}>
            <Box position='relative' width={'300px'}>
              <Input
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                onKeyDown={handleSearch}
                placeholder='Search components'
                ref={searchInputRef}
              />
              {filterText !== '' && (
                <CloseIcon
                  w={'18px'}
                  h={'18px'}
                  bg={'blue.500'}
                  color={'white'}
                  p={1}
                  rounded={'full'}
                  position={'absolute'}
                  zIndex={9999}
                  right={3}
                  top={'11px'}
                  onClick={handleClear}
                  cursor={'pointer'}
                />
              )}
            </Box>
          </Flex> */}
          <SearchFilter
            onFilter={(e) => setFilterText(e.target.value)}
            onClear={handleClear}
            filterText={filterText}
          />

          {/* FILTER COMPONENTS BASED ON ECOSYSTEM */}
          {filterHeads && (
            <LogFilterMenu
              refetch={refetch}
              productId={productId}
              sbomId={sbomId}
              changeBys={filterHeads.sbom.filters.logChangeBys}
              changeObjects={filterHeads.sbom.filters.logChangeObjects}
              changeTypes={filterHeads.sbom.filters.logChangeTypes}
              setPageIndex={setPageIndex}
              totalRows={totalRows}
            />
          )}
        </Stack>
      </Flex>
    )
  }, [filterText, filterHeads, handleClear, filteredItems])

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={filteredItems.length > 0 ? filteredItems : data.nodes}
          defaultSortAsc={false}
          defaultSortFieldId={'createdAt'}
          customStyles={customStyles}
          subHeader
          subHeaderComponent={subHeaderComponentMemo}
          responsive={true}
        />
      </Flex>
      
      {/* PAGINATION */}
      <Flex
        width={'100%'}
        flexDir={'row'}
        gap={4}
        alignItems={'center'}
        mt={6}
        justifyContent={'space-between'}
      >
        <Stack alignItems={'center'} direction={'row'} spacing={4}>
          <Button
            colorScheme='blue'
            onClick={onPreviousPage}
            isDisabled={!data.pageInfo.hasPreviousPage}
          >
            Previous
          </Button>
          <Button
            colorScheme='blue'
            onClick={onNextPage}
            isDisabled={!data.pageInfo.hasNextPage}
          >
            Next
          </Button>
          <Box>
            Page {pageIndex} of{' '}
            {data.totalCount === 0 ? 1 : Math.ceil(data.totalCount / totalRows)}
          </Box>
        </Stack>

        <Stack alignItems={'center'} direction={'row'} spacing={4}>
          <Text>Show</Text>
          <Select width={20} value={totalRows} onChange={handleSetRow}>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </Select>
        </Stack>
      </Flex>
    </>
  )
}

export default SbomChangelogTable
