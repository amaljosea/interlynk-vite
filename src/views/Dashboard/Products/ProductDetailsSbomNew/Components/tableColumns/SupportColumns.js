import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { getFullDate, setIntensity, timeSince } from 'utils'

import { IconButton, Portal, Text, Tooltip } from '@chakra-ui/react'
import { Tag, TagLabel } from '@chakra-ui/react'
import { Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useHasPermission } from 'hooks/useHasPermission'
import { useThemeColor } from 'hooks/useThemeColors'

import { FaEllipsisV } from 'react-icons/fa'

const SupportColumns = ({ handleSupport }) => {
  const params = useParams()
  const sbomId = params.sbomid
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
        width: '24%',
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
        selector: (row) => {
          const { componentSupportLevel } = row || {}
          const { updatedAt } = componentSupportLevel || {}

          if (!componentSupportLevel)
            return <Text color={primaryTextColor}>N/A</Text>

          return (
            <Tooltip label={getFullDate(updatedAt)} placement={'top'}>
              <Text color={primaryTextColor}>{timeSince(updatedAt)}</Text>
            </Tooltip>
          )
        },
        sortable: true,
        sortFunction: (a, b) => {
          const dateA = new Date(a?.componentSupportLevel?.updatedAt)
          const dateB = new Date(b?.componentSupportLevel?.updatedAt)
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
          const { sbom } = row || {}
          const isPart = sbomId !== sbom?.id
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
    primaryTextColor,
    sbomId,
    secondaryTextColor,
    updateComponent
  ])
}

export default SupportColumns
