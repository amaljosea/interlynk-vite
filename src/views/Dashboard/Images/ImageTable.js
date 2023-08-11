import {
  Table,
  Tbody,
  Thead,
  Tr,
  Td,
  Th,
  Skeleton,
  Flex,
  Button,
  Box
} from '@chakra-ui/react'
import CardBody from 'components/Card/CardBody'
import ImageRow from 'components/Tables/ImageRow'
import { img_captions } from 'utils'

const ImageTable = ({
  imageList,
  refetch,
  isLoading,
  setSelectedImage,
  setActiveScanners,
  onScanOpen,
  onDeleteOpen,
  handlePreviousPage,
  handleNextPage
}) => {
  return (
    <>
      <CardBody mt={4}>
        <Table variant='simple'>
          <Thead>
            <Tr>
              {img_captions.map((item, index) => (
                <Th pl={1} key={index}>
                  <Box>{item}</Box>
                </Th>
              ))}
            </Tr>
          </Thead>

          <Tbody>
            {imageList ? (
              imageList.images.nodes.map((item, index) => (
                <ImageRow
                  key={index}
                  item={item}
                  isLoading={isLoading}
                  setSelectedImage={setSelectedImage}
                  setActiveScanners={setActiveScanners}
                  onScanOpen={onScanOpen}
                  onDeleteOpen={onDeleteOpen}
                />
              ))
            ) : (
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
                <Td fontSize={'sm'} pl={1}>
                  <Skeleton height='20px' />
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </CardBody>
      {imageList && (
        <Flex
          flexDir={'row'}
          gap={4}
          alignItems={'center'}
          mt={6}
          justifyContent={'flex-start'}
        >
          <Button
            colorScheme='blue'
            onClick={handlePreviousPage}
            isDisabled={!imageList.images.pageInfo.hasPreviousPage}
          >
            Previous
          </Button>
          <Button
            colorScheme='blue'
            onClick={handleNextPage}
            isDisabled={!imageList.images.pageInfo.hasNextPage}
          >
            Next
          </Button>
        </Flex>
      )}
    </>
  )
}

export default ImageTable
