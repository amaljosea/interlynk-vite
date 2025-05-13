import { useMemo } from 'react'
import { getFullDate, setIntensity, timeSince } from 'utils'

import {
  Flex,
  IconButton,
  Portal,
  Stack,
  Text,
  Tooltip,
  chakra
} from '@chakra-ui/react'
import { Tag, TagLabel } from '@chakra-ui/react'
import { Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react'

import LynkBadge from 'components/LynkBadge'
import PartInfo from 'components/Misc/PartInfo'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useHasPermission } from 'hooks/useHasPermission'
import { useThemeColor } from 'hooks/useThemeColors'

import { FaEllipsisV } from 'react-icons/fa'
import { LuEllipsisVertical } from 'react-icons/lu'

const SupportColumns = ({ action }) => {
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
        id: 'COMPONENT_SUPPORT_LEVELS_UPDATED_AT',
        name: 'NAME',
        sortable: true,
        wrap: true,
        width: '22%',
        selector: (row) => {
          const { occurrences } = row || {}
          const { name, isPart, componentSupportLevel } = occurrences[0] || {}

          return (
            <Stack my={3} spacing={1}>
              <Text color={primaryTextColor}>{name}</Text>
              <Flex gap={2} alignItems={'center'} flexWrap={'wrap'}>
                {isPart && (
                  <Tooltip label={<PartInfo data={occurrences} />}>
                    <chakra.span>
                      <LynkBadge color='blue' title='Part' />
                    </chakra.span>
                  </Tooltip>
                )}
                <Text
                  color={secondaryTextColor}
                  hidden={!isPart || !componentSupportLevel?.updatedAt}
                >
                  •
                </Text>
                {componentSupportLevel?.updatedAt && (
                  <Tooltip
                    placement={'top'}
                    label={getFullDate(componentSupportLevel?.updatedAt)}
                  >
                    <Text color={secondaryTextColor}>
                      {timeSince(componentSupportLevel?.updatedAt)}
                    </Text>
                  </Tooltip>
                )}
              </Flex>
            </Stack>
          )
        },
        sortFunction: (a, b) => {
          const dateA = new Date(a[0]?.componentSupportLevel?.updatedAt)
          const dateB = new Date(b[0]?.componentSupportLevel?.updatedAt)
          return dateA - dateB
        }
      },
      {
        id: 'SUPPORT_ASSESSMENT',
        name: 'ASSESSMENT',
        wrap: true,
        selector: (row) => {
          const { occurrences } = row || {}
          const { componentSupportLevel } = occurrences[0] || {}
          return (
            <Text color={primaryTextColor}>
              {componentSupportLevel?.user ? 'Manual' : 'Automatic'}
            </Text>
          )
        }
      },
      {
        id: 'COMPONENT_SUPPORT_LEVELS_LEVEL',
        name: 'LEVEL',
        sortable: true,
        width: '18%',
        selector: (row) => {
          const { occurrences } = row || {}
          const { componentSupportLevel } = occurrences[0] || {}
          const { level } = componentSupportLevel || {}
          const supportLevel = level ? level?.replaceAll('_', ' ') : 'N/A'

          if (supportLevel) {
            return (
              <Flex gap={2} alignItems={'center'}>
                <Tag w={'184px'} colorScheme={setIntensity(level)}>
                  <TagLabel mx={'auto'} textTransform={'capitalize'}>
                    {supportLevel?.replaceAll('_', ' ')}{' '}
                  </TagLabel>
                </Tag>
                {occurrences?.length > 1 && (
                  <Text color={primaryTextColor}>+{occurrences?.length}</Text>
                )}
              </Flex>
            )
          }
          return (
            <Tag>
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
        width: '14%',
        selector: (row) => {
          const { occurrences } = row || {}
          const { componentSupportLevel } = occurrences[0] || {}
          const { endDate } = componentSupportLevel || {}
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
      // ACTIONS
      {
        id: 'ACTION',
        name: 'ACTION',
        selector: (row) => {
          return (
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<LuEllipsisVertical size={20} />}
                variant='none'
                color={secondaryTextColor}
                data-testid='support-actions'
              />
              <Portal>
                <MenuList fontSize={'sm'}>
                  <MenuItem
                    hidden={isFreeTier}
                    isDisabled={!updateComponent}
                    data-testid='edit_component_support'
                    onClick={() => action('view_support_drawer', row)}
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
    action,
    isFreeTier,
    primaryTextColor,
    secondaryTextColor,
    updateComponent
  ])
}

export default SupportColumns
