import { Link } from 'react-router-dom'

import { Box, Button, Flex, Heading, Text } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const PageNotFound = () => {
  const { secondaryTextInverse } = useThemeColor(['secondaryTextInverse'])

  return (
    <Flex
      gap={2}
      height={'100vh'}
      flexDir={'column'}
      alignItems={'center'}
      justifyContent={'center'}
    >
      <Box textAlign='center' py={10} px={6}>
        <Heading
          display='inline-block'
          as='h2'
          size='2xl'
          bgGradient='linear(to-r, blue.400, blue.600)'
          backgroundClip='text'
        >
          404
        </Heading>
        <Text fontSize='18px' mt={3} mb={2}>
          Page Not Found
        </Text>
        <Text color={secondaryTextInverse} mb={6}>
          The page you&apos;re looking for does not seem to exist
        </Text>
        <Link to={'/'}>
          <Button colorScheme='blue' variant='solid'>
            Go to Home
          </Button>
        </Link>
      </Box>
    </Flex>
  )
}

export default PageNotFound
