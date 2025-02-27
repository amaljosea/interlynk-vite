import { useMemo } from 'react'

import { Tag, TagLabel, Text } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const SupportColumns = () => {
  const { primaryTextColor } = useThemeColor(['primaryTextColor'])

  return useMemo(() => {
    const columns = [
      {
        id: 'COMPONENTS_NAME',
        name: 'NAME',
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
        selector: (row) => (
          <Tag
            w={'120px'}
            colorScheme={
              row?.componentSupportLevel?.user?.name ? 'blue' : 'green'
            }
          >
            <TagLabel mx={'auto'}>
              {row?.componentSupportLevel?.user?.name ? 'Manual' : 'Automatic'}
            </TagLabel>
          </Tag>
        )
      },
      {
        id: 'SUPPORT_LEVEL',
        name: 'SUPPORT LEVEL',
        wrap: true,
        selector: (row) => {
          if (row?.componentSupportLevel?.level) {
            return (
              <Text color={primaryTextColor} textTransform={'capitalize'}>
                {row?.componentSupportLevel?.level?.replaceAll('_', ' ')}
              </Text>
            )
          }
          return <Text color={primaryTextColor}>N/A</Text>
        }
      },
      {
        id: 'SUPPORT_END_OF_DATE',
        name: 'END-OF-SUPPORT DATE',
        wrap: true,
        selector: (row) => {
          if (row?.componentSupportLevel?.endDate) {
            return (
              <Text color={primaryTextColor}>
                {new Date(
                  row?.componentSupportLevel?.endDate
                ).toLocaleDateString()}
              </Text>
            )
          }
          return <Text color={primaryTextColor}>N/A</Text>
        }
      }
    ]

    return columns
  }, [primaryTextColor])
}

export default SupportColumns
