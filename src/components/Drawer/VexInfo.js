import styled from 'styled-components'
import { timeSince } from 'utils'

import { Box, SimpleGrid, Text } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const VexInfo = ({ data, fields }) => {
  const { primaryTextColor } = useThemeColor(['primaryTextColor'])

  const CustomText = styled(Text)`
    font-size: 13px;
    color: #718096;
    letter-spacing: 0.6px;
  `

  const style = { color: primaryTextColor, mt: 1, fontSize: 14 }

  return (
    <SimpleGrid columns={2} gap={4} pt={2} px={4}>
      <Box>
        <CustomText>Status</CustomText>
        <Text sx={style}>{data?.status || 'N/A'}</Text>
      </Box>
      <Box>
        <CustomText>Justification</CustomText>
        <Text sx={style}>{data?.justification || 'N/A'}</Text>
      </Box>
      <Box>
        <CustomText>Impact Statement</CustomText>
        <Text sx={style}>{data?.impact || 'N/A'}</Text>
      </Box>
      <Box>
        <CustomText>Internal Notes</CustomText>
        <Text sx={style}>{data?.note || 'N/A'}</Text>
      </Box>
      <Box>
        <CustomText>Action Statement</CustomText>
        <Text sx={style}>{data?.actionStmt || 'N/A'}</Text>
      </Box>
      <Box>
        <CustomText>Fixed Version</CustomText>
        <Text sx={style}>{data?.fixedIn || 'N/A'}</Text>
      </Box>
      <Box>
        <CustomText>Details</CustomText>
        <Text sx={style}>{data?.detail || 'N/A'}</Text>
      </Box>
      {fields?.length > 0 &&
        fields?.map((item) => (
          <Box key={item?.id}>
            <CustomText>
              {item?.componentVulnCustomFieldDefinition?.displayName || ''}
            </CustomText>
            <Text sx={style}>{item?.value || ''}</Text>
          </Box>
        ))}
      <Box>
        <CustomText>Created By</CustomText>
        <Text sx={style}>{data?.changedBy || 'N/A'}</Text>
      </Box>
      <Box>
        <CustomText>Created On</CustomText>
        <Text sx={style}>
          {data?.updatedAt ? timeSince(data?.updatedAt) : 'N/A'}
        </Text>
      </Box>
    </SimpleGrid>
  )
}

export default VexInfo
