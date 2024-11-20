import React from 'react'

import { Box, Button, Flex, Select, Stack, Text } from '@chakra-ui/react'

const Pagination = ({
  paginationSizes = [25, 50, 100],
  pageIndex,
  totalRows,
  totalCount,
  onPreviousPage,
  onNextPage,
  onSetRow,
  hasPreviousPage,
  hasNextPage,
  paginationHidden = false,
  loading
}) => {
  if (paginationHidden) {
    return null
  }
  const totalPages = Math.ceil(totalCount / totalRows) || 1

  return (
    <Flex
      width={'100%'}
      flexDir={'row'}
      gap={4}
      alignItems={'center'}
      mt={6}
      justifyContent={'space-between'}
      flexWrap={'wrap'}
    >
      <Stack alignItems={'center'} direction={'row'} spacing={4}>
        <Button
          fontSize={'sm'}
          colorScheme='blue'
          title='Previous page'
          onClick={onPreviousPage}
          isDisabled={!hasPreviousPage || loading}
        >
          Prev
        </Button>
        <Button
          fontSize={'sm'}
          title='Next page'
          colorScheme='blue'
          onClick={onNextPage}
          isDisabled={!hasNextPage || loading}
        >
          Next
        </Button>
        <Box>
          Page {pageIndex} of {totalPages}
        </Box>
      </Stack>

      <Stack alignItems={'center'} direction={'row'} spacing={4}>
        <Text>Show</Text>
        <Select
          width='auto'
          value={totalRows}
          onChange={onSetRow}
          disabled={loading}
          id='rowlimit'
          name='rowlimit'
        >
          {paginationSizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </Select>
      </Stack>
    </Flex>
  )
}

export default Pagination
