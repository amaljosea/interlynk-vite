import { useLazyQuery } from '@apollo/client'
import { addDays, differenceInDays, parseISO } from 'date-fns'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  capitalizeFirstLetter,
  getFullDate,
  getSignedUrlParams,
  timeSince,
  truncatedValue
} from 'utils'

import {
  Box,
  Divider,
  Flex,
  Icon,
  Menu,
  MenuItem,
  MenuList,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Spinner,
  Stack,
  Tag,
  TagLabel,
  Text,
  Tooltip
} from '@chakra-ui/react'

import LynkAction from 'components/Misc/LynkAction'
import SeverityInfo from 'components/Misc/SeverityInfo'
import StatusInfo from 'components/Misc/StatusInfo'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGradualPolling } from 'hooks/useGradualPolling'
import { useHasPermission } from 'hooks/useHasPermission'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetSbomMetrics, GetShareSbomMetrics } from 'graphQL/Queries'

import { LuFilePen, LuMessageCircleOff, LuRepeat } from 'react-icons/lu'

const useSbomMetrics = (sbomId) => {
  const params = useParams()
  const productId = params.productid

  const signedUrlParams = getSignedUrlParams()

  const Query = signedUrlParams ? GetShareSbomMetrics : GetSbomMetrics

  const queryVariables = signedUrlParams
    ? { sbomId }
    : { projectId: productId, sbomId: sbomId }

  const [getMetrics, { data, loading, error, startPolling, stopPolling }] =
    useLazyQuery(Query, {
      variables: queryVariables
    })

  const [metrics, setMetrics] = useState(null)

  useEffect(() => {
    if (data) {
      setMetrics(signedUrlParams ? data.shareLynkQuery?.sbom : data.sbom)
    }
  }, [data, signedUrlParams])

  const shouldPoll =
    !signedUrlParams && metrics && metrics.vulnRunStatus !== 'FINISHED'

  useGradualPolling({ shouldPoll, startPolling, stopPolling })

  return {
    getMetrics,
    metrics,
    loading,
    error
  }
}

const SbomComponentCount = ({
  sbomId,
  generateProductVersionDetailPageUrlFromCurrentUrl
}) => {
  const { getMetrics, metrics, loading } = useSbomMetrics(sbomId)

  useEffect(() => {
    getMetrics()
  }, [getMetrics])

  return (
    <Link
      to={generateProductVersionDetailPageUrlFromCurrentUrl({
        sbomid: sbomId,
        paramsObj: {
          tab: 'components'
        }
      })}
    >
      <Tag minW={'50px'} colorScheme='teal'>
        <TagLabel mx={'auto'}>
          {loading ? (
            <Spinner size='xs' mt={0.5} />
          ) : (
            metrics?.stats?.compCount || 0
          )}
        </TagLabel>
      </Tag>
    </Link>
  )
}

const SbomLicenseCount = ({ sbomId, onSelectLicenses, rowData }) => {
  const { getMetrics, metrics, loading } = useSbomMetrics(sbomId)

  useEffect(() => {
    getMetrics()
  }, [getMetrics])

  const handleClick = useCallback(() => {
    onSelectLicenses(rowData)
  }, [onSelectLicenses, rowData])

  return (
    <Tag minW={'50px'} colorScheme='orange' onClick={handleClick}>
      <TagLabel mx={'auto'}>
        {loading ? (
          <Spinner size='xs' mt={0.5} />
        ) : (
          metrics?.stats?.compLicenseCount || 0
        )}
      </TagLabel>
    </Tag>
  )
}

const SbomVulnerabilities = ({
  sbomId,
  generateProductVersionDetailPageUrlFromCurrentUrl,
  onFilterSev
}) => {
  const { getMetrics, metrics, loading } = useSbomMetrics(sbomId)

  useEffect(() => {
    getMetrics()
  }, [getMetrics])

  const link = generateProductVersionDetailPageUrlFromCurrentUrl({
    sbomid: sbomId,
    paramsObj: { tab: 'vulnerabilities' }
  })

  const renderLoadingTags = () => (
    <Flex gap={2}>
      <Tag minW='50px' colorScheme='red'>
        <TagLabel mx='auto'>
          <Spinner size='xs' mt={0.5} />
        </TagLabel>
      </Tag>
      <Tag minW='50px' colorScheme='orange'>
        <TagLabel mx='auto'>
          <Spinner size='xs' mt={0.5} />
        </TagLabel>
      </Tag>
    </Flex>
  )

  return loading ? (
    renderLoadingTags()
  ) : (
    <SeverityInfo
      data={metrics || {}}
      link={link}
      onFilter={onFilterSev}
      loading={loading}
    />
  )
}

const SbomStatuses = ({
  sbomId,
  primaryTextColor,
  openStatusId,
  setOpenStatusId
}) => {
  const { getMetrics, metrics, loading } = useSbomMetrics(sbomId)

  useEffect(() => {
    getMetrics()
  }, [getMetrics])

  const vulnerabilityMetrics = metrics?.vulnerabilityMetrics || {}
  const total =
    Number(
      vulnerabilityMetrics?.unspecifiedCount +
        vulnerabilityMetrics?.inTriageCount +
        vulnerabilityMetrics?.affectedCount +
        vulnerabilityMetrics?.fixedCount +
        vulnerabilityMetrics?.notAffectedCount
    ) || 0

  return (
    <Popover
      placement='right'
      closeOnBlur={false}
      returnFocusOnClose={false}
      isOpen={openStatusId === sbomId}
      onClose={() => setOpenStatusId(null)}
    >
      <PopoverTrigger>
        <Tag
          minW={'60px'}
          colorScheme='blue'
          onMouseEnter={() => setOpenStatusId(sbomId)}
          onMouseLeave={() => setOpenStatusId(null)}
        >
          <TagLabel mx={'auto'}>
            {loading ? <Spinner size='xs' mt={0.5} /> : total}
          </TagLabel>
        </Tag>
      </PopoverTrigger>
      <Portal>
        <PopoverContent
          zIndex={111}
          w={'230px'}
          overflow={'hidden'}
          color={primaryTextColor}
          onMouseEnter={() => setOpenStatusId(sbomId)}
          onMouseLeave={() => setOpenStatusId(null)}
        >
          <PopoverBody w={'fit-content'}>
            <StatusInfo data={metrics} loading={loading} />
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  )
}

const VersionColumns = (props) => {
  const { action, retentionTime, onFilterSev, onSelectLicenses, onStartTour } =
    props

  const signedUrlParams = getSignedUrlParams()
  const { isFreeTier } = useGlobalQueryContext()
  const { generateProductVersionDetailPageUrlFromCurrentUrl } =
    useProductUrlContext()
  const {
    primaryTextColor,
    primaryErrorColor,
    primaryBlueText,
    secondaryTextColor
  } = useThemeColor([
    'primaryTextColor',
    'primaryErrorColor',
    'primaryBlueText',
    'secondaryTextColor'
  ])
  const canReprocessSbom = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'reprocess_sbom'
  })
  const archiveSbom = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'delete_sbom'
  })
  const updateSbom = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'update_sbom'
  })

  const [openStatusId, setOpenStatusId] = useState(null)

  const retention = retentionTime && Math.floor(retentionTime)

  const ignoreMsg = `An SBOM with the same version was recently imported. However, the system found no difference between the two versions, so the newer import has been ignored. On the right, you can still see its record under Action ... > View Alternates`

  return useMemo(() => {
    const columns = [
      // VERSION
      {
        id: 'SBOMS_PROJECT_VERSION',
        name: 'VERSION',
        selector: (row, index) => {
          const {
            projectVersion,
            createdAt,
            alternatives,
            isReprocess,
            lifecycle,
            productLifeCycleStage
          } = row
          const currentDate = new Date()
          const parsedCreatedDate = parseISO(createdAt)
          const endDate = addDays(parsedCreatedDate, retention)
          const diff = differenceInDays(endDate, currentDate)
          const daysUntilDeletion = diff <= 7 && diff >= 0 && retention !== 0
          // const exceedingItems = endDate > currentDate
          const link = generateProductVersionDetailPageUrlFromCurrentUrl({
            sbomid: row.id,
            paramsObj: {
              tab: 'general'
            }
          })
          const showIcon = alternatives?.length > 0
          const lifestage = String(productLifeCycleStage)?.replaceAll(/_/g, ' ')
          const lifecycleLabel = capitalizeFirstLetter(lifecycle)

          return (
            <Stack my={3} spacing={1} className={index === 0 ? 'versions' : ''}>
              <Flex gap={2} alignItems={'center'} flexWrap={'wrap'}>
                {lifecycle === 'draft' && (
                  <Tooltip label={lifecycleLabel}>
                    <Box>
                      <Icon
                        fontSize={18}
                        as={LuFilePen}
                        color={primaryTextColor}
                      />
                    </Box>
                  </Tooltip>
                )}
                <Link to={link} onClick={onStartTour} data-testid={`version`}>
                  <Tooltip label={projectVersion}>
                    <Text
                      w={'fit-content'}
                      color={primaryBlueText}
                      fontSize={14}
                    >
                      {truncatedValue(projectVersion, 8)}
                    </Text>
                  </Tooltip>
                </Link>
                {productLifeCycleStage && (
                  <Tag
                    fontSize={12}
                    variant='subtle'
                    w={'fit-content'}
                    colorScheme='blue'
                    textTransform={'capitalize'}
                  >
                    {lifestage}
                  </Tag>
                )}
                {daysUntilDeletion && !signedUrlParams && (
                  <Tooltip
                    label={`Marked for deletion on ${endDate ? new Date(endDate).toLocaleDateString() : ''}`}
                  >
                    <Box>
                      <LuMessageCircleOff size={16} color={primaryTextColor} />
                    </Box>
                  </Tooltip>
                )}
                {!isReprocess && showIcon && (
                  <Tooltip label={ignoreMsg}>
                    <Box>
                      <LuRepeat size={16} color={primaryTextColor} />
                    </Box>
                  </Tooltip>
                )}
              </Flex>
              <Tooltip label={getFullDate(createdAt)} placement='top'>
                <Text color={secondaryTextColor}>
                  Added {timeSince(createdAt)}
                </Text>
              </Tooltip>
            </Stack>
          )
        },
        wrap: true,
        sortable: true,
        width: '20%'
      },
      // COMPONENTS
      {
        id: 'COMPONENTS',
        name: 'COMPONENTS',
        selector: (row) => (
          <SbomComponentCount
            sbomId={row.id}
            generateProductVersionDetailPageUrlFromCurrentUrl={
              generateProductVersionDetailPageUrlFromCurrentUrl
            }
          />
        )
      },
      // LICENSES
      {
        id: 'LICENSES',
        name: 'LICENSES',
        selector: (row) => (
          <SbomLicenseCount
            sbomId={row.id}
            onSelectLicenses={onSelectLicenses}
            rowData={row}
          />
        )
      },
      // VULNERABILITIES
      {
        id: 'VULNERABILITIES',
        name: 'VULNERABILITIES',
        selector: (row) => (
          <SbomVulnerabilities
            sbomId={row.id}
            generateProductVersionDetailPageUrlFromCurrentUrl={
              generateProductVersionDetailPageUrlFromCurrentUrl
            }
            onFilterSev={onFilterSev}
          />
        ),
        width: '16%'
      },
      // STATUSES
      {
        id: 'STATUSES',
        name: 'STATUSES',
        selector: (row) => (
          <SbomStatuses
            sbomId={row.id}
            primaryTextColor={primaryTextColor}
            openStatusId={openStatusId}
            setOpenStatusId={setOpenStatusId}
          />
        ),
        omit: signedUrlParams
      },
      // CREATED AT
      {
        id: 'SBOMS_UPDATED_AT',
        name: 'UPDATED',
        selector: (row) => {
          const { updatedAt } = row
          return (
            <Tooltip label={getFullDate(updatedAt)} placement='top'>
              <Text
                color={secondaryTextColor}
                textAlign={'right'}
                fontSize={14}
              >
                {timeSince(updatedAt)}
              </Text>
            </Tooltip>
          )
        },
        wrap: true,
        right: 'true',
        sortable: true,
        sortFunction: (a, b) => {
          const dateA = new Date(a.updatedAt)
          const dateB = new Date(b.updatedAt)
          return dateA - dateB
        }
      },
      // ACTIONS
      {
        id: 'ACTION',
        name: '',
        selector: (row) => {
          const { lifecycle } = row
          return (
            <Menu>
              <LynkAction aria-label={`sbom-${row?.projectVersion}-actions`} />
              <Portal>
                <MenuList fontSize={'sm'}>
                  <MenuItem
                    isDisabled={!updateSbom}
                    onClick={() => action('set_lifecycle', row)}
                    aria-label={`sbom-${row?.projectVersion}-lifecycle`}
                  >
                    Set Lifestage
                  </MenuItem>
                  <MenuItem
                    aria-label={`sbom-${row?.projectVersion}-reprocess`}
                    onClick={() => action('rerun_import', row)}
                    isDisabled={!canReprocessSbom}
                  >
                    Rerun Import
                  </MenuItem>
                  <MenuItem
                    aria-label={`sbom-${row?.projectVersion}-automation`}
                    onClick={() => action('rerun_automation', row)}
                    hidden={isFreeTier}
                    isDisabled={!canReprocessSbom}
                  >
                    Rerun Automation
                  </MenuItem>
                  <MenuItem
                    aria-label={`sbom-${row?.projectVersion}-support-analysis`}
                    onClick={() => action('rerun_support_analysis', row)}
                    hidden={isFreeTier}
                    isDisabled={!canReprocessSbom}
                  >
                    Rerun Support Analysis
                  </MenuItem>
                  <MenuItem
                    isDisabled={!updateSbom}
                    onClick={() => action('switch_environment', row)}
                    aria-label={`sbom-${row?.projectVersion}-transfer`}
                  >
                    Switch Environment
                  </MenuItem>
                  <MenuItem
                    onClick={() => action('view_alternates', row)}
                    aria-label={`sbom-${row?.projectVersion}-list`}
                  >
                    View Alternates
                  </MenuItem>
                  <MenuItem
                    isDisabled={!updateSbom}
                    hidden={isFreeTier || lifecycle === 'draft'}
                    onClick={() => action('duplicate_sbom', row)}
                    aria-label={`sbom-${row?.projectVersion}-duplicate`}
                  >
                    Duplicate
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    aria-label={`sbom-${row?.projectVersion}-archive`}
                    isDisabled={!archiveSbom}
                    onClick={() => action('archive_sbom', row)}
                  >
                    Archive
                  </MenuItem>
                  <MenuItem
                    data-testid='sbom-delete-button'
                    aria-label={`sbom-${row?.projectVersion}-delete`}
                    color={primaryErrorColor}
                    onClick={() => action('delete_sbom', row)}
                    isDisabled={!archiveSbom}
                  >
                    Delete
                  </MenuItem>
                </MenuList>
              </Portal>
            </Menu>
          )
        },
        right: 'true',
        omit: signedUrlParams
      }
    ]

    return columns
  }, [
    action,
    archiveSbom,
    canReprocessSbom,
    generateProductVersionDetailPageUrlFromCurrentUrl,
    ignoreMsg,
    isFreeTier,
    onFilterSev,
    onSelectLicenses,
    onStartTour,
    openStatusId,
    setOpenStatusId,
    primaryBlueText,
    primaryErrorColor,
    primaryTextColor,
    retention,
    secondaryTextColor,
    signedUrlParams,
    updateSbom
  ])
}

export default VersionColumns
