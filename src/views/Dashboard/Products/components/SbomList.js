import { useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import { getFullDateAndTime, isCustomerView, timeSince } from 'utils'

import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay
} from '@chakra-ui/react'
import { Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react'
import { Stack, Tag, TagLabel, Text, Tooltip } from '@chakra-ui/react'

import { GetShareSbomAlternatives } from 'graphQL/Queries'
import { GetSbomAlternatives } from 'graphQL/Queries'

const SbomList = ({ sbomId, isOpen, onClose }) => {
  const params = useParams()
  const customerView = isCustomerView()
  const columns = ['UPLOADED', 'COMPONENTS', 'LICENSES', 'STATUS', 'UPDATED AT']

  const { data: sbomAlts, loading } = useQuery(
    customerView ? GetShareSbomAlternatives : GetSbomAlternatives,
    {
      skip: isOpen ? false : true,
      variables: {
        projectId: customerView ? undefined : params?.productid,
        sbomId: sbomId
      }
    }
  )

  const data = customerView ? sbomAlts?.shareLynkQuery?.sbom : sbomAlts?.sbom

  if (loading) return null

  return (
    <Drawer size='xl' isOpen={isOpen} placement='right' onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton mt={1} />
        <DrawerHeader borderBottomWidth='1px'>
          {data?.projectVersion?.length > 40
            ? `${data?.projectVersion?.substring(0, 40)}...`
            : data?.projectVersion + ' SBOM List'}
        </DrawerHeader>
        <DrawerBody>
          <Table variant='simple' m={0} p={0}>
            <Thead>
              <Tr>
                {columns.map((item, index) => (
                  <Th px={0} fontFamily={'inherit'} key={index}>
                    {item}
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {data?.alternatives?.length > 0 &&
                [...data.alternatives]
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
                          <Stack direction={'row'}>
                            <Text>{getFullDateAndTime(creationAt)}</Text>
                          </Stack>
                        </Td>
                        <Td px={0} fontSize={'sm'} width='130px'>
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
                        <Td px={0} fontSize={'sm'} width='130px'>
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
                        <Td px={0} fontSize={'sm'} width='150px'>
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
