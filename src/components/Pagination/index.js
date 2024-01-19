import React from 'react';
import { Flex, Button, Box, Stack, Text, Select } from '@chakra-ui/react';

const Pagination = ({
    paginationSizes = [25, 50, 100],
    pageIndex,
    totalRows,
    totalCount,
    onPreviousPage,
    onNextPage,
    onSetRow
}) => {

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
                <Button colorScheme='blue' onClick={onPreviousPage} isDisabled={pageIndex === 1}>
                    Prev
                </Button>
                <Button colorScheme='blue' onClick={onNextPage} isDisabled={pageIndex === Math.ceil(totalCount / totalRows)}>
                    Next
                </Button>
                <Box>
                    Page {pageIndex} of {Math.ceil(totalCount / totalRows)}
                </Box>
            </Stack>

            <Stack alignItems={'center'} direction={'row'} spacing={4}>
                <Text>Show</Text>
                <Select
                    width='auto'
                    value={totalRows}
                    onChange={onSetRow}
                    id='rowlimit'
                    name='rowlimit'
                >
                    {paginationSizes.map(size => (
                        <option key={size} value={size}>{size}</option>
                    ))}
                </Select>
            </Stack>
        </Flex>
    );
};

export default Pagination;
