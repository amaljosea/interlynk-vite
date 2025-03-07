import { useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { getFullDate, timeSince, truncatedValue } from 'utils'

import { IconButton, Stack, useDisclosure } from '@chakra-ui/react'
import { Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react'
import { Tag, TagLabel, Text, Tooltip } from '@chakra-ui/react'

import LynkDrawer from 'components/LynkDrawer'

import useCustomToast from 'hooks/useCustomToast'

import { sbomUpdate } from 'graphQL/Mutation'
import { GetSbomAlternatives } from 'graphQL/Queries'

import { FaArrowUp } from 'react-icons/fa6'

import ConfirmationModal from './ConfirmationModal'

const SbomList = ({ sbomId, projectGroup, isOpen, onClose }) => {
  const params = useParams()
  const { showToast } = useCustomToast()

  const PROMOTE_WARNING = useDisclosure()
  const [activeSbom, setActiveSbom] = useState(null)

  const columns = [
    'COMPONENTS',
    'LICENSES',
    'STATUS',
    'IMPORTED',
    'UPDATED',
    ''
  ]

  const [updateSbom, { loading: updateLoading }] = useMutation(sbomUpdate)

  const { data: sbomAlts, loading } = useQuery(GetSbomAlternatives, {
    skip: isOpen ? false : true,
    variables: {
      projectId: params?.productid,
      sbomId: sbomId
    }
  })

  const handleWarning = (item) => {
    setActiveSbom(item)
    PROMOTE_WARNING.onOpen()
  }

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

  const subtitle = (
    <Stack spacing={1}>
      <Tag w={'fit-content'} colorScheme='blue' py={1.5}>
        <Text fontWeight={400} wordBreak={'break-all'}>
          {truncatedValue(projectGroup?.name, 40)} -{' '}
          {truncatedValue(sbomAlts?.sbom?.projectVersion, 40)}
        </Text>
      </Tag>
    </Stack>
  )

  return (
    <>
      <LynkDrawer
        size='xl'
        isOpen={isOpen}
        onClose={onClose}
        title={'Alternative SBOMs'}
        subtitle={subtitle}
        noFooter
      >
        <Table variant='simple' m={0} p={0}>
          <Thead>
            <Tr>
              {columns.map((item, index) => (
                <Th px={0} key={index}>
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
                  const { createdAt, stats, lifecycle, updatedAt } = item
                  return (
                    <Tr key={index}>
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
                        <Tooltip label={getFullDate(createdAt)} placement='top'>
                          <Text>{timeSince(createdAt)}</Text>
                        </Tooltip>
                      </Td>
                      <Td px={0} fontSize={'sm'}>
                        <Tooltip label={getFullDate(updatedAt)} placement='top'>
                          <Text>{timeSince(updatedAt)}</Text>
                        </Tooltip>
                      </Td>
                      <Td px={0} fontSize={'sm'}>
                        <Tooltip label={'Promote to version'} placement='top'>
                          <IconButton
                            size='sm'
                            colorScheme='blue'
                            icon={<FaArrowUp />}
                            onClick={() => handleWarning(item)}
                          />
                        </Tooltip>
                      </Td>
                    </Tr>
                  )
                })}
          </Tbody>
        </Table>
      </LynkDrawer>

      {PROMOTE_WARNING?.isOpen && (
        <ConfirmationModal
          isLoading={updateLoading}
          title={'Promote to version'}
          isOpen={PROMOTE_WARNING?.isOpen}
          onClose={PROMOTE_WARNING?.onClose}
          onConfirm={() => handlePromote(activeSbom)}
          name={getFullDate(activeSbom?.createdAt)}
          description={`This will promote the existing one with the new one`}
        />
      )}
    </>
  )
}

export default SbomList
