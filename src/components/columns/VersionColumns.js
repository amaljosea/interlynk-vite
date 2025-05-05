import { addDays, differenceInDays, parseISO } from 'date-fns'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  getFormat,
  getFullDate,
  getLink,
  getSignedUrlParams,
  timeSince,
  truncatedValue
} from 'utils'
import { getType } from 'utils/styleUtils'

import {
  Box,
  Divider,
  Flex,
  Grid,
  GridItem,
  Icon,
  IconButton,
  Menu,
  MenuItem,
  MenuList,
  Link as Olink,
  Portal,
  Stack,
  Tag,
  TagLabel,
  Text,
  Tooltip
} from '@chakra-ui/react'

import LynkAction from 'components/Misc/LynkAction'
import VulnBadge from 'components/Misc/VulnBadge'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useHasPermission } from 'hooks/useHasPermission'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useShouldShowDemoFeatures } from 'hooks/useShouldShowDemoFeatures'
import { useThemeColor } from 'hooks/useThemeColors'

import { HiOutlineDuplicate } from 'react-icons/hi'
import { LuOctagonAlert } from 'react-icons/lu'

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
  const { shouldShowDemoFeatures } = useShouldShowDemoFeatures()
  const { generateProductVersionDetailPageUrlFromCurrentUrl } =
    useProductUrlContext()
  const { primaryTextColor, primaryErrorColor, primaryBlueText } =
    useThemeColor(['primaryTextColor', 'primaryErrorColor', 'primaryBlueText'])
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
        id: 'SBOMS_PROJECT_VERSION',
        name: 'VERSION',
        selector: (row, index) => {
          const {
            projectVersion,
            createdAt,
            alternatives,
            isReprocess,
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

          return (
            <Grid
              justifyContent={'center'}
              templateColumns='repeat(7, 1fr)'
              className={index === 0 ? 'versions' : ''}
              sx={{ my: 3, gap: 2, alignItems: 'center' }}
            >
              {shouldShowDemoFeatures && (
                <GridItem colSpan={1} width={'20px'}>
                  <Tooltip label={getFormat(projectVersion)} placement='top'>
                    <Olink
                      href={getLink(projectVersion)}
                      isExternal={
                        getLink(projectVersion) === '#' ? false : true
                      }
                    >
                      <IconButton
                        size='xs'
                        isRound={true}
                        color={primaryTextColor}
                        icon={getType(projectVersion)}
                        background='transparent'
                      />
                    </Olink>
                  </Tooltip>
                </GridItem>
              )}
              <GridItem w={'100%'} colSpan={shouldShowDemoFeatures ? 6 : 7}>
                <Stack spacing={1}>
                  <Flex gap={2} alignItems={'center'}>
                    <Tooltip label={projectVersion}>
                      <Link
                        to={link}
                        onClick={onStartTour}
                        data-testid={`version`}
                      >
                        <Text color={primaryBlueText} fontSize={14}>
                          {truncatedValue(projectVersion, 20)}
                        </Text>
                      </Link>
                    </Tooltip>
                    {!isReprocess && showIcon && (
                      <Tooltip label={ignoreMsg}>
                        <Box>
                          <Icon
                            as={HiOutlineDuplicate}
                            sx={{
                              mt: 1,
                              fontSize: 18,
                              color: primaryTextColor
                            }}
                          />
                        </Box>
                      </Tooltip>
                    )}
                    {daysUntilDeletion && !signedUrlParams && (
                      <Tooltip
                        label={`Marked for deletion on ${endDate ? new Date(endDate).toLocaleDateString() : ''}`}
                      >
                        <IconButton
                          size='xs'
                          variant={'unstyled'}
                          color={primaryErrorColor}
                          icon={<LuOctagonAlert size={16} />}
                        />
                      </Tooltip>
                    )}
                  </Flex>
                  <Tag
                    hidden={!productLifeCycleStage}
                    size={'sm'}
                    variant='solid'
                    colorScheme='blue'
                    w={'fit-content'}
                    cursor={'pointer'}
                  >
                    <TagLabel textTransform={'capitalize'}>
                      {String(productLifeCycleStage)?.replaceAll(/_/g, ' ')}
                    </TagLabel>
                  </Tag>
                </Stack>
              </GridItem>
            </Grid>
          )
        },
        width: '14%',
        wrap: true,
        sortable: true
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
              <Tag size='md' variant='subtle' width={16} colorScheme={'blue'}>
                <TagLabel mx={'auto'}>{stats?.compCount}</TagLabel>
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
              size='md'
              variant='subtle'
              colorScheme={'blue'}
              sx={{ w: 16, cursor: 'pointer' }}
              onClick={() => onSelectLicenses(row)}
            >
              <TagLabel mx={'auto'}>{stats?.compLicenseCount}</TagLabel>
            </Tag>
          )
        }
      },
      // VULNERABILITIES
      {
        id: 'VULNERABILITIES',
        name: 'VULNERABILITIES',
        width: '20%',
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
              <Tag w={'80px'} cursor={'pointer'} colorScheme='blue'>
                <TagLabel mx={'auto'}>{total}</TagLabel>
              </Tag>
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
              <Text color={primaryTextColor} textAlign={'right'}>
                {timeSince(createdAt)}
              </Text>
            </Tooltip>
          )
        },
        wrap: true,
        width: '12%',
        right: 'true',
        sortable: true
      },
      // UPDATED AT
      {
        id: 'SBOMS_UPDATED_AT',
        name: 'UPDATED',
        selector: (row) => {
          const { updatedAt } = row
          return (
            <Tooltip label={getFullDate(updatedAt)} placement='top'>
              <Text color={primaryTextColor} textAlign={'right'}>
                {timeSince(updatedAt)}
              </Text>
            </Tooltip>
          )
        },
        wrap: true,
        width: '12%',
        sortable: true,
        right: 'true'
      },
      // ACTIONS
      {
        id: 'ACTION',
        name: 'ACTION',
        selector: (row) => {
          return (
            <Menu>
              <LynkAction aria-label={`sbom-${row?.projectVersion}-actions`} />
              <Portal>
                <MenuList fontSize={'sm'}>
                  <MenuItem
                    hidden={signedUrlParams}
                    isDisabled={!updateSbom}
                    onClick={() => action('set_lifecycle', row)}
                    aria-label={`sbom-${row?.projectVersion}-lifecycle`}
                  >
                    Set Lifecycle
                  </MenuItem>
                  <MenuItem
                    aria-label={`sbom-${row?.projectVersion}-reprocess`}
                    onClick={() => action('rerun_import', row)}
                    hidden={signedUrlParams}
                    isDisabled={!canReprocessSbom}
                  >
                    Rerun Import
                  </MenuItem>
                  <MenuItem
                    aria-label={`sbom-${row?.projectVersion}-automation`}
                    onClick={() => action('rerun_automation', row)}
                    hidden={signedUrlParams || isFreeTier}
                    isDisabled={!canReprocessSbom}
                  >
                    Rerun Automation
                  </MenuItem>
                  <MenuItem
                    aria-label={`sbom-${row?.projectVersion}-support-analysis`}
                    onClick={() => action('rerun_support_analysis', row)}
                    hidden={signedUrlParams || isFreeTier}
                    isDisabled={!canReprocessSbom}
                  >
                    Rerun Support Analysis
                  </MenuItem>
                  <MenuItem
                    isDisabled={!updateSbom}
                    hidden={signedUrlParams}
                    onClick={() => action('switch_environment', row)}
                    aria-label={`sbom-${row?.projectVersion}-transfer`}
                  >
                    Switch Environment
                  </MenuItem>
                  <MenuItem
                    hidden={signedUrlParams}
                    onClick={() => action('view_alternates', row)}
                    aria-label={`sbom-${row?.projectVersion}-list`}
                  >
                    View Alternates
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    aria-label={`sbom-${row?.projectVersion}-archive`}
                    isDisabled={!archiveSbom || signedUrlParams}
                    onClick={() => action('archive_sbom', row)}
                  >
                    Archive
                  </MenuItem>
                  <MenuItem
                    data-testid='sbom-delete-button'
                    aria-label={`sbom-${row?.projectVersion}-delete`}
                    color={primaryErrorColor}
                    onClick={() => action('delete_sbom', row)}
                    isDisabled={!archiveSbom || signedUrlParams}
                  >
                    Delete
                  </MenuItem>
                </MenuList>
              </Portal>
            </Menu>
          )
        },
        right: 'true'
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
    shouldShowDemoFeatures,
    signedUrlParams,
    updateSbom
  ])
}

export default VersionColumns
