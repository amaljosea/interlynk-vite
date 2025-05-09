import { useQuery } from '@apollo/client'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getFullDate, timeSince, truncatedValue } from 'utils'

import {
  ButtonGroup,
  Flex,
  IconButton,
  Stack,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import LynkDrawer from 'components/LynkDrawer'
import ArchiveSbom from 'components/Modal/ArchiveSbom'

import useCustomToast from 'hooks/useCustomToast'
import useFetchAllNodes from 'hooks/useFetchAllNodes'
import { useHasPermission } from 'hooks/useHasPermission'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetArchivedVersions, GetVersions } from 'graphQL/Queries'

import { LuArchiveRestore, LuEye } from 'react-icons/lu'

const ArchivedVersions = ({ isOpen, onClose, projectGroup }) => {
  const navigate = useNavigate()
  const { showToast } = useCustomToast()
  const { generateProductVersionDetailPageUrlFromCurrentUrl } =
    useProductUrlContext()
  const params = useParams()
  const productId = params?.productid
  const { sameSecondaryText } = useThemeColor(['sameSecondaryText'])
  const [activeRow, setActiveRow] = useState(null)

  const updateSbom = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'update_sbom'
  })

  const shouldFetchData = isOpen && Boolean(productId)

  const { data, loading: archivedLoading } = useQuery(GetArchivedVersions, {
    skip: !shouldFetchData,
    variables: { id: productId }
  })

  const shouldSkipFetchAllNodes =
    !shouldFetchData || (data && data.project?.sbomArchived?.length === 0)

  const versionVariables = useMemo(
    () => ({
      id: productId,
      direction: 'DESC',
      field: 'SBOMS_CREATED_AT'
    }),
    [productId]
  )

  const { data: nodes, loading } = useFetchAllNodes({
    query: GetVersions,
    variables: versionVariables,
    selector: 'project.sbomVersions',
    skip: !data ? true : shouldSkipFetchAllNodes
  })

  const { sbomArchived } = data?.project || { sbomArchived: [] }

  const {
    isOpen: isWarnOpen,
    onOpen: onWarnOpen,
    onClose: onWarnClose
  } = useDisclosure()

  const handleRestore = (row) => {
    const isExists = nodes?.some(
      (item) => item?.projectVersion === row?.projectVersion
    )
    if (isExists) {
      showToast({
        title: 'Restore Version',
        description:
          'An existing version with the same value found. Please delete the previous version to restore this one.',
        status: 'info'
      })
    } else {
      setActiveRow(row)
      onWarnOpen()
    }
  }

  const handleView = (row) => {
    const link = generateProductVersionDetailPageUrlFromCurrentUrl({
      sbomid: row?.id,
      paramsObj: {
        tab: 'general'
      }
    })
    navigate(link)
  }

  const ArchivedVersionItem = ({
    item,
    handleView,
    handleRestore,
    updateSbom
  }) => (
    <Flex w='full' alignItems='center' justifyContent='space-between'>
      <Stack spacing={0}>
        <Text>
          {truncatedValue(item?.project?.projectGroup?.name, 20)} :{' '}
          {truncatedValue(item?.projectVersion, 20)}
        </Text>
        <Tooltip label={getFullDate(item?.createdAt)} placement='top'>
          <Text color={sameSecondaryText} fontSize='sm'>
            Last updated {timeSince(item?.createdAt)}
          </Text>
        </Tooltip>
      </Stack>
      <ButtonGroup>
        <Tooltip label='View' placement='top'>
          <IconButton
            size='sm'
            colorScheme='blue'
            title='View archived version'
            onClick={() => handleView(item)}
            icon={<LuEye size={18} />}
          />
        </Tooltip>
        <Tooltip label='Restore' placement='top'>
          <IconButton
            size='sm'
            colorScheme='blue'
            isDisabled={!updateSbom || loading}
            onClick={() => handleRestore(item)}
            icon={<LuArchiveRestore size={18} />}
            aria-label={`sbom-${item?.projectVersion}-restore`}
          />
        </Tooltip>
      </ButtonGroup>
    </Flex>
  )

  const renderArchivedVersions = () => {
    if (archivedLoading) {
      return <CustomLoader />
    }

    if (sbomArchived.length === 0) {
      return (
        <Text textAlign='center' marginY={10}>
          No archived versions found.
        </Text>
      )
    }

    return (
      <Flex my={2} gap={5} flexDir={'column'} alignItems={'flex-center'}>
        {sbomArchived.map((item, index) => (
          <ArchivedVersionItem
            key={index}
            item={item}
            handleView={handleView}
            handleRestore={handleRestore}
            updateSbom={updateSbom}
          />
        ))}
      </Flex>
    )
  }

  return (
    <>
      <LynkDrawer
        title='Archived Versions'
        isOpen={isOpen}
        onClose={onClose}
        noFooter
      >
        {renderArchivedVersions()}
      </LynkDrawer>

      {/* ARCHIVE VERSION */}
      {isWarnOpen && (
        <ArchiveSbom
          data={activeRow}
          isOpen={isWarnOpen}
          onClose={onWarnClose}
          projectGroup={{ name: projectGroup?.name }}
        />
      )}
    </>
  )
}

export default ArchivedVersions
