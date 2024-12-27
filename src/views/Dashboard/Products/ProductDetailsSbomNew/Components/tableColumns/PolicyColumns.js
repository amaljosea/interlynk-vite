import { useMemo } from 'react'
import { getColor, getFullDate, timeSince } from 'utils'

import { Spinner, Tag, TagLabel, Text, Tooltip } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const PolicyColumns = (isInitialized) => {
  const { primaryTextColor } = useThemeColor(['primaryTextColor'])

  return useMemo(() => {
    const columns = [
      {
        id: 'POLICY',
        name: 'POLICY',
        selector: (row) => {
          const { policy } = row
          return <Text color={primaryTextColor}>{policy?.name || ''}</Text>
        },
        wrap: true
      },
      {
        id: 'RESULT',
        name: 'RESULT',
        selector: (row) => {
          const { resultType } = row

          return (
            <Tag minW={'100px'} colorScheme={getColor(resultType)}>
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
          if (isInitialized || policyRunStatus !== 'FINISHED')
            return <Spinner size='xs' mt={0.5} />
          const vColor = violationsCount === 0 ? 'green' : getColor(resultType)
          return (
            <Tag width={'60px'} colorScheme={vColor}>
              <TagLabel mx={'auto'} pt={0.5}>
                {violationsCount}
              </TagLabel>
            </Tag>
          )
        },
        right: 'true',
        width: '10%',
        wrap: true
      },
      // CREATED AT
      {
        id: 'LAST_CHECKED',
        name: 'LAST CHECKED',
        selector: (row) => (
          <Tooltip label={getFullDate(row?.updatedAt)} placement={'top'}>
            <Text color={primaryTextColor}>{timeSince(row?.updatedAt)}</Text>
          </Tooltip>
        ),
        width: '14%',
        right: 'true',
        wrap: true
      }
    ]

    return columns
  }, [isInitialized, primaryTextColor])
}

export default PolicyColumns
