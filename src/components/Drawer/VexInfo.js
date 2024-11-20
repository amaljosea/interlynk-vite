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

  return (
    <SimpleGrid columns={2} gap={4} pt={2} px={4}>
      <Box>
        <Text sx={labelStyle}>Status</Text>
        <Text sx={valueStyle}>{data?.status || 'N/A'}</Text>
      </Box>
      <Box>
        <Text sx={labelStyle}>Justification</Text>
        <Text sx={valueStyle}>{data?.justification || 'N/A'}</Text>
      </Box>
      <Box>
        <Text sx={labelStyle}>Impact Statement</Text>
        <Text sx={valueStyle}>{data?.impact || 'N/A'}</Text>
      </Box>
      <Box>
        <Text sx={labelStyle}>Internal Notes</Text>
        <Text sx={valueStyle}>{data?.note || 'N/A'}</Text>
      </Box>
      <Box>
        <Text sx={labelStyle}>Action Statement</Text>
        <Text sx={valueStyle}>{data?.actionStmt || 'N/A'}</Text>
      </Box>
      <Box>
        <Text sx={labelStyle}>Fixed Version</Text>
        <Text sx={valueStyle}>{data?.fixedIn || 'N/A'}</Text>
      </Box>
      <Box>
        <Text sx={labelStyle}>Details</Text>
        <Text sx={valueStyle}>{data?.detail || 'N/A'}</Text>
      </Box>
      {fields?.length > 0 &&
        fields.map((item) => (
          <Box key={item?.id}>
            <Text sx={labelStyle}>
              {item?.componentVulnCustomFieldDefinition?.displayName || ''}
            </Text>
            <Text sx={valueStyle}>{item?.value || ''}</Text>
          </Box>
        ))}
      <Box>
        <Text sx={labelStyle}>Created By</Text>
        <Text sx={valueStyle}>{data?.changedBy || 'N/A'}</Text>
      </Box>
      <Box>
        <Text sx={labelStyle}>Created On</Text>
        <Text sx={valueStyle}>
          {data?.updatedAt ? timeSince(data?.updatedAt) : 'N/A'}
        </Text>
      </Box>
    </SimpleGrid>
  )
}

export default VexInfo
