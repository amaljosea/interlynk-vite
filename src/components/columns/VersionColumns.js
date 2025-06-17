/* eslint-disable no-unused-vars */
import { addDays, differenceInDays, parseISO } from 'date-fns'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
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
  Stack,
  Tag,
  TagLabel,
  Text,
  Tooltip
} from '@chakra-ui/react'

import LynkAction from 'components/Misc/LynkAction'
import SeverityInfo from 'components/Misc/SeverityInfo'
import StatusInfo from 'components/Misc/StatusInfo'
import VulnBadge from 'components/Misc/VulnBadge'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useHasPermission } from 'hooks/useHasPermission'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useThemeColor } from 'hooks/useThemeColors'

import { LuFilePen, LuMessageCircleOff, LuRepeat } from 'react-icons/lu'

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

  const [openPopoverId, setOpenPopoverId] = useState(null)
  const [openStatusId, setOpenStatusId] = useState(null)

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
            lifecycle,
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
              <Tooltip label={getFullDate(updatedAt)} placement='top'>
                <Text color={secondaryTextColor}>{timeSince(updatedAt)}</Text>
              </Tooltip>
            </Stack>
          )
        },
        wrap: true,
        sortable: true,
        sortFunction: (a, b) => {
          const dateA = new Date(a.updatedAt)
          const dateB = new Date(b.updatedAt)
          return dateA - dateB
        },
        width: '20%'
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
              <Tag minW={'50px'} colorScheme='teal'>
                <TagLabel mx={'auto'}> {stats?.compCount}</TagLabel>
              </Tag>
            </Link>
          )
        }
      },
      // LICENSES
      {
        id: 'LICENSES',
        name: 'LICENSES',
        selector: (row) => {
          const { stats } = row
          return (
            <Tag
              minW={'50px'}
              colorScheme='orange'
              onClick={() => onSelectLicenses(row)}
            >
              <TagLabel mx={'auto'}> {stats?.compLicenseCount}</TagLabel>
            </Tag>
          )
        }
        // omit: true
      },
      // VULNERABILITIES
      {
        id: 'VULNERABILITIES',
        name: 'VULNERABILITIES',
        selector: (row) => {
          const { id, stats, vulnRunStatus } = row
          const { vulnStats } = stats || {}
          const notStarted = vulnRunStatus === 'NOT_STARTED'
          const link = generateProductVersionDetailPageUrlFromCurrentUrl({
            sbomid: id,
            paramsObj: {
              tab: 'vulnerabilities'
            }
          })
          const { critical, high, ...rest } = vulnStats
          const total = Object.values(rest).reduce(
            (sum, value) => sum + value,
            0
          )

          return (
            <Flex gap={1} my={3} alignItems={'center'} flexWrap={'wrap'}>
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
              {signedUrlParams && (
                <Text ml={1} color={primaryTextColor}>+{total}</Text>
              )}
              {vulnRunStatus === 'FINISHED' && total !== 0 && (
                <Popover
                  placement='right'
                  closeOnBlur={false}
                  returnFocusOnClose={false}
                  isOpen={openPopoverId === row?.id}
                  onClose={() => setOpenPopoverId(null)}
                >
                  <PopoverTrigger>
                    <Tag
                      minW={'60px'}
                      colorScheme='gray'
                      onMouseEnter={() => setOpenPopoverId(row?.id)}
                      onMouseLeave={() => setOpenPopoverId(null)}
                    >
                      <TagLabel mx={'auto'}>+{total}</TagLabel>
                    </Tag>
                  </PopoverTrigger>
                  <Portal>
                    <PopoverContent
                      zIndex={111}
                      width={'200px'}
                      overflow={'hidden'}
                      color={primaryTextColor}
                      onMouseEnter={() => setOpenPopoverId(row?.id)}
                      onMouseLeave={() => setOpenPopoverId(null)}
                    >
                      <PopoverBody>
                        <SeverityInfo data={row} onClick={onFilterSev} />
                      </PopoverBody>
                    </PopoverContent>
                  </Portal>
                </Popover>
              )}
            </Flex>
          )
        },
        width: '16%'
      },
      // STATUSES
      {
        id: 'STATUSES',
        name: 'STATUSES',
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
            <Popover
              placement='right'
              closeOnBlur={false}
              returnFocusOnClose={false}
              isOpen={openStatusId === row?.id}
              onClose={() => setOpenStatusId(null)}
            >
              <PopoverTrigger>
                <Tag
                  minW={'60px'}
                  colorScheme='blue'
                  onMouseEnter={() => setOpenStatusId(row?.id)}
                  onMouseLeave={() => setOpenStatusId(null)}
                >
                  <TagLabel mx={'auto'}>{total}</TagLabel>
                </Tag>
              </PopoverTrigger>
              <Portal>
                <PopoverContent
                  zIndex={111}
                  w={'230px'}
                  overflow={'hidden'}
                  color={primaryTextColor}
                  onMouseEnter={() => setOpenStatusId(row?.id)}
                  onMouseLeave={() => setOpenStatusId(null)}
                >
                  <PopoverBody w={'fit-content'}>
                    <StatusInfo data={row} />
                  </PopoverBody>
                </PopoverContent>
              </Portal>
            </Popover>
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
                fontSize={14}
              >
                {timeSince(createdAt)}
              </Text>
            </Tooltip>
          )
        },
        wrap: true,
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
    openPopoverId,
    openStatusId,
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
