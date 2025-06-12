import { useMemo } from 'react'
import { getFullDate, timeSince } from 'utils'
import { getResultColor } from 'utils/styleUtils'

import {
  Flex,
  Spinner,
  Stack,
  Tag,
  TagLabel,
  Text,
  Tooltip
} from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const PolicyColumns = (isInitialized) => {
  const { primaryTextColor, secondaryTextInverse } = useThemeColor([
    'primaryTextColor',
    'secondaryTextInverse'
  ])

  return useMemo(() => {
    const columns = [
      {
        id: 'POLICY',
        name: 'POLICY',
        selector: (row) => {
          const { policy } = row
          return (
            <Stack my={4} spacing={1}>
              <Text fontSize={14} color={primaryTextColor}>
                {policy?.name || ''}
              </Text>
              <Text size='sm' color={secondaryTextInverse}>
                {policy?.description}
              </Text>
            </Stack>
          )
        },
        width: '40%',
        wrap: true
      },
      {
        id: 'EXCLUDED',
        name: 'EXCLUDED',
        selector: (row) => {
          const { excludePrimaryComponent, excludeInternalComponent } =
            row?.policy || ''
          return (
            <Flex gap={2} alignItems={'center'}>
              {!excludePrimaryComponent && !excludeInternalComponent && (
                <Text fontSize={14} color={primaryTextColor}>
                  N/A
                </Text>
              )}
              {excludePrimaryComponent && (
                <Tag variant='solid' colorScheme='blue'>
                  Primary
                </Tag>
              )}
              {excludeInternalComponent && (
                <Tag variant='solid' colorScheme='cyan'>
                  Internal
                </Tag>
              )}
            </Flex>
          )
        }
      },
      {
        id: 'RESULT',
        name: 'RESULT',
        selector: (row) => {
          const { resultType } = row
          return (
            <Tag minW={'100px'} colorScheme={getResultColor(resultType)}>
              <TagLabel mx={'auto'} pt={0.5} textTransform={'capitalize'}>
                {resultType}
              </TagLabel>
            </Tag>
          )
        },
        wrap: true
      },
      {
        id: 'VIOLATIONS',
        name: 'VIOLATIONS',
        selector: (row) => {
          const {
            resultType,
            violationsCount,
            sbom: { policyRunStatus }
          } = row
          const vColor =
            violationsCount === 0 ? 'green' : getResultColor(resultType)

          if (isInitialized || policyRunStatus !== 'FINISHED')
            return <Spinner size={'sm'} color={primaryTextColor} />

          return (
            <Tag width={'60px'} colorScheme={vColor}>
              <TagLabel mx={'auto'} pt={0.4}>
                {violationsCount}
              </TagLabel>
            </Tag>
          )
        },
        right: 'true',
        wrap: true
      },
      // CREATED AT
      {
        id: 'LAST_CHECKED',
        name: 'LAST CHECKED',
        selector: (row) => (
          <Tooltip label={getFullDate(row?.updatedAt)} placement={'top'}>
            <Text fontSize={14} color={primaryTextColor}>
              {timeSince(row?.updatedAt)}
            </Text>
          </Tooltip>
        ),
        right: 'true',
        wrap: true
      }
    ]

    return columns
  }, [isInitialized, primaryTextColor, secondaryTextInverse])
}

export default PolicyColumns
