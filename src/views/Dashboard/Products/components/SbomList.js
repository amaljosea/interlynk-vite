import { useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'
import DataTable from 'react-data-table-component'
import { useParams } from 'react-router-dom'
import { getFullDate, timeSince, truncatedValue } from 'utils'
import { customStyles } from 'utils/styleUtils'

import { IconButton, Stack, useDisclosure } from '@chakra-ui/react'
import { Tag, TagLabel, Text, Tooltip } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import LynkDrawer from 'components/LynkDrawer'

import useCustomToast from 'hooks/useCustomToast'
import { useHasPermission } from 'hooks/useHasPermission'
import { useThemeColor } from 'hooks/useThemeColors'

import { sbomUpdate } from 'graphQL/Mutation'
import { GetSbomAlternatives } from 'graphQL/Queries'

import { FaArrowUp } from 'react-icons/fa6'

import ConfirmationModal from './ConfirmationModal'

const SbomList = ({ sbomId, projectGroup, isOpen, onClose }) => {
  const params = useParams()
  const { showToast } = useCustomToast()

  const PROMOTE_WARNING = useDisclosure()
  const [activeSbom, setActiveSbom] = useState(null)

  const editSbom = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'update_sbom'
  })

  const { primaryTextColor, headingTextColor } = useThemeColor([
    'primaryTextColor',
    'headingTextColor'
  ])

  const [updateSbom, { loading: updateLoading }] = useMutation(sbomUpdate)

  const { data: sbomAlts, loading } = useQuery(GetSbomAlternatives, {
    skip: isOpen ? false : true,
    variables: {
      projectId: params?.productid,
      sbomId: sbomId
    }
  })
  const { alternatives } = sbomAlts?.sbom || {}

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

  const columns = [
    {
      id: 'COMPONENTS',
      name: 'COMPONENTS',
      compact: true,
      selector: (row) => {
        const { stats } = row || {}
        return (
          <Tag size='md' variant='subtle' width={16} colorScheme={'blue'}>
            <TagLabel mx={'auto'}>{stats?.compCount}</TagLabel>
          </Tag>
        )
      },
      wrap: true
    },
    {
      id: 'LICENSES',
      name: 'LICENSES',
      selector: (row) => {
        const { stats } = row || {}
        return (
          <Tag
            size='md'
            width={16}
            mx={'auto'}
            variant='subtle'
            colorScheme={'blue'}
          >
            <TagLabel mx={'auto'}>{stats?.compLicenseCount}</TagLabel>
          </Tag>
        )
      },
      wrap: true
    },
    {
      id: 'STATUS',
      name: 'STATUS',
      selector: (row) => {
        const { lifecycle } = row || {}
        return (
          <Tag width={24} colorScheme='cyan' textTransform={'capitalize'}>
            <TagLabel mx={'auto'}>{lifecycle}</TagLabel>
          </Tag>
        )
      },

      right: true,
      wrap: true
    },
    {
      id: 'IMPORTED',
      name: 'IMPORTED',
      selector: (row) => {
        const { createdAt } = row || {}
        return (
          <Tooltip label={getFullDate(createdAt)} placement='top'>
            <Text color={primaryTextColor}>{timeSince(createdAt)}</Text>
          </Tooltip>
        )
      },
      right: true,
      wrap: true
    },
    {
      id: 'UPDATED',
      name: 'UPDATED',
      selector: (row) => {
        const { updatedAt } = row || {}
        return (
          <Tooltip label={getFullDate(updatedAt)} placement='top'>
            <Text color={primaryTextColor}>{timeSince(updatedAt)}</Text>
          </Tooltip>
        )
      },
      right: true,
      wrap: true
    },
    {
      id: 'ACTIONS',
      name: 'ACTIONS',
      compact: true,
      selector: (row) => (
        <Tooltip label={'Promote to version'} placement='top'>
          <IconButton
            size='sm'
            colorScheme='blue'
            icon={<FaArrowUp />}
            isDisabled={!editSbom}
            onClick={() => handleWarning(row)}
          />
        </Tooltip>
      ),
      right: true,
      wrap: true
    }
  ]

  if (loading) return null

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
        <DataTable
          responsive
          persistTableHead
          columns={columns}
          progressPending={loading}
          data={alternatives}
          progressComponent={<CustomLoader />}
          className='data-table-container'
          customStyles={customStyles(headingTextColor)}
        />
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
