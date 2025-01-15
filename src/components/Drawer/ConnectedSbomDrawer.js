import { statusColor } from 'utils/styleUtils'

import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Table,
  Tag,
  TagLabel,
  Tbody,
  Td,
  Th,
  Thead,
  Tr
} from '@chakra-ui/react'

const ConnectedSbomDrawer = ({ data, isOpen, onClose }) => {
  return (
    <Drawer size='xl' isOpen={isOpen} placement='right' onClose={onClose}>
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
                    <Th
                      px={0}
                      key={index}
                      fontFamily={'inherit'}
                      textAlign={item === 'STATUS' ? 'right' : 'left'}
                    >
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
                      <Td pl={0} fontSize={'sm'} wordBreak={'break-all'}>
                        {project?.projectGroup?.name || ''}
                      </Td>
                      <Td pl={0} fontSize={'sm'} wordBreak={'break-all'}>
                        {projectVersion || ''}
                      </Td>
                      <Td pl={0} fontSize={'sm'} wordBreak={'break-all'}>
                        {project?.name || ''}
                      </Td>
                      <Td pr={0} fontSize={'sm'} textAlign={'right'}>
                        <Tag
                          size='md'
                          variant='solid'
                          width={'130px'}
                          colorScheme={statusColor(
                            item?.parentDispositionFrom?.vexStatus?.name ||
                              'Unspecified'
                          )}
                        >
                          <TagLabel
                            style={{ textTransform: 'capitalize' }}
                            mx={'auto'}
                          >
                            {item?.parentDispositionFrom?.vexStatus?.name ||
                              'Unspecified'}
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
