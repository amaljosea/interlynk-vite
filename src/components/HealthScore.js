import { getHealthScore, getTotalHealthScore } from 'utils/healthScoreUtils'

import { Box, Flex, Stack, Text, Tooltip } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

export const HealthScore = ({ value, scores, isComponent }) => {
  const { primaryTextColor, secondaryBgColor } = useThemeColor([
    'primaryTextColor',
    'secondaryBgColor'
  ])

  const getScore = (value) => Math.round(value)

  const gradient =
    'linear-gradient(to right, #FF9F9B, #FFBB8A, #FFDB8A, #88EEB0)'

  const ScoreInfo = () => {
    const { age, community, security } = scores || ''

    const ageScore = getHealthScore(age)
    const securityScore = getHealthScore(security)
    const communityScore = getHealthScore(community)

    const finalScore = getTotalHealthScore(age, security, community)

    const data = [
      { label: 'Age Score', value: ageScore },
      { label: 'Community Score', value: communityScore },
      { label: 'Security Score', value: securityScore },
      { label: 'Final Score', value: finalScore }
    ]

    return (
      <Stack w={'200px'} spacing={1} p={1}>
        {data?.map((item, index) => (
          <Flex key={index} gap={2} justifyContent={'space-between'}>
            <Text w={'160px'}>{item?.label}:</Text>
            <Text textAlign={'right'}>{item?.value}</Text>
          </Flex>
        ))}
      </Stack>
    )
  }

  return (
    <Tooltip label={scores ? <ScoreInfo /> : ''}>
      <Box
        height={'22px'}
        overflow={'hidden'}
        position='relative'
        width={isComponent ? '100px' : '100%'}
      >
        <Box
          height={'100%'}
          width={'100%'}
          position={'absolute'}
          sx={{ background: gradient }}
        />
        <Box
          right={0}
          pos={'absolute'}
          height={'100%'}
          bg={secondaryBgColor}
          width={value ? `${100 - getScore(value)}%` : `100%`}
        />
        <Box
          top='0'
          left='0'
          width='100%'
          height='100%'
          display='flex'
          fontSize={'xs'}
          alignItems='center'
          fontWeight='medium'
          position='absolute'
          justifyContent='center'
        >
          <Text color={primaryTextColor}>
            {value ? `${getScore(value)}%` : `N/A`}
          </Text>
        </Box>
      </Box>
    </Tooltip>
  )
}
