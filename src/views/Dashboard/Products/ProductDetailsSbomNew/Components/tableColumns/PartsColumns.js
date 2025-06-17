/* eslint-disable no-unused-vars */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isValidPurl, truncatedValue } from 'utils'
import { GetIcon } from 'utils/styleUtils'

import {
  Flex,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Tag,
  TagLabel
} from '@chakra-ui/react'
import { IconButton, Link, Portal, Stack, Text } from '@chakra-ui/react'
import { Grid, GridItem } from '@chakra-ui/react'
import { Menu, MenuItem, MenuList } from '@chakra-ui/react'

import LynkAction from 'components/Misc/LynkAction'
import SeverityInfo from 'components/Misc/SeverityInfo'
import StatusInfo from 'components/Misc/StatusInfo'
import VulnBadge from 'components/Misc/VulnBadge'

import { useThemeColor } from 'hooks/useThemeColors'

import { LuCircleHelp } from 'react-icons/lu'

const PartsColumns = (
  onFilterSev,
  colorMode,
  updateSboms,
  signedUrlParams,
  onDeleteOpen,
  isArchived,
  setActiveRow,
  onSelectPart,
  generateProductVersionDetailPageUrlFromCurrentUrl
) => {
  const {
    primaryTextColor,
    secondaryTextColor,
    primaryBlueText,
    inverseSecondaryBgColor
  } = useThemeColor([
    'primaryTextColor',
    'secondaryTextColor',
    'primaryBlueText',
    'inverseSecondaryBgColor'
  ])
  const navigate = useNavigate()

  const [openPopoverId, setOpenPopoverId] = useState(null)
  const [openStatusId, setOpenStatusId] = useState(null)

  return useMemo(() => {
    const columns = [
      {
        id: 'NAME',
        name: 'NAME',
        selector: (row) => {
          const { part } = row
          const {
            primaryComponent,
            project,
            projectVersion,
            productLifeCycleStage
          } = part || {}
          const { projectGroup } = project || {}
          const { purl } = primaryComponent || {}
          const validPurl = isValidPurl(purl)
          const lifestage = String(productLifeCycleStage)?.replaceAll(/_/g, ' ')

          const link = generateProductVersionDetailPageUrlFromCurrentUrl({
            productgroupid: part.project.projectGroup.id,
            productid: part.project.id,
            sbomid: part.id,
            paramsObj: { parts: true }
          })

          const icon = validPurl ? (
            GetIcon(purl?.split('/')[0], colorMode)
          ) : (
            <LuCircleHelp size={24} color={inverseSecondaryBgColor} />
          )

          return (
            <Grid
              templateColumns='repeat(7, 1fr)'
              sx={{ my: 3, gap: 2, alignItems: 'center' }}
            >
              <GridItem colSpan={1} width={'50px'}>
                <IconButton
                  isRound={true}
                  variant='solid'
                  colorScheme='gray'
                  icon={icon}
                  cursor={'default'}
                />
              </GridItem>
              <GridItem colSpan={6}>
                <Stack spacing={1} direction='column'>
                  <Flex gap={2} alignItems={'center'} flexWrap={'wrap'}>
                    <Link to={link} replace>
                      <Text
                        data-testid={`sbom_part`}
                        sx={{ fontSize: 14, color: primaryBlueText }}
                        onClick={() => {
                          onSelectPart(part)
                          navigate(link)
                        }}
                      >
                        {truncatedValue(projectGroup?.name, 14)}
                      </Text>
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
                  </Flex>
                  <Text color={secondaryTextColor}>
                    {truncatedValue(projectVersion, 18)}
                  </Text>
                </Stack>
              </GridItem>
            </Grid>
          )
        },
        width: '20%',
        wrap: true
      },
      {
        id: 'COMPONENTS',
        name: 'COMPONENTS',
        selector: (row) => {
          const { part } = row
          const link = generateProductVersionDetailPageUrlFromCurrentUrl({
            productid: part?.project?.id,
            sbomid: part?.id,
            paramsObj: { tab: 'components', parts: true }
          })
          return (
            <Link
              to={link}
              onClick={() => {
                onSelectPart(part)
                navigate(link)
              }}
            >
              <Tag w={'50px'} colorScheme={'teal'}>
                <TagLabel mx={'auto'}>{part?.stats?.compCount}</TagLabel>
              </Tag>
            </Link>
          )
        }
      },
      {
        id: 'LICENSES',
        name: 'LICENSES',
        selector: (row) => {
          const { part } = row
          const link = generateProductVersionDetailPageUrlFromCurrentUrl({
            productid: part?.project?.id,
            sbomid: part?.id,
            paramsObj: { tab: 'licenses', parts: true }
          })
          return (
            <Link
              to={link}
              onClick={() => {
                onSelectPart(part)
                navigate(link)
              }}
            >
              <Tag w='50px ' colorScheme={'orange'}>
                <TagLabel mx={'auto'}>{part.stats.compLicenseCount}</TagLabel>
              </Tag>
            </Link>
          )
        }
      },
      {
        id: 'VULNERABILITIES',
        name: 'VULNERABILITIES',
        selector: (row) => {
          const { part } = row || {}
          const { id, project, stats, vulnRunStatus } = part || {}
          const { vulnStats } = stats || {}
          const notStarted = vulnRunStatus === 'NOT_STARTED'
          const { critical, high, ...rest } = vulnStats || {}
          const total = Object.values(rest).reduce(
            (sum, value) => sum + value,
            0
          )
          const link = generateProductVersionDetailPageUrlFromCurrentUrl({
            productgroupid: project?.projectGroup?.id,
            productid: project?.id,
            sbomid: id,
            paramsObj: { tab: 'vulnerabilities', parts: true }
          })

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
                <Text color={primaryTextColor}>+{total}</Text>
              )}
              {vulnRunStatus === 'FINISHED' && total !== 0 && (
                <Popover
                  placement='right'
                  closeOnBlur={false}
                  returnFocusOnClose={false}
                  isOpen={openPopoverId === part?.id}
                  onClose={() => setOpenPopoverId(null)}
                >
                  <PopoverTrigger>
                    <Tag
                      minW={'60px'}
                      colorScheme='gray'
                      onMouseEnter={() => setOpenPopoverId(part?.id)}
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
                      onMouseEnter={() => setOpenPopoverId(part?.id)}
                      onMouseLeave={() => setOpenPopoverId(null)}
                    >
                      <PopoverBody>
                        <SeverityInfo data={part} onClick={onFilterSev} />
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
      {
        id: 'STATUSES',
        name: 'STATUSES',
        selector: (row) => {
          const { part } = row
          const { vulnerabilityMetrics } = part || {}
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
                    <StatusInfo data={part} />
                  </PopoverBody>
                </PopoverContent>
              </Portal>
            </Popover>
          )
        }
      },
      {
        id: 'ACTION',
        name: 'ACTION',
        selector: (row) => {
          return (
            <Menu>
              <LynkAction data-testid='part-actions' />
              <Portal>
                <MenuList fontSize={'sm'}>
                  <MenuItem
                    data-testid='delete_part'
                    isDisabled={!updateSboms || signedUrlParams}
                    onClick={() => {
                      setActiveRow(row)
                      onDeleteOpen()
                    }}
                  >
                    Remove
                  </MenuItem>
                </MenuList>
              </Portal>
            </Menu>
          )
        },
        right: 'true',
        omit: isArchived
      }
    ]

    return columns
  }, [
    isArchived,
    generateProductVersionDetailPageUrlFromCurrentUrl,
    colorMode,
    inverseSecondaryBgColor,
    primaryBlueText,
    secondaryTextColor,
    onSelectPart,
    navigate,
    signedUrlParams,
    primaryTextColor,
    openPopoverId,
    onFilterSev,
    openStatusId,
    updateSboms,
    setActiveRow,
    onDeleteOpen
  ])
}

export default PartsColumns
