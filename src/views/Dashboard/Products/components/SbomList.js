import { useMutation, useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import { getFullDateAndTime, timeSince, truncatedValue } from 'utils'

import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  IconButton
} from '@chakra-ui/react'
import { Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react'
import { Stack, Tag, TagLabel, Text, Tooltip } from '@chakra-ui/react'

import useCustomToast from 'hooks/useCustomToast'

import { sbomUpdate } from 'graphQL/Mutation'
import { GetSbomAlternatives } from 'graphQL/Queries'

import { FaArrowUp } from 'react-icons/fa6'

const SbomList = ({ sbomId, isOpen, onClose }) => {
  const params = useParams()
  const { showToast } = useCustomToast()

  const columns = [
    'UPLOADED',
    'COMPONENTS',
    'LICENSES',
    'STATUS',
    'UPDATED AT',
    ''
  ]

  const [updateSbom] = useMutation(sbomUpdate)

  const { data: sbomAlts, loading } = useQuery(GetSbomAlternatives, {
    skip: isOpen ? false : true,
    variables: {
      projectId: params?.productid,
      sbomId: sbomId
    }
  })

  const handlePromote = async (item) => {
    await updateSbom({
      variables: { id: item?.id, spec: item?.spec, promoteToDirect: true }
    })
      .then((res) => {
        if (res?.sbomUpdate?.errors?.length > 0) {
          showToast({
            description: res?.sbomUpdate?.errors[0],
            status: 'error'
          })
        } else {
          showToast({
            description: `Sbom updated successfully`,
            status: 'success'
          })
        }
      })
      .finally(() => onClose())
  }

  if (loading) return null

  return (
    <Drawer size='xl' isOpen={isOpen} placement='right' onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton mt={1} />
        <DrawerHeader borderBottomWidth='1px'>
          {truncatedValue(sbomAlts?.sbom?.projectVersion, 40) + ' SBOM List'}
        </DrawerHeader>
        <DrawerBody>
          <Table variant='simple' m={0} p={0}>
            <Thead>
              <Tr>
                {columns.map((item, index) => (
                  <Th px={0} key={index} fontFamily={'inherit'}>
                    {item}
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {sbomAlts?.sbom?.alternatives?.length > 0 &&
                [...sbomAlts.sbom.alternatives]
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
                            <TagLabel mx={'auto'}>{stats?.compCount}</TagLabel>
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
                            <TagLabel mx={'auto'}>
                              {stats?.compLicenseCount}
                            </TagLabel>
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
                        <Td px={0} fontSize={'sm'}>
                          <Tooltip
                            placement='left'
                            label={'Promote to version'}
                          >
                            <IconButton
                              size='sm'
                              icon={<FaArrowUp />}
                              onClick={() => handlePromote(item)}
                            />
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
