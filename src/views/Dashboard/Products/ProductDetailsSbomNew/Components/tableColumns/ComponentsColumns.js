import { useMemo } from 'react'
import { isValidPurl, truncatedValue } from 'utils'
import { parseLicenseString, timeSince } from 'utils'
import { getFullDate, isCustomerView } from 'utils'
import { GetIcon } from 'utils/styleUtils'

import { ViewIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Divider,
  Flex,
  IconButton,
  Portal,
  Stack,
  Text,
  Tooltip
} from '@chakra-ui/react'
import { Tag, TagLabel } from '@chakra-ui/react'
import { Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react'

import { HealthScore } from 'components/HealthScore'
import ExternalLink from 'components/Misc/ExternalLink'

import { useThemeColor } from 'hooks/useThemeColors'

import { BsFillPatchQuestionFill } from 'react-icons/bs'
import { FaEllipsisV, FaGlobe, FaLightbulb, FaSitemap } from 'react-icons/fa'
import { FaHouseUser, FaListCheck } from 'react-icons/fa6'

const ComponentsColumns = ({
  onOpen = () => {},
  colorMode,
  isFreeTier,
  sbomId,
  onEditOpen,
  updateComponent,
  handleGraphView,
  totalComp,
  hanldeAnalysis,
  handleNotes,
  setActiveRow,
  onCheckCpe,
  onCheckPurl,
  DELETE,
  isArchived,
  handleVuln
}) => {
  const {
    primaryTextColor,
    inverseSecondaryBgColor,
    primaryBlueText,
    secondaryTextColor,
    primaryErrorColor
  } = useThemeColor([
    'primaryTextColor',
    'inverseSecondaryBgColor',
    'primaryBlueText',
    'secondaryTextColor',
    'primaryErrorColor'
  ])

  const customerView = isCustomerView()

  return useMemo(() => {
    const columns = [
      // COMPONENT
      {
        id: 'COMPONENTS_NAME',
        name: 'NAME',
        selector: (row) => {
          const { purl, name, primary, internal, sbomId: bomId, sbom } = row
          const { latestPackageVersion, packageVersion } =
            row?.enrichedContent || ''
          const isOutdated =
            latestPackageVersion?.version !== packageVersion?.version
          const { projectVersion, project } = sbom || ''
          const { projectGroup } = project || ''
          const isPart = sbomId !== bomId
          const isVulnerable = row?.vulns?.totalCount > 0
          const validPurl = isValidPurl(purl)
          const icon = validPurl ? (
            GetIcon(purl?.split('/')[0], colorMode)
          ) : (
            <BsFillPatchQuestionFill
              fontSize={24}
              color={inverseSecondaryBgColor}
            />
          )
          const tagStyle = {
            size: 'sm',
            variant: 'subtle',
            width: 'fit-content'
          }
          return (
            <Flex sx={{ alignItems: 'center', gap: 2, my: 3 }}>
              <Box width={'50px'}>
                <IconButton icon={icon} isRound={true} variant='solid' />
              </Box>
              <Flex
                flexDirection={'column'}
                sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}
              >
                {/* COMPONENT NAME */}
                <Tooltip label={name}>
                  <Text
                    color={primaryTextColor}
                    aria-label='component_name'
                    data-tag='allowRowEvents'
                  >
                    {truncatedValue(name, 30)}
                  </Text>
                </Tooltip>
                {bomId && isPart && (
                  <Text
                    fontSize={12}
                    w='fit-content'
                    fontWeight={'medium'}
                    color={primaryTextColor}
                  >
                    {projectGroup?.name}{' '}
                    {projectVersion ? `: ${projectVersion}` : ''}
                  </Text>
                )}
                <Flex gap={1} flexWrap={'wrap'} alignItems={'center'}>
                  {isVulnerable && (
                    <Tag {...tagStyle} colorScheme='red'>
                      <TagLabel>Vulnerable</TagLabel>
                    </Tag>
                  )}
                  {isOutdated && (
                    <Tag {...tagStyle} colorScheme='teal'>
                      <TagLabel>Outdated</TagLabel>
                    </Tag>
                  )}
                  {latestPackageVersion?.isDeprecated === true && (
                    <Tag {...tagStyle} colorScheme='orange'>
                      <TagLabel>Deprecated</TagLabel>
                    </Tag>
                  )}
                  {primary && (
                    <Tag {...tagStyle} colorScheme='blue'>
                      <TagLabel>Primary</TagLabel>
                    </Tag>
                  )}
                  {internal && (
                    <Tag {...tagStyle} colorScheme='cyan'>
                      <TagLabel>Internal</TagLabel>
                    </Tag>
                  )}
                </Flex>
              </Flex>
            </Flex>
          )
        },
        width: customerView ? '30%' : '25%',
        wrap: true,
        sortable: true
      },
      // VERSION
      {
        id: 'COMPONENTS_VERSION',
        name: 'VERSION',
        selector: (row) => <Text color={primaryTextColor}>{row?.version}</Text>,
        wrap: true,
        width: customerView ? '12%' : '10%',
        sortable: true
      },
      // COMPONENT HEALTH
      {
        id: 'COMPONENTS_HEALTH',
        name: 'HEALTH',
        selector: (row) => {
          const { healthScore } = row
          return <HealthScore isComponent value={healthScore} />
        },
        width: '10%',
        omit: isFreeTier || customerView
      },
      // IDENTIFIERS
      {
        id: 'IDENTIFIERS',
        name: 'IDENTIFIERS',
        selector: (row) => {
          const { purl, cpes } = row
          return (
            <Flex gap={2}>
              {cpes?.length > 0 && (
                <Tooltip label={cpes[0]}>
                  <Button
                    size='xs'
                    color={primaryTextColor}
                    onClick={() => onCheckCpe(row)}
                  >
                    CPE
                  </Button>
                </Tooltip>
              )}
              {purl && (
                <Tooltip label={purl}>
                  <Button
                    size='xs'
                    color={primaryTextColor}
                    onClick={() => onCheckPurl(row)}
                  >
                    PURL
                  </Button>
                </Tooltip>
              )}
            </Flex>
          )
        },
        width: '12%',
        wrap: true
      },
      // LICENSES
      {
        id: 'COMPONENTS_LICENSES_EXP',
        name: 'LICENSES',
        selector: (row) => {
          const { licenses, licensesExp, licensesCustom } = row
          const totalSpdx = licenses?.length > 1 && licenses.slice(1)
          const totalCustom =
            licensesCustom?.length > 1 && licensesCustom.slice(1)
          return (
            <Flex
              justifyContent={'flex-end'}
              sx={{ my: 2, gap: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}
            >
              {/* SPDX */}
              {licenses && (
                <Stack direction={'row'} spacing={2}>
                  {licenses.length > 0 && (
                    <Tooltip label={licenses[0]} placement={'top'}>
                      <Tag
                        width={'150px'}
                        size={'md'}
                        variant='subtle'
                        colorScheme='green'
                      >
                        <TagLabel mx={'auto'}>{licenses[0]}</TagLabel>
                      </Tag>
                    </Tooltip>
                  )}
                  {totalSpdx.length > 0 && (
                    <Tooltip
                      label={JSON.stringify(totalSpdx)
                        .slice(1, -1)
                        .replace(/"/g, '')}
                      placement={'top'}
                    >
                      <Tag
                        width={'150px'}
                        size={'md'}
                        variant='subtle'
                        colorScheme='green'
                      >
                        <TagLabel
                          mx={'auto'}
                        >{`+${totalSpdx.length}`}</TagLabel>
                      </Tag>
                    </Tooltip>
                  )}
                </Stack>
              )}
              {/* EXPRESSION */}
              {licensesExp && licensesExp !== '' && (
                <Tooltip label={licensesExp} placement={'top'}>
                  <Tag
                    width={'150px'}
                    size={'md'}
                    variant='subtle'
                    colorScheme='green'
                  >
                    <TagLabel mx={'auto'}>
                      {parseLicenseString(licensesExp)}
                    </TagLabel>
                  </Tag>
                </Tooltip>
              )}
              {/* CUSTOM */}
              {licensesCustom && (
                <Stack direction={'row'} spacing={2}>
                  {licensesCustom.length > 0 && (
                    <Tooltip label={licensesCustom[0]} placement={'top'}>
                      <Tag
                        width={'150px'}
                        size={'md'}
                        variant='subtle'
                        colorScheme='green'
                      >
                        <TagLabel mx={'auto'}>{licensesCustom[0]}</TagLabel>
                      </Tag>
                    </Tooltip>
                  )}
                  {totalCustom && (
                    <Tooltip
                      label={JSON.stringify(totalCustom)
                        .slice(1, -1)
                        .replace(/"/g, '')}
                      placement={'top'}
                    >
                      <Tag
                        width={'150px'}
                        size={'md'}
                        variant='subtle'
                        colorScheme='green'
                      >
                        <TagLabel
                          mx={'auto'}
                        >{`+${totalCustom.length}`}</TagLabel>
                      </Tag>
                    </Tooltip>
                  )}
                </Stack>
              )}
            </Flex>
          )
        },
        width: '13%',
        sortable: true,
        wrap: true
      },
      // UPDATED AT
      {
        id: 'COMPONENTS_UPDATED_AT',
        name: 'UPDATED',
        selector: (row) => (
          <Tooltip label={getFullDate(row.updatedAt)} placement={'top'}>
            <Text color={primaryTextColor}>{timeSince(row.updatedAt)}</Text>
          </Tooltip>
        ),
        sortable: true,
        sortFunction: (a, b) => {
          const dateA = new Date(a.updatedAt)
          const dateB = new Date(b.updatedAt)
          return dateA - dateB // Sort in descending order
        },
        width: '12%',
        wrap: true
      },
      // ACTION
      {
        id: 'action',
        name: 'ACTION',
        selector: (row) => {
          const { status, primary, externalUrls } = row
          const website = externalUrls?.find((item) => item.name === 'website')
          const distribution = externalUrls?.find(
            (item) => item.name === 'distribution'
          )
          const issueTracker = externalUrls?.find(
            (item) => item.name === 'issue-tracker'
          )
          const vcs = externalUrls?.find((item) => item.name === 'vcs')
          const onCheck = (item) => (item ? primaryBlueText : primaryTextColor)

          return (
            <Stack direction={'row'} alignItems={'center'}>
              {/* WEBSITE */}
              <ExternalLink
                link={website}
                icon={<FaGlobe color={onCheck(website)} fontSize={16} />}
              />
              {/* DISTRIBUTION */}
              <ExternalLink
                link={vcs}
                icon={<FaSitemap color={onCheck(vcs)} fontSize={16} />}
              />
              {/* ADVISORIES */}
              <ExternalLink
                link={issueTracker}
                icon={
                  customerView ? (
                    <FaHouseUser color={onCheck(issueTracker)} fontSize={16} />
                  ) : (
                    <FaListCheck color={onCheck(issueTracker)} fontSize={16} />
                  )
                }
              />
              {/* SUPPORT */}
              <ExternalLink
                link={distribution}
                icon={
                  <FaLightbulb color={onCheck(distribution)} fontSize={16} />
                }
              />
              {!customerView ? (
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<FaEllipsisV />}
                    variant='none'
                    color={secondaryTextColor}
                    data-testid='component-actions'
                  />
                  <Portal>
                    <MenuList fontSize={'sm'}>
                      <MenuItem
                        data-testid='edit_component'
                        onClick={() => onEditOpen(row)}
                        isDisabled={status === 'signed' || !updateComponent}
                      >
                        Edit Component
                      </MenuItem>
                      <MenuItem
                        hidden={isFreeTier}
                        data-testid='view_notes'
                        onClick={() => handleNotes(row)}
                        isDisabled={status === 'signed' || !updateComponent}
                      >
                        Edit Notes
                      </MenuItem>
                      <MenuItem
                        data-testid='view_component_vulns'
                        onClick={() => handleVuln(row)}
                        isDisabled={status === 'signed'}
                        hidden={isFreeTier}
                      >
                        View Vulnerabilities
                      </MenuItem>
                      <MenuItem
                        data-testid='view_insights'
                        onClick={() => hanldeAnalysis(row)}
                        isDisabled={status === 'signed'}
                        hidden={isFreeTier}
                      >
                        View Insights
                      </MenuItem>
                      <MenuItem
                        data-testid='view_relation'
                        onClick={() => handleGraphView(row)}
                        isDisabled={
                          status === 'signed' ||
                          !updateComponent ||
                          totalComp?.length === 1
                        }
                      >
                        View Relationships
                      </MenuItem>
                      <Divider />
                      {primary === false && (
                        <MenuItem
                          color={primaryErrorColor}
                          onClick={() => {
                            setActiveRow(row)
                            DELETE.onOpen()
                          }}
                          isDisabled={
                            status === 'signed' ||
                            !updateComponent ||
                            totalComp?.length === 1
                          }
                          data-testid='delete_component'
                        >
                          Delete
                        </MenuItem>
                      )}
                    </MenuList>
                  </Portal>
                </Menu>
              ) : (
                <IconButton
                  size='sm'
                  sx={{ ml: 2, color: primaryTextColor }}
                  icon={<ViewIcon />}
                  onClick={() => {
                    setActiveRow(row)
                    onOpen()
                  }}
                />
              )}
            </Stack>
          )
        },
        wrap: true,
        right: 'true',
        omit: isArchived
      }
    ]

    return columns
  }, [
    customerView,
    isFreeTier,
    isArchived,
    sbomId,
    colorMode,
    inverseSecondaryBgColor,
    primaryTextColor,
    onCheckCpe,
    onCheckPurl,
    secondaryTextColor,
    updateComponent,
    totalComp?.length,
    primaryErrorColor,
    primaryBlueText,
    onEditOpen,
    hanldeAnalysis,
    handleNotes,
    handleVuln,
    handleGraphView,
    setActiveRow,
    DELETE,
    onOpen
  ])
}

export default ComponentsColumns
