// Chakra imports
import {
  Box,
  Flex,
  Skeleton,
  Table,
  Tbody,
  Button,
  Th,
  Thead,
  Tr,
  Td,
  useColorModeValue
} from '@chakra-ui/react'
// Custom components
import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import AdvisoryLogRow from 'components/Tables/AdvisoryLogRow.js'

const AdvisoryLog = ({
  captions,
  data,
  loading,
  onPreviousPage,
  onNextPage
}) => {
  const textColor = useColorModeValue('gray.700', 'white')

  return (
    <Card my='22px' overflowX={{ sm: 'scroll', xl: 'hidden' }}>
      <CardBody>
        <Table
          __css={{ 'tableLayout': 'fixed', width: 'full' }}
          variant='simple'
          color={textColor}
          size='sm'
        >
          <Thead>
            <Tr my='.8rem' pl='0px'>
              {captions.map((caption, idx) => {
                return (
                  <Th key={idx} ps={idx === 0 ? '0px' : null}>
                    <Box>{caption}</Box>
                  </Th>
                )
              })}
            </Tr>
          </Thead>
          <Tbody>
            {data.nodes.length > 0 &&
              data.nodes.map((row) => {
                return (
                  <AdvisoryLogRow
                    key={row.id}
                    id={row.id}
                    refId={row.refId}
                    desc={row.description}
                    source={row.source}
                    updatedAt={row.editedAt}
                    publishedAt={row.publishedAt}
                    editedAt={row.editedAt}
                    severity={row.severity}
                    affected={row.affected}
                    aliasId={row.aliasId}
                  />
                )
              })}

            {loading && (
              <Tr>
                <Td fontSize={'sm'} pl={1}>
                  <Skeleton height='20px' />
                </Td>
                <Td fontSize={'sm'} pl={1}>
                  <Skeleton height='20px' />
                </Td>
                <Td fontSize={'sm'} pl={1}>
                  <Skeleton height='20px' />
                </Td>
                <Td fontSize={'sm'} pl={1}>
                  <Skeleton height='20px' />
                </Td>
                <Td fontSize={'sm'} pl={1}>
                  <Skeleton height='20px' />
                </Td>
                <Td fontSize={'sm'} pl={1}>
                  <Skeleton height='20px' />
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </CardBody>

      {data && (
        <Flex
          flexDir={'row'}
          gap={4}
          alignItems={'center'}
          mt={6}
          justifyContent={'flex-start'}
        >
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
        </Flex>
      )}
    </Card>
  )
}

export default AdvisoryLog
