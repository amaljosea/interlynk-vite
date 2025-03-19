import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { getFullDate, setIntensity, timeSince } from 'utils'

import {
  Badge,
  Flex,
  IconButton,
  Portal,
  Text,
  Tooltip,
  chakra
} from '@chakra-ui/react'
import { Tag, TagLabel } from '@chakra-ui/react'
import { Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useHasPermission } from 'hooks/useHasPermission'
import { useThemeColor } from 'hooks/useThemeColors'

import { FaEllipsisV } from 'react-icons/fa'

const SupportColumns = ({ handleSupport }) => {
  const params = useParams()
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
          const { name, sbom } = row || {}
          return (
            <Text my={3} color={primaryTextColor} data-tag='allowRowEvents'>
              {name}{' '}
              <chakra.span>
                {sbom?.id !== params?.sbomid && (
                  <Badge colorScheme='blue'>P</Badge>
                )}
              </chakra.span>
            </Text>
          )
        }
      },
      {
        id: 'SUPPORT_ASSESSMENT',
        name: 'ASSESSMENT',
        wrap: true,
        selector: (row) => {
          const { duplicates } = row || {}
          const { user } = row?.componentSupportLevel || {}
          return (
            <Text color={primaryTextColor}>
              {user?.name ? 'Manual' : 'Automatic'}{' '}
              {duplicates?.length > 0 && `+${duplicates?.length}`}
            </Text>
          )
        }
      },
      {
        id: 'COMPONENT_SUPPORT_LEVELS_LEVEL',
        name: 'SUPPORT LEVEL',
        sortable: true,
        width: '18%',
        selector: (row) => {
          const { duplicates } = row || {}
          const { level } = row?.componentSupportLevel || {}
          if (level) {
            return (
              <Flex gap={2} alignItems={'center'}>
                <Tag w={'184px'} colorScheme={setIntensity(level)}>
                  <TagLabel mx={'auto'} textTransform={'capitalize'}>
                    {level?.replaceAll('_', ' ')}{' '}
                  </TagLabel>
                </Tag>
                {duplicates?.length > 0 && (
                  <Text color={primaryTextColor}>+{duplicates?.length}</Text>
                )}
              </Flex>
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
        width: '14%',
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
          const { sbom } = row || {}
          const isPart = params?.sbomid !== sbom?.id
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
                    onClick={() => handleSupport(row)}
                    data-testid='edit_component_support'
                    isDisabled={!updateComponent || isPart}
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
    params?.sbomid,
    primaryTextColor,
    secondaryTextColor,
    updateComponent
  ])
}

export default SupportColumns
