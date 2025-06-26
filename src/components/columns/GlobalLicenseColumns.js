import { useMemo } from 'react'
import { parseLicenseString, truncatedValue } from 'utils'

import {
  Flex,
  Grid,
  GridItem,
  IconButton,
  Menu,
  MenuItem,
  MenuList,
  Portal,
  Tag,
  TagLabel,
  Text,
  Tooltip
} from '@chakra-ui/react'

import ExternalNavIcon from 'components/Icons/ExternalNavIcon'
import LynkAction from 'components/Misc/LynkAction'

import { useHasPermission } from 'hooks/useHasPermission'
import { useThemeColor } from 'hooks/useThemeColors'

import { LuScale } from 'react-icons/lu'

const GlobalLicenseColumns = ({ action }) => {
  const { primaryTextColor } = useThemeColor(['primaryTextColor'])

  const updateLic = useHasPermission({
    parentKey: 'view_licenses',
    childKey: 'edit_licenses'
  })

  return useMemo(() => {
    const columns = [
      // NAME
      {
        id: 'ORGANIZATION_LICENSES_UPDATED_AT',
        name: 'NAME',
        width: '35%',
        wrap: true,
        selector: ({ content: { name, shortId, url, spdxId, __typename } }) => {
          const displayName =
            __typename === 'LicenseCustom' ? parseLicenseString(name) : name

          const tagValue =
            __typename === 'LicenseCustom'
              ? parseLicenseString(shortId || spdxId)
              : shortId || spdxId

          return (
            <Grid templateColumns='repeat(12, 1fr)' gap={2} my={3}>
              <GridItem colSpan={1} width={'50px'}>
                <IconButton
                  isRound={true}
                  variant='solid'
                  colorScheme='gray'
                  icon={<LuScale color={primaryTextColor} fontSize={18} />}
                />
              </GridItem>
              <GridItem
                colSpan={11}
                display={'flex'}
                flexWrap={'wrap'}
                flexDirection={'column'}
                gap={2}
              >
                <Text
                  fontSize={14}
                  wordBreak={'break-all'}
                  color={primaryTextColor}
                  data-tag='allowRowEvents'
                  data-testid={`license_${name}`}
                >
                  {displayName}
                </Text>
                <Flex flexWrap={'wrap'} gap={2} alignItems={'center'}>
                  {tagValue && (
                    <Tooltip label={shortId || spdxId}>
                      <Tag
                        width={'fit-content'}
                        size='sm'
                        variant='subtle'
                        colorScheme='blue'
                      >
                        <TagLabel>{truncatedValue(tagValue, 45)}</TagLabel>
                      </Tag>
                    </Tooltip>
                  )}
                  {url && (
                    <ExternalNavIcon
                      href={shortId ? url.replace('.json', '.html') : url}
                    />
                  )}
                </Flex>
              </GridItem>
            </Grid>
          )
        },
        sortable: true,
        sortFunction: (a, b) => {
          const dateA = new Date(a.updatedAt)
          const dateB = new Date(b.updatedAt)
          return dateA - dateB
        }
      },
      // ATTRIBUTION
      {
        id: 'ATTRIBUTION',
        name: 'ATTRIBUTION',
        width: '11%',
        wrap: true,
        selector: ({ attribution }) => {
          if (!attribution || attribution === 'UNKNOWN') {
            attribution = 'Not Available'
          }
          return (
            <Text
              fontSize={14}
              color={primaryTextColor}
              textTransform='capitalize'
            >
              {attribution.toLowerCase()}
            </Text>
          )
        }
      },
      // COPYLEFT
      {
        id: 'COPYLEFT',
        name: 'COPYLEFT',
        width: '11%',
        wrap: true,
        selector: ({ copyLeft }) => {
          if (!copyLeft || copyLeft === 'UNKNOWN') {
            copyLeft = 'Not Available'
          }
          return (
            <Text
              fontSize={14}
              color={primaryTextColor}
              textTransform='capitalize'
            >
              {copyLeft.toLowerCase()}
            </Text>
          )
        }
      },
      // REQUIRES SOURCE CODE
      {
        id: 'REQUIRES SOURCE CODE',
        name: 'REQUIRES SOURCE CODE',
        width: '11%',
        wrap: true,
        selector: ({ sourceDistribution }) => {
          if (!sourceDistribution || sourceDistribution === 'UNKNOWN') {
            sourceDistribution = 'Not Available'
          }
          return (
            <Text
              fontSize={14}
              color={primaryTextColor}
              textTransform='capitalize'
            >
              {sourceDistribution.toLowerCase()}
            </Text>
          )
        }
      },
      {
        id: 'PERMITS MODIFICATIONS',
        name: 'PERMITS MODIFICATIONS',
        width: '11%',
        wrap: true,
        selector: ({ modifications }) => {
          if (!modifications || modifications === 'UNKNOWN') {
            modifications = 'Not Available'
          }
          return (
            <Text
              fontSize={14}
              color={primaryTextColor}
              textTransform='capitalize'
            >
              {modifications.toLowerCase()}
            </Text>
          )
        }
      },
      // STATUS
      {
        id: 'STATUS',
        name: 'STATUS',
        width: '12%',
        wrap: true,
        sortable: true,
        selector: ({ state }) => {
          state = state?.toLowerCase() || 'Not Available'
          return (
            <Tag
              size='md'
              variant='subtle'
              colorScheme={
                state === 'approved'
                  ? 'green'
                  : state === 'rejected'
                    ? 'red'
                    : state === 'unspecified'
                      ? 'orange'
                      : 'blue'
              }
              width={'110px'}
            >
              <TagLabel mx={'auto'} textTransform={'capitalize'}>
                {state}
              </TagLabel>
            </Tag>
          )
        }
      },
      // ACTIONS
      {
        id: 'actions',
        name: 'ACTIONS',
        width: '8%',
        selector: (row) => {
          return (
            <Menu>
              <LynkAction
                data-testid='license_actions'
                aria-label={`license action ${row?.content?.name}`}
              />
              <Portal>
                <MenuList fontSize={'sm'}>
                  {/* Edit License */}
                  <MenuItem
                    data-testid='edit_license'
                    onClick={() => action('edit_license', row)}
                    aria-label={`license edit ${row?.content?.name}`}
                  >
                    {!updateLic ? 'View' : 'Edit'} License
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
  }, [action, primaryTextColor, updateLic])
}

export default GlobalLicenseColumns
