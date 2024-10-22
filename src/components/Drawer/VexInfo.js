import styled from 'styled-components'
import { timeSince } from 'utils'

import { Box, Stack, Text } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const VexInfo = ({ data }) => {
  const { primaryTextColor } = useThemeColor(['primaryTextColor'])

  const CustomText = styled(Text)`
    font-size: 13px;
    font-weight: bold;
    color: #718096;
    text-transform: uppercase;
    letter-spacing: 0.6px;
  `

  const style = { color: primaryTextColor, mt: 1, fontSize: 14 }

  return (
    <Stack spacing={5}>
      <Box>
        <CustomText>STATUS</CustomText>
        <Text sx={style}>{data?.status || 'N/A'}</Text>
      </Box>
      <Box>
        <CustomText>JUSTIFICATION</CustomText>
        <Text sx={style}>{data?.justification || 'N/A'}</Text>
      </Box>
      <Box>
        <CustomText>IMPACT STATEMENT</CustomText>
        <Text sx={style}>{data?.impact || 'N/A'}</Text>
      </Box>
      <Box>
        <CustomText>INTERNAL NOTES</CustomText>
        <Text sx={style}>{data?.note || 'N/A'}</Text>
      </Box>
      <Box>
        <CustomText>ACTION STATEMENT</CustomText>
        <Text sx={style}>{data?.actionStmt || 'N/A'}</Text>
      </Box>
      <Box>
        <CustomText>FIXED VERSION</CustomText>
        <Text sx={style}>{data?.fixedIn || 'N/A'}</Text>
      </Box>
      <Box>
        <CustomText>DETAIL</CustomText>
        <Text sx={style}>{data?.detail || 'N/A'}</Text>
      </Box>
      <Box>
        <CustomText>CREATED BY</CustomText>
        <Text sx={style}>{data?.changedBy || 'N/A'}</Text>
      </Box>
      <Box>
        <CustomText>CREATED ON</CustomText>
        <Text sx={style}>
          {data?.updatedAt ? timeSince(data?.updatedAt) : 'N/A'}
        </Text>
      </Box>
    </Stack>
  )
}

export default VexInfo
