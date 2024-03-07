import { Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, Table, Thead, Tbody, Tr, Th, Td, Tag, TagLabel, Stack, Tooltip, Text } from '@chakra-ui/react'
import { timeSince, getFullDateAndTime } from 'utils'

const SbomList = ({ isOpen, onClose, data }) => {
  return (
    <Drawer size='xl' isOpen={isOpen} placement='right' onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>{data?.projectVersion + ' SBOM List'}</DrawerHeader>
        <DrawerBody>
          <Table variant='simple' m={0} p={0}>
            <Thead>
              <Tr>
                {['UPLOADED','COMPONENTS','LICENSES','STATUS','UPDATED AT'].map((item, index) => (
                  <Th px={0} fontFamily={'inherit'} key={index}>{item}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {data?.alternatives?.length > 0 &&
                [...data?.alternatives]
                  .sort((a, b) => {
                    const dateA = new Date(a.updatedAt)
                    const dateB = new Date(b.updatedAt)
                    return dateB - dateA
                  })
                  .map((item, index) => {
                    const { creationAt, stats, lifecycle, updatedAt } = item
                    return (
                      <Tr key={index}>
                        <Td px={0} fontSize={'sm'} width='240px'>
                          <Stack direction={'row'}><Text>{getFullDateAndTime(creationAt)}</Text></Stack>
                        </Td>
                        <Td px={0} fontSize={'sm'} width='130px'>
                          <Tag size='md' variant='subtle' width={16} colorScheme={'blue'}>
                            <TagLabel mx={'auto'}>{stats?.compLicenseCount}</TagLabel>
                          </Tag>
                        </Td>
                        <Td px={0} fontSize={'sm'} width='130px'>
                          <Tag size='md' variant='subtle' width={16} colorScheme={'blue'} mx={'auto'}>
                            <TagLabel mx={'auto'}>{stats?.compCount}</TagLabel>
                          </Tag>
                        </Td>
                        <Td px={0} fontSize={'sm'} width='150px'>
                          <Tag width={24} colorScheme='cyan' textTransform={'capitalize'}>
                            <TagLabel mx={'auto'}>{lifecycle}</TagLabel>
                          </Tag>
                        </Td>
                        <Td px={0} fontSize={'sm'}>
                          <Tooltip label={getFullDateAndTime(updatedAt)} placement='top'>
                            <Text>{timeSince(updatedAt)}</Text>
                          </Tooltip>
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

export default SbomList
