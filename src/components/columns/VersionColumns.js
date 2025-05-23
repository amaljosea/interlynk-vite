import { addDays, differenceInDays, parseISO } from 'date-fns'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getFullDate, getSignedUrlParams, timeSince } from 'utils'

import {
  Divider,
  Flex,
  IconButton,
  Menu,
  MenuItem,
  MenuList,
  Portal,
  Stack,
  Tag,
  Text,
  Tooltip
} from '@chakra-ui/react'

import LynkSeparator from 'components/LynkSeparator'
import LynkAction from 'components/Misc/LynkAction'
import VulnBadge from 'components/Misc/VulnBadge'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useHasPermission } from 'hooks/useHasPermission'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useThemeColor } from 'hooks/useThemeColors'

import { LuMessageCircleOff, LuRepeat } from 'react-icons/lu'

const StatusInfo = ({ data }) => {
  return (
    <Stack w={'100%'} spacing={1} p={2}>
      <Text>Unspecified: {data?.unspecifiedCount}</Text>
      <Text>In Triage: {data?.inTriageCount}</Text>
      <Text>Affected: {data?.affectedCount}</Text>
      <Text>Not Afftected: {data?.notAffectedCount}</Text>
      <Text>Fixed: {data?.fixedCount}</Text>
    </Stack>
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
    childKey: 'archive_sbom'
  })
  const updateSbom = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'update_sbom'
  })

  const retention = retentionTime && Math.floor(retentionTime)

  const ignoreMsg = `An SBOM with the same version was recently imported. However, the system found no difference between the two versions, so the newer import has been ignored. On the right, you can still see its record under Action ... > View Alternates`

  return useMemo(() => {
    const columns = [
      // VERSION
      {
        id: 'SBOMS_UPDATED_AT',
        name: 'VERSION',
        selector: (row, index) => {
          const {
            projectVersion,
            createdAt,
            alternatives,
            isReprocess,
            productLifeCycleStage,
            updatedAt
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

          return (
            <Stack my={3} spacing={1} className={index === 0 ? 'versions' : ''}>
              <Link to={link} onClick={onStartTour} data-testid={`version`}>
                <Text w={'fit-content'} color={primaryBlueText} fontSize={14}>
                  {projectVersion}
                </Text>
              </Link>
              <Flex gap={2} alignItems={'center'} flexWrap={'wrap'}>
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
                <LynkSeparator hidden={!daysUntilDeletion || signedUrlParams} />
                {daysUntilDeletion && !signedUrlParams && (
                  <Tooltip
                    label={`Marked for deletion on ${endDate ? new Date(endDate).toLocaleDateString() : ''}`}
                  >
                    <IconButton
                      size={'xs'}
                      icon={<LuMessageCircleOff size={16} />}
                    />
                  </Tooltip>
                )}
                <LynkSeparator
                  hidden={alternatives?.length === 0 || signedUrlParams}
                />
                {!isReprocess && showIcon && (
                  <Tooltip label={ignoreMsg}>
                    <IconButton size={'xs'} icon={<LuRepeat size={16} />} />
                  </Tooltip>
                )}
                <LynkSeparator hidden={signedUrlParams} />
                <Tooltip label={getFullDate(updatedAt)} placement='top'>
                  <Text color={secondaryTextColor}>{timeSince(updatedAt)}</Text>
                </Tooltip>
              </Flex>
            </Stack>
          )
        },
        width: '20%',
        wrap: true,
        sortable: true,
        sortFunction: (a, b) => {
          const dateA = new Date(a.updatedAt)
          const dateB = new Date(b.updatedAt)
          return dateA - dateB
        }
      },
      // COMPONENTS
      {
        id: 'COMPONENTS',
        name: 'COMPONENTS',
        selector: (row) => {
          const { stats, id } = row
          return (
            <Link
              to={generateProductVersionDetailPageUrlFromCurrentUrl({
                sbomid: id,
                paramsObj: {
                  tab: 'components'
                }
              })}
            >
              <Text color={primaryTextColor}>{stats?.compCount}</Text>
            </Link>
          )
        },
        width: '10%'
      },
      // LICENSES
      {
        id: 'LICENSES',
        name: 'LICENSES',
        selector: (row) => {
          const { stats } = row
          return (
            <Text
              onClick={() => onSelectLicenses(row)}
              color={primaryTextColor}
            >
              {stats?.compLicenseCount}
            </Text>
          )
        },
        width: '8%'
      },
      // VULNERABILITIES
      {
        id: 'VULNERABILITIES',
        name: 'VULNERABILITIES',
        width: '30%',
        selector: (row) => {
          const { stats, id, vulnRunStatus } = row
          const notStarted = vulnRunStatus === 'NOT_STARTED'
          const link = generateProductVersionDetailPageUrlFromCurrentUrl({
            sbomid: id,
            paramsObj: {
              tab: 'vulnerabilities'
            }
          })
          return (
            <Flex gap={1} flexWrap={'wrap'} my={4}>
              <VulnBadge
                color='red'
                label='Critical'
                status={vulnRunStatus}
                onClick={() => onFilterSev(['critical'], id, link)}
              >
                {notStarted ? '-' : stats?.vulnStats?.critical || 0}
              </VulnBadge>
              <VulnBadge
                color='orange'
                label='High'
                status={vulnRunStatus}
                onClick={() => onFilterSev(['high'], id, link)}
              >
                {notStarted ? '-' : stats?.vulnStats?.high || 0}
              </VulnBadge>
              <VulnBadge
                color='yellow'
                label='Medium'
                status={vulnRunStatus}
                onClick={() => onFilterSev(['medium'], id, link)}
              >
                {notStarted ? '-' : stats?.vulnStats?.medium || 0}
              </VulnBadge>
              <VulnBadge
                color='green'
                label='Low'
                status={vulnRunStatus}
                onClick={() => onFilterSev(['low'], id, link)}
              >
                {notStarted ? '-' : stats?.vulnStats?.low || 0}
              </VulnBadge>
              <VulnBadge
                color='gray'
                label='Unknown'
                status={vulnRunStatus}
                onClick={() => onFilterSev(['unknown'], id, link)}
              >
                {notStarted ? '-' : stats?.vulnStats?.unknown || 0}
              </VulnBadge>
            </Flex>
          )
        }
      },
      // STATUSES
      {
        id: 'STATUSES',
        name: 'STATUSES',
        width: '8%',
        selector: (row) => {
          const { vulnerabilityMetrics } = row
          const total = Number(
            vulnerabilityMetrics?.unspecifiedCount +
              vulnerabilityMetrics?.inTriageCount +
              vulnerabilityMetrics?.affectedCount +
              vulnerabilityMetrics?.fixedCount +
              vulnerabilityMetrics?.notAffectedCount
          )
          return (
            <Tooltip label={<StatusInfo data={vulnerabilityMetrics} />}>
              <Text color={primaryTextColor}>{total}</Text>
            </Tooltip>
          )
        },
        omit: signedUrlParams
      },
      // CREATED AT
      {
        id: 'SBOMS_CREATED_AT',
        name: 'IMPORTED',
        selector: (row) => {
          const { createdAt } = row
          return (
            <Tooltip label={getFullDate(createdAt)} placement='top'>
              <Text
                color={secondaryTextColor}
                textAlign={'right'}
                fontSize={12}
              >
                {timeSince(createdAt)}
              </Text>
            </Tooltip>
          )
        },
        wrap: true,
        width: signedUrlParams ? 'auto' : '12%',
        right: 'true',
        sortable: true
      },
      // ACTIONS
      {
        id: 'ACTION',
        name: '',
        selector: (row) => {
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
                    Set Lifecycle
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
