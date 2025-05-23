import { statusColor } from 'utils/styleUtils'

import {
  Table,
  Tag,
  TagLabel,
  Tbody,
  Td,
  Th,
  Thead,
  Tr
} from '@chakra-ui/react'

import LynkDrawer from 'components/LynkDrawer'

const TABLE_HEADERS = ['PRODUCT', 'VERSION', 'ENVIRONMENT', 'STATUS']

const ConnectedSbomDrawer = ({ data, isOpen, onClose }) => {
  const connectedSboms = data?.connectedSboms || []

  return (
    <LynkDrawer
      title={'Also Affected'}
      size='xl'
      isOpen={isOpen}
      onClose={onClose}
      noFooter
    >
      <Table variant='simple' m={0} p={0}>
        <Thead>
          <Tr>
            {TABLE_HEADERS.map((item, index) => (
              <Th
                px={0}
                key={index}
                textAlign={item === 'STATUS' ? 'right' : 'left'}
              >
                {item}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody width={'100%'}>
          {connectedSboms.length > 0 &&
            connectedSboms.map((item, index) => {
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
    </LynkDrawer>
  )
}

export default ConnectedSbomDrawer
