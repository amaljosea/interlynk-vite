import { timeSince } from 'utils'

import { Box, SimpleGrid, Text } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const VexInfo = ({ data, fields }) => {
  const { primaryTextColor, sameSecondaryText } = useThemeColor([
    'primaryTextColor',
    'sameSecondaryText'
  ])

  const labelStyle = {
    fontSize: '13px',
    color: sameSecondaryText,
    letterSpacing: '0.6px'
  }

  const valueStyle = {
    color: primaryTextColor,
    mt: 1,
    fontSize: '14px'
  }

  const infoData = [
    { label: 'Status', value: data?.status || 'N/A' },
    { label: 'Justification', value: data?.justification || 'N/A' },
    { label: 'Impact Statement', value: data?.impact || 'N/A' },
    { label: 'Internal Notes', value: data?.note || 'N/A' },
    { label: 'Action Statement', value: data?.actionStmt || 'N/A' },
    { label: 'Fixed Version', value: data?.fixedIn || 'N/A' },
    { label: 'Details', value: data?.detail || 'N/A' },
    { label: 'Created By', value: data?.changedBy || 'N/A' },
    {
      label: 'Created On',
      value: data?.updatedAt ? timeSince(data?.updatedAt) : 'N/A'
    }
  ]

  return (
    <SimpleGrid columns={2} gap={4} pt={2} px={4}>
      {infoData?.map((item, index) => (
        <Box key={index}>
          <Text sx={labelStyle}>{item?.label}</Text>
          <Text sx={valueStyle}>{item?.value}</Text>
        </Box>
      ))}
      {fields?.length > 0 &&
        fields.map((item) => (
          <Box key={item?.id}>
            <Text sx={labelStyle}>
              {item?.componentVulnCustomFieldDefinition?.displayName || ''}
            </Text>
            <Text sx={valueStyle}>{item?.value || ''}</Text>
          </Box>
        ))}
    </SimpleGrid>
  )
}

export default VexInfo
