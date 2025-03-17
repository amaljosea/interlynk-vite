import { useMemo } from 'react'
import { getFullDate, setIntensity, timeSince } from 'utils'

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
        width: '22%',
        selector: (row) => {
          const { name } = row || {}
          return (
            <Text my={3} color={primaryTextColor} data-tag='allowRowEvents'>
              {name}
            </Text>
          )
        }
      },
      {
        id: 'COMPONENTS_VERSION',
        name: 'VERSION',
        sortable: true,
        wrap: true,
        selector: (row) => {
          const { version } = row || {}
          return (
            <Text my={3} color={primaryTextColor}>
              {version}
            </Text>
          )
        }
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
        id: 'COMPONENT_SUPPORT_LEVELS_LEVEL',
        name: 'SUPPORT LEVEL',
        sortable: true,
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
        id: 'COMPONENT_SUPPORT_LEVELS_END_DATE',
        name: 'END OF SUPPORT',
        sortable: true,
        wrap: true,
        right: 'true',
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
        },
        sortFunction: (a, b) => {
          const dateA = new Date(a?.componentSupportLevel?.endDate)
          const dateB = new Date(b?.componentSupportLevel?.endDate)
          return dateA - dateB
        }
      },
      {
        id: 'COMPONENT_SUPPORT_LEVELS_UPDATED_AT',
        name: 'UPDATED',
        selector: (row) => {
          const { componentSupportLevel } = row || {}

          if (!componentSupportLevel)
            return <Text color={primaryTextColor}>N/A</Text>

          return (
            <Tooltip
              placement={'top'}
              label={getFullDate(componentSupportLevel?.updatedAt)}
            >
              <Text color={primaryTextColor}>
                {timeSince(componentSupportLevel?.updatedAt)}
              </Text>
            </Tooltip>
          )
        },
        sortable: true,
        sortFunction: (a, b) => {
          const dateA = new Date(a?.componentSupportLevel?.updatedAt)
          const dateB = new Date(b?.componentSupportLevel?.updatedAt)
          return dateB - dateA
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
