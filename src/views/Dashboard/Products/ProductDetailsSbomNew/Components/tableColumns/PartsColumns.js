import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { isValidPurl } from 'utils'
import { GetIcon } from 'utils/styleUtils'

import { Flex, Tag, TagLabel } from '@chakra-ui/react'
import { IconButton, Link, Portal, Stack, Text } from '@chakra-ui/react'
import { Grid, GridItem } from '@chakra-ui/react'
import { Menu, MenuItem, MenuList } from '@chakra-ui/react'

import LynkAction from 'components/Misc/LynkAction'
import VulnBadge from 'components/Misc/VulnBadge'

import { useThemeColor } from 'hooks/useThemeColors'

import { BsFillPatchQuestionFill } from 'react-icons/bs'

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
  const { primaryTextColor, primaryBlueText, inverseSecondaryBgColor } =
    useThemeColor([
      'primaryTextColor',
      'primaryBlueText',
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
                  cursor={'default'}
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
                    <Text hidden key={index} color={primaryTextColor}>
                      {item?.name}
                    </Text>
                  ))}
                </Stack>
              </GridItem>
            </Grid>
          )
        },
        width: '25%',
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
        width: '10%'
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
        width: '10%'
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
            <Flex gap={1} flexWrap={'wrap'} my={4}>
              <VulnBadge
                color='red'
                label='Critical'
                status={vulnRunStatus}
                onClick={() => onFilterSev(part, ['critical'], link)}
              >
                {part?.stats?.vulnStats?.critical || 0}
              </VulnBadge>
              <VulnBadge
                color='orange'
                label='High'
                status={vulnRunStatus}
                onClick={() => onFilterSev(part, ['high'], link)}
              >
                {part?.stats?.vulnStats?.high || 0}
              </VulnBadge>
              <VulnBadge
                color='yellow'
                label='Medium'
                status={vulnRunStatus}
                onClick={() => onFilterSev(part, ['medium'], link)}
              >
                {part?.stats?.vulnStats?.medium || 0}
              </VulnBadge>
              <VulnBadge
                color='green'
                label='Low'
                status={vulnRunStatus}
                onClick={() => onFilterSev(part, ['low'], link)}
              >
                {part?.stats?.vulnStats?.low || 0}
              </VulnBadge>
              <VulnBadge
                color='gray'
                label='Unknown'
                status={vulnRunStatus}
                onClick={() => onFilterSev(part, ['unknown'], link)}
              >
                {part?.stats?.vulnStats?.unknown || 0}
              </VulnBadge>
            </Flex>
          )
        },
        width: '28%'
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
        },
        width: '10%'
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
    onFilterSev,
    colorMode,
    inverseSecondaryBgColor,
    primaryTextColor,
    primaryBlueText,
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
