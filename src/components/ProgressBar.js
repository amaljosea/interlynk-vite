import { Box, Text } from '@chakra-ui/react'

export const ProgressBar = ({ value, loading, text }) => {
  return (
    <Box>
      <Box
        height={6}
        width='100%'
        overflow={'hidden'}
        position='relative'
        borderLeftRadius={'md'}
        borderRightRadius={'md'}
        display='inline-block'
      >
        <Box
          height={'100%'}
          width={'100%'}
          position={'absolute'}
          borderLeftRadius={'lg'}
          borderRightRadius={'lg'}
          sx={{
            background:
              'linear-gradient(90deg, rgba(245,101,101,1) 0%, rgba(236,201,75,1) 50%, rgba(72,187,120,1) 100%)'
          }}
        />
        <Box
          right={0}
          pos={'absolute'}
          height={'100%'}
          bg={'gray.100'}
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
          <Text>{loading ? `Loading...` : `${Math.round(value)} %`}</Text>
        </Box>
      </Box>
      {text && (
        <Text
          pos={'relative'}
          top={0}
          textAlign={'center'}
          fontSize={'xs'}
          style={{ cursor: 'pointer' }}
        >
          {text}
        </Text>
      )}
    </Box>
  )
}
