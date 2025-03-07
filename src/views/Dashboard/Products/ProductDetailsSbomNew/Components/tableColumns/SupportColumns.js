import { useMemo } from 'react'
import { getFullDate, timeSince } from 'utils'
import { setIntensity } from 'utils'

import { IconButton, Portal, Text, Tooltip } from '@chakra-ui/react'
import { Tag, TagLabel } from '@chakra-ui/react'
import { Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useHasPermission } from 'hooks/useHasPermission'
import { useThemeColor } from 'hooks/useThemeColors'

import { FaEllipsisV } from 'react-icons/fa'

const SupportColumns = ({ handleSupport }) => {
  const { isFreeTier } = useGlobalQueryContext()

  const { primaryTextColor, secondaryTextColor } = useThemeColor([
    'primaryTextColor',
    'secondaryTextColor'
  ])

  const updateComponent = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'update_sbom_components'
  })

  return useMemo(() => {
    const columns = [
      {
        id: 'COMPONENTS_NAME',
        name: 'NAME',
        sortable: true,
        wrap: true,
        selector: (row) => {
          return (
            <Text my={4} color={primaryTextColor} data-tag='allowRowEvents'>
              {row?.name}
            </Text>
          )
        }
      },
      {
        id: 'COMPONENTS_VERSION',
        name: 'VERSION',
        sortable: true,
        wrap: true,
        selector: (row) => (
          <Text my={4} color={primaryTextColor}>
            {row?.version}
          </Text>
        )
      },
      {
        id: 'SUPPORT_ASSESSMENT',
        name: 'ASSESSMENT',
        wrap: true,
        selector: (row) => {
          const { user } = row?.componentSupportLevel || {}
          return (
            <Text color={primaryTextColor}>
              {user?.name ? 'Manual' : 'Automatic'}
            </Text>
          )
        }
      },
      {
        id: 'SUPPORT_LEVEL',
        name: 'SUPPORT LEVEL',
        wrap: true,
        selector: (row) => {
          const { level } = row?.componentSupportLevel || {}
          if (level) {
            return (
              <Tag w={'184px'} colorScheme={setIntensity(level)}>
                <TagLabel mx={'auto'} textTransform={'capitalize'}>
                  {level?.replaceAll('_', ' ')}
                </TagLabel>
              </Tag>
            )
          }
          return (
            <Tag w={'184px'}>
              <TagLabel mx={'auto'}>N/A</TagLabel>
            </Tag>
          )
        }
      },
      {
        id: 'END_OF_SUPPORT',
        name: 'END OF SUPPORT',
        wrap: true,
        selector: (row) => {
          const { endDate } = row?.componentSupportLevel || {}
          if (endDate) {
            return (
              <Text color={primaryTextColor}>
                {new Date(endDate).toLocaleDateString()}
              </Text>
            )
          }
          return <Text color={primaryTextColor}>N/A</Text>
        }
      },
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
        right: 'true',
        wrap: true
      },
      // ACTIONS
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
                color={secondaryTextColor}
                data-testid='support-actions'
              />
              <Portal>
                <MenuList fontSize={'sm'}>
                  <MenuItem
                    hidden={isFreeTier}
                    isDisabled={!updateComponent}
                    onClick={() => handleSupport(row)}
                    data-testid='edit_component_support'
                  >
                    Edit Support Status
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
    handleSupport,
    isFreeTier,
    primaryTextColor,
    secondaryTextColor,
    updateComponent
  ])
}

export default SupportColumns
