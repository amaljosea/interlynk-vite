import { Box, Text } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

export const HealthScore = ({ value, isComponent }) => {
  const { primaryTextColor, secondaryBgColor } = useThemeColor([
    'primaryTextColor',
    'secondaryBgColor'
  ])

  return (
    <Box
      mt={0.5}
      overflow={'hidden'}
      position='relative'
      borderLeftRadius={'md'}
      borderRightRadius={'md'}
      height={isComponent ? '20px' : '18px'}
      width={isComponent ? '100px' : '100%'}
    >
      <Box
        height={'100%'}
        width={'100%'}
        position={'absolute'}
        borderLeftRadius={'md'}
        borderRightRadius={'md'}
        sx={{
          background:
            'linear-gradient(to right, #FF9F9B, #FFBB8A, #FFDB8A, #88EEB0)'
        }}
      />
      <Box
        right={0}
        pos={'absolute'}
        height={'100%'}
        bg={secondaryBgColor}
        width={value ? `${100 - Math.round(value)}%` : `100%`}
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
          {value ? `${Math.round(value)} %` : `N/A`}
        </Text>
      </Box>
    </Box>
  )
}
