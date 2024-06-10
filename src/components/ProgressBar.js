import { Box, Progress, Text } from '@chakra-ui/react'

export const ProgressBar = ({ value, loading, text }) => {
  const getColor = () => {
    if (value < 30) {
      return 'red'
    } else if (value >= 30 && value <= 70) {
      return 'blue'
    } else {
      return 'green'
    }
  }

  return (
    <Box>
      <Box position='relative' display='inline-block' width='100%'>
        <Progress
          size='lg'
          height={'1.5rem'}
          value={value}
          colorScheme={getColor()}
          borderRadius={'0.375rem'}
          isIndeterminate={loading}
        />
        <Box
          position='absolute'
          top='0'
          left='0'
          width='100%'
          height='100%'
          display='flex'
          alignItems='center'
          justifyContent='center'
          color={value < 50 ? 'black' : 'white'}
          fontWeight='medium'
          fontSize={'xs'}
        >
          <Text>{value} / 100</Text>
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
