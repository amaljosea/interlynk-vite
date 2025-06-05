import { useMemo } from 'react'
import {
  capitalizeFirstLetter,
  getFullDate,
  timeSince,
  truncatedValue
} from 'utils'
import { getChangelogColor } from 'utils/styleUtils'

import { Flex, Tag, Text, Tooltip } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const ProductChangelogColumns = ({ action }) => {
  const { primaryTextColor, secondaryTextColor } = useThemeColor([
    'primaryTextColor',
    'secondaryTextColor'
  ])

  return useMemo(() => {
    const getChangelog = (event) => {
      switch (event) {
        case 'sbom':
          return 'SBOM'
        case 'automation_rule':
          return 'Automation rule'
        case 'jira_project':
          return 'Jira project'
        case 'organization_manufacturer_id':
          return 'Manufacturer ID'
        case 'data_retention_days':
          return 'Data retention'
        case 'flags':
          return 'Flags'
        default:
          return event
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
      }
    }

    const columns = [
      // CHANGE TYPE
      {
        id: 'ACTIVITY_LOGS_CREATED_AT',
        name: 'ACTIVITY',
        selector: (row) => {
          const { action, updatedAt, event } = row
          const eventType = getChangelog(event)
          return (
            <Flex alignItems={'center'} gap={3} my={3}>
              <Tooltip
                placement='top'
                label={action}
                textTransform={'capitalize'}
              >
                <Tag
                  variant='solid'
                  colorScheme={getChangelogColor(action)}
                  textTransform={'capitalize'}
                >
                  {action.slice(0, 1)}
                </Tag>
              </Tooltip>
              <Flex direction={'column'} alignItems={'start'} gap={1}>
                <Text fontSize={14} color={primaryTextColor}>
                  {truncatedValue(eventType, 20)}
                </Text>
                <Tooltip label={getFullDate(updatedAt)} placement='top'>
                  <Text color={secondaryTextColor} textAlign={'right'}>
                    {timeSince(updatedAt)}
                  </Text>
                </Tooltip>
              </Flex>
            </Flex>
          )
        },
        width: '35%',
        sortable: true
      },
      // PRIOR VALUE
      {
        id: 'priorValue',
        name: 'PREVIOUS VALUE',
        wrap: true,
        selector: (row) => {
          const { event, orig } = row
          const content = orig ? `${event} / ${orig}` : ''
          return (
            <Text fontSize={14} color={primaryTextColor} my={2}>
              {content || 'N/A'}
            </Text>
          )
        }
      },
      // UPDATED VALUE
      {
        id: 'updatedValue',
        name: 'UPDATED VALUE',
        wrap: true,
        selector: (row) => {
          const { event, updated } = row
          const content = updated ? `${event} / ${updated}` : ''
          return (
            <Text
              fontSize={14}
              color={primaryTextColor}
              overflow={'auto'}
              my={3}
            >
              {content || 'N/A'}
            </Text>
          )
        }
      },
      // CHANGED BY
      {
        id: 'ACTIVITY_LOGS_CHANGED_BY',
        name: 'BY',
        selector: (row) => {
          const user = capitalizeFirstLetter(row?.changedBy)
          return (
            <Tooltip placement='top' label={user}>
              <Text
                fontSize={14}
                cursor={'pointer'}
                color={primaryTextColor}
                onClick={() => action('view_user', row)}
              >
                {user}
              </Text>
            </Tooltip>
          )
        },
        right: 'true',
        wrap: true,
        sortable: true
      },
      // CHANGED ON
      {
        id: '',
        name: 'CHANGED',
        selector: (row) => (
          <Tooltip label={getFullDate(row.updatedAt)} placement={'top'}>
            <Text fontSize={14} color={primaryTextColor}>
              {timeSince(row.updatedAt)}
            </Text>
          </Tooltip>
        ),
        sortable: true,
        sortFunction: (a, b) => {
          const dateA = new Date(a.updatedAt)
          const dateB = new Date(b.updatedAt)
          return dateA - dateB // Sort in descending order
        },
        width: '12%',
        right: 'true',
        omit: true
      }
    ]

    return columns
  }, [action, primaryTextColor, secondaryTextColor])
}

export default ProductChangelogColumns
