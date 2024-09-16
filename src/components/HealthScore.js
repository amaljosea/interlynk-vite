import { Box, Text, useColorModeValue } from '@chakra-ui/react'

export const HealthScore = ({ value, isComponent }) => {
  const bgColor = useColorModeValue('gray.100', 'gray.600')
  const textColor = useColorModeValue('#1A202C', '#F7FAFC')

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
        bg={bgColor}
        width={value === 0 ? '100%' : `${100 - Math.round(value)}%`}
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
        <Text color={textColor}>
          {value === 0 ? 'N/A' : `${Math.round(value)} %`}
        </Text>
      </Box>
    </Box>
  )
}
