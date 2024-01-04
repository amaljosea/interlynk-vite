import { CheckCircleIcon } from '@chakra-ui/icons'
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
  Stack,
  Tooltip,
  Text,
  Icon
} from '@chakra-ui/react'
import VulnBadge from 'components/Misc/VulnBadge'
import { timeSince } from 'utils'
import { getFullDateAndTime } from 'utils'

const SbomList = ({ isOpen, onClose, data, sboms }) => {
  console.log('data', data)
  console.log('sboms', sboms)

  const duplicateSboms =
    sboms?.length > 0 &&
    sboms?.filter(
      (item) =>
        item?.primaryComponent?.version === data?.primaryComponent?.version
    )

  console.log('duplicates', duplicateSboms)

  return (
    <Drawer size='2xl' isOpen={isOpen} placement='right' onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>
          {data?.primaryComponent?.version || 'SBOM List'}
        </DrawerHeader>
        <DrawerBody>
          <Table variant='simple' m={0} p={0}>
            <Thead>
              <Tr>
                {[
                  'UPLOADED AT',
                  'COMPONENTS',
                  'LICENSES',
                  'VULNERABILITIES',
                  'STATUS',
                  'UPDATED AT'
                ].map((item, index) => (
                  <Th px={0} fontFamily={'inherit'} key={index}>
                    {item}
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {duplicateSboms?.length > 0 &&
                duplicateSboms
                  .sort((a, b) => {
                    const dateA = new Date(a.updatedAt)
                    const dateB = new Date(b.updatedAt)
                    return dateB - dateA
                  })
                  .map((item, index) => {
                    const { creationAt, stats, lifecycle, updatedAt } = item
                    return (
                      <Tr key={index}>
                        <Td px={0} fontSize={'sm'}>
                          <Stack direction={'column'}>
                            <Text> {getFullDateAndTime(creationAt)}</Text>
                            {index === 0 && (
                              <Tag
                                size='sm'
                                width={'fit-content'}
                                variant='subtle'
                                colorScheme='green'
                              >
                                Active
                              </Tag>
                            )}
                          </Stack>
                        </Td>
                        <Td px={0} fontSize={'sm'}>
                          <Tag
                            size='md'
                            variant='subtle'
                            width={16}
                            colorScheme={'blue'}
                          >
                            <TagLabel mx={'auto'}>
                              {stats?.compLicenseCount}
                            </TagLabel>
                          </Tag>
                        </Td>
                        <Td px={0} fontSize={'sm'}>
                          <Tag
                            size='md'
                            variant='subtle'
                            width={16}
                            colorScheme={'blue'}
                            mx={'auto'}
                          >
                            <TagLabel mx={'auto'}>{stats?.compCount}</TagLabel>
                          </Tag>
                        </Td>
                        <Td px={0} fontSize={'sm'}>
                          <Stack fontWeight={'medium'} direction={'row'}>
                            <VulnBadge color='red' label='Critical'>
                              {stats?.vulnStats?.critical
                                ? stats.vulnStats.critical
                                : 0}
                            </VulnBadge>
                            <VulnBadge color='orange' label='High'>
                              {stats?.vulnStats?.high
                                ? stats.vulnStats.high
                                : 0}
                            </VulnBadge>
                            <VulnBadge color='yellow' label='Medium'>
                              {stats?.vulnStats?.medium
                                ? stats.vulnStats.medium
                                : 0}
                            </VulnBadge>
                            <VulnBadge color='green' label='Low'>
                              {stats?.vulnStats?.low ? stats.vulnStats.low : 0}
                            </VulnBadge>
                          </Stack>
                        </Td>
                        <Td px={0} fontSize={'sm'}>
                          <Tag
                            width={24}
                            colorScheme='cyan'
                            textTransform={'capitalize'}
                          >
                            <TagLabel mx={'auto'}>{lifecycle}</TagLabel>
                          </Tag>
                        </Td>
                        <Td px={0} fontSize={'sm'}>
                          <Tooltip
                            label={getFullDateAndTime(updatedAt)}
                            placement='top'
                          >
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
