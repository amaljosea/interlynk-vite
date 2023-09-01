import {
  Table,
  Tbody,
  Thead,
  Tr,
  Td,
  Th,
  Skeleton,
  Box
} from '@chakra-ui/react'
import CardBody from 'components/Card/CardBody'
import ImageRow from 'components/Tables/ImageRow'
import { img_captions } from 'utils'

const ImageTable = ({
  imageList,
  isLoading,
  setSelectedImage,
  setActiveScanners,
  onScanOpen,
  onDeleteOpen
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
    </>
  )
}

export default ImageTable
