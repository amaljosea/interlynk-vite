import React from 'react'

import { Box, Button, Flex, Stack, Text } from '@chakra-ui/react'

import LynkSelect from 'components/LynkSelect'

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
  if (paginationHidden || totalCount < 1) {
    return null
  }

  const noPaginationRequired =
    !hasNextPage && !hasPreviousPage && totalCount < paginationSizes[0]

  const countText =
    totalCount === 1
      ? `Showing all ${totalCount} item`
      : `Showing all ${totalCount} items`

  if (noPaginationRequired) {
    return (
      <Flex
        justifyContent={'end'}
        alignItems={'center'}
        gap={4}
        marginTop={'20px'}
      >
        <Text>{countText}</Text>
      </Flex>
    )
  }

  const totalPages = Math.ceil(totalCount / totalRows) || 1

  const selectStyles = {
    container: (baseStyles) => ({
      ...baseStyles,
      minWidth: '76px'
    })
  }

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
        <LynkSelect
          value={{ label: totalRows, value: totalRows }}
          onChange={(selected) => onSetRow(selected.value)}
          isDisabled={loading}
          id='rowlimit'
          name='rowlimit'
          options={paginationSizes.map((size) => ({
            label: size,
            value: size
          }))}
          styles={selectStyles}
          dropDown
          menuPlacement='top'
        />
      </Stack>
    </Flex>
  )
}

export default Pagination
