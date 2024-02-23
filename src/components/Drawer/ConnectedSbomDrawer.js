import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tag,
  TagLabel,
  Text
} from '@chakra-ui/react'
import { statusColor } from 'utils'

const ConnectedSbomDrawer = ({ data, isOpen, onClose }) => {
  console.log('data',data);
  return (
    <Drawer size='lg' isOpen={isOpen} placement='right' onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Also Affected</DrawerHeader>
        <DrawerBody>
          <Table variant='simple' m={0} p={0}>
            <Thead>
              <Tr>
                {['PRODUCT', 'VERSION', 'ENVIRONEMENT', 'STATUS'].map(
                  (item, index) => (
                    <Th px={0} fontFamily={'inherit'} key={index} textAlign={item === 'STATUS' ? 'right' : 'left'} >
                      {item}
                    </Th>
                  )
                )}
              </Tr>
            </Thead>
            <Tbody width={'100%'}>
              {data?.connectedSboms?.length > 0 &&
                data?.connectedSboms?.map((item, index) => {
                  const { project, projectVersion } = item
                  return (
                    <Tr key={index}>
                      <Td px={0} fontSize={'sm'} width='250px'>
                        <Text wordBreak={'break-all'}>{project?.projectGroup?.name || ''}</Text>
                      </Td>
                      <Td px={0} fontSize={'sm'} width='150px'>
                        <Text wordBreak={'break-all'}>{projectVersion || ''}</Text>
                      </Td>
                      <Td px={0} fontSize={'sm'} width='150px'>
                        <Text wordBreak={'break-all'}>{project?.name || ''}</Text>
                      </Td>
                      <Td px={0} fontSize={'sm'} width='300px' textAlign={'right'}>
                        <Tag size='md' variant='solid' width={'130px'} colorScheme={statusColor(
                            item?.parentDispositionFrom?.vexStatus?.name || 'Unspecified'
                          )}
                        >
                          <TagLabel style={{ textTransform: 'capitalize' }} mx={'auto'}>
                            {item?.parentDispositionFrom?.vexStatus?.name || 'Unspecified'}
                          </TagLabel>
                        </Tag>
                      </Td>
                    </Tr>
                  )
                })}
            </Tbody>
          </Table>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default ConnectedSbomDrawer
