import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { GetIcon, isValidPurl } from 'utils'

import { Tag, TagLabel } from '@chakra-ui/react'
import { IconButton, Link, Portal, Stack, Text } from '@chakra-ui/react'
import { Grid, GridItem, SimpleGrid } from '@chakra-ui/react'
import { Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react'

import VulnBadge from 'components/Misc/VulnBadge'

import { useThemeColor } from 'hooks/useThemeColors'

import { BsFillPatchQuestionFill } from 'react-icons/bs'
import { FaEllipsisV } from 'react-icons/fa'

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
    primaryBlueText,
    secondaryTextColor,
    inverseSecondaryBgColor
  } = useThemeColor([
    'primaryTextColor',
    'primaryBlueText',
    'secondaryTextColor',
    'inverseSecondaryBgColor'
  ])
  const navigate = useNavigate()

  return useMemo(() => {
    const columns = [
      {
        id: 'NAME',
        name: 'NAME',
        selector: (row) => {
          const { part } = row
          const { primaryComponent, projectVersion, suppliers } = part || ''
          const { purl } = primaryComponent || ''
          const validPurl = isValidPurl(purl)

          const link = generateProductVersionDetailPageUrlFromCurrentUrl({
            productgroupid: part.project.projectGroup.id,
            productid: part.project.id,
            sbomid: part.id,
            paramsObj: { parts: true }
          })

          const icon = validPurl ? (
            GetIcon(purl?.split('/')[0], colorMode)
          ) : (
            <BsFillPatchQuestionFill
              fontSize={24}
              color={inverseSecondaryBgColor}
            />
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
                />
              </GridItem>
              <GridItem colSpan={6}>
                <Stack spacing={1} direction='column'>
                  <Link to={link} replace>
                    <Text
                      data-testid={`sbom_part`}
                      sx={{ fontSize: 14, color: primaryBlueText }}
                      onClick={() => {
                        onSelectPart(part)
                        navigate(link)
                      }}
                    >
                      {part?.project?.projectGroup?.name}
                    </Text>
                  </Link>
                  <Text color={primaryTextColor}>{projectVersion}</Text>
                  {suppliers?.map((item, index) => (
                    <Text key={index} color={primaryTextColor}>
                      {item?.name}
                    </Text>
                  ))}
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
              <Tag
                size='md'
                variant='subtle'
                colorScheme={'blue'}
                sx={{ w: 16, cursor: 'pointer' }}
              >
                <TagLabel mx={'auto'}>{part.stats.compCount}</TagLabel>
              </Tag>
            </Link>
          )
        },
        width: '11%'
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
              <Tag size='md' variant='subtle' width={16} colorScheme={'blue'}>
                <TagLabel mx={'auto'}>{part.stats.compLicenseCount}</TagLabel>
              </Tag>
            </Link>
          )
        },
        width: '8%'
      },
      {
        id: 'VULNERABILITIES',
        name: 'VULNERABILITIES',
        selector: (row) => {
          const { part, vulnRunStatus } = row
          const link = generateProductVersionDetailPageUrlFromCurrentUrl({
            productgroupid: part?.project?.projectGroup?.id,
            productid: part?.project?.id,
            sbomid: part?.id,
            paramsObj: { tab: 'vulnerabilities', parts: true }
          })
          return (
            <SimpleGrid gap={1} width={'100%'} columns={5}>
              <Link
                to={link}
                onClick={() => {
                  onFilterSev(part, ['critical'])
                  navigate(link)
                }}
              >
                <VulnBadge color='red' label='Critical' status={vulnRunStatus}>
                  {part?.stats?.vulnStats?.critical || 0}
                </VulnBadge>
              </Link>
              <Link
                to={link}
                onClick={() => {
                  onFilterSev(part, ['high'])
                  navigate(link)
                }}
              >
                <VulnBadge color='orange' label='High' status={vulnRunStatus}>
                  {part?.stats?.vulnStats?.high || 0}
                </VulnBadge>
              </Link>
              <Link
                to={link}
                onClick={() => {
                  onFilterSev(part, ['medium'])
                  navigate(link)
                }}
              >
                <VulnBadge color='yellow' label='Medium' status={vulnRunStatus}>
                  {part?.stats?.vulnStats?.medium || 0}
                </VulnBadge>
              </Link>
              <Link
                to={link}
                onClick={() => {
                  onFilterSev(part, ['low'])
                  navigate(link)
                }}
              >
                <VulnBadge color='green' label='Low' status={vulnRunStatus}>
                  {part?.stats?.vulnStats?.low || 0}
                </VulnBadge>
              </Link>
              <Link
                to={link}
                onClick={() => {
                  onFilterSev(part, ['unknown'])
                  navigate(link)
                }}
              >
                <VulnBadge color='gray' label='Unknown' status={vulnRunStatus}>
                  {part?.stats?.vulnStats?.unknown || 0}
                </VulnBadge>
              </Link>
            </SimpleGrid>
          )
        },
        width: '26.8%'
      },
      {
        id: 'STATUS',
        name: 'STATUS',
        selector: (row) => {
          const { part } = row
          return (
            <Tag width={24} colorScheme='cyan' textTransform={'capitalize'}>
              <TagLabel mx={'auto'}>{part.lifecycle}</TagLabel>
            </Tag>
          )
        }
      },
      {
        id: 'ACTION',
        name: 'ACTION',
        selector: (row) => {
          return (
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<FaEllipsisV />}
                variant='none'
                data-testid='part-actions'
                color={secondaryTextColor}
              />
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
    onFilterSev,
    colorMode,
    inverseSecondaryBgColor,
    primaryTextColor,
    primaryBlueText,
    secondaryTextColor,
    updateSboms,
    signedUrlParams,
    onDeleteOpen,
    isArchived,
    setActiveRow,
    generateProductVersionDetailPageUrlFromCurrentUrl,
    onSelectPart,
    navigate
  ])
}

export default PartsColumns
