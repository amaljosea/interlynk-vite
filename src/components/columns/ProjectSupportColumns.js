import { useMemo } from 'react'
import { getFullDate, setIntensity, timeSince } from 'utils'

import {
  Flex,
  Stack,
  Tag,
  TagLabel,
  Text,
  Tooltip,
  chakra
} from '@chakra-ui/react'

import LynkBadge from 'components/LynkBadge'
import PartInfo from 'components/Misc/PartInfo'

import { useThemeColor } from 'hooks/useThemeColors'

const ProjectSupportColumns = () => {
  const { primaryTextColor, secondaryTextColor } = useThemeColor([
    'primaryTextColor',
    'secondaryTextColor'
  ])

  return useMemo(() => {
    const columns = [
      {
        id: 'COMPONENT_SUPPORT_LEVELS_UPDATED_AT',
        name: 'NAME',
        sortable: true,
        wrap: true,
        width: '25%',
        selector: (row) => {
          const { occurrences } = row || {}
          const { name, isPart, componentSupportLevel } = occurrences[0] || {}

          return (
            <Stack my={3} spacing={1}>
              <Text fontSize={14} color={primaryTextColor}>
                {name}
              </Text>
              <Flex gap={2} alignItems={'center'} flexWrap={'wrap'}>
                {isPart && (
                  <Tooltip label={<PartInfo data={occurrences || []} />}>
                    <chakra.span>
                      <LynkBadge color='blue' title='Part' />
                    </chakra.span>
                  </Tooltip>
                )}
                <Text hidden={!isPart} color={secondaryTextColor}>
                  •
                </Text>
                {componentSupportLevel && (
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
            <Text fontSize={14} color={primaryTextColor}>
              {componentSupportLevel?.user ? 'Manual' : 'Automatic'}
            </Text>
          )
        }
      },
      {
        id: 'COMPONENT_SUPPORT_LEVELS_LEVEL',
        name: 'LEVEL',
        sortable: true,
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
        selector: (row) => {
          const { occurrences } = row || {}
          const { componentSupportLevel } = occurrences[0] || {}
          const { endDate } = componentSupportLevel || {}
          if (endDate) {
            return (
              <Text fontSize={14} color={primaryTextColor}>
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
      }
    ]

    return columns
  }, [primaryTextColor, secondaryTextColor])
}

export default ProjectSupportColumns
