// Chakra imports
import {
  Box,
  Button,
  Flex,
  Select,
  Stack,
  Table,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue
} from '@chakra-ui/react'
// Custom components
import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import ProductVersionsRow from 'components/Tables/ProductVersionsRow.js'
import React from 'react'

const ProductVersions = ({
  captions,
  allProjects,
  handlePreviousPage,
  handleNextPage,
  isLoading,
  refetch,
  totalRows,
  setTotalRows,
  pageIndex,
  setPageIndex
}) => {
  const textColor = useColorModeValue('gray.700', 'white')

  // SET ROW LENGTH
  const handleSetRow = async (e) => {
    setTotalRows(Number(e.target.value))
    await refetch({
      first: Number(e.target.value),
      last: undefined,
      after: undefined,
      last: undefined
    })
    setPageIndex(1)
  }

  return (
    <Card my='22px' overflowX={{ sm: 'scroll', xl: 'hidden' }}>
      <CardBody>
        <Table variant='simple' color={textColor} size='sm'>
          <Thead>
            <Tr my='.8rem'>
              {captions.map((caption, idx) => {
                return (
                  <Th color='gray.800' key={idx} pl={0}>
                    <Box>{caption}</Box>
                  </Th>
                )
              })}
            </Tr>
          </Thead>
          <Tbody>
            {allProjects.projects.nodes.length > 0 &&
              allProjects.projects.nodes
              .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) // Sort by updatedAt in descending order
              .map((pv, index) => {
                return (
                  <ProductVersionsRow
                    key={index}
                    id={pv.id}
                    sbomId={pv.sboms}
                    name={pv.name}
                    enabled={pv.enabled}
                    description={pv.description}
                    updatedAt={pv.updatedAt}
                    allProjects={allProjects}
                    isLoading={isLoading}
                    refetch={refetch}
                    totalRows={totalRows}
                  />
                )
              })}
          </Tbody>
        </Table>
      </CardBody>

      {allProjects && (
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
              onClick={handlePreviousPage}
              isDisabled={!allProjects.projects.pageInfo.hasPreviousPage}
            >
              Previous
            </Button>
            <Button
              colorScheme='blue'
              onClick={handleNextPage}
              isDisabled={!allProjects.projects.pageInfo.hasNextPage}
            >
              Next
            </Button>
            <Box>
              Page {pageIndex} of{' '}
              {allProjects.projects.totalCount === 0
                ? 1
                : Math.ceil(allProjects.projects.totalCount / totalRows)}
            </Box>
          </Stack>

          <Stack alignItems={'center'} direction={'row'} spacing={4}>
            <Text>Show</Text>
            <Select
              width={20}
              value={totalRows}
              onChange={handleSetRow}
              id='rowlimit'
              name='rowlimit'
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </Select>
          </Stack>
        </Flex>
      )}
    </Card>
  )
}

export default ProductVersions

// filterData.length !== 0 &&
