import { Button, Flex, Text } from '@chakra-ui/react'

const DeviceWarning = () => {
  return (
    <Flex
      justifyContent='center'
      sx={{ p: 8, height: '100vh', alignItems: 'center', flexDir: 'column' }}
    >
      <Text
        textAlign='center'
        sx={{ fontSize: '2xl', fontWeight: 'bold', color: 'red.500' }}
      >
        This page is best viewed on Desktop
      </Text>
      <Text fontSize='md' mt={4} textAlign='center'>
        Please switch to a larger screen or enable {'Desktop View'} in your
        browser settings.
      </Text>
      <Button
        mt={6}
        colorScheme='blue'
        onClick={() => window.location.reload()}
      >
        Retry
      </Button>
    </Flex>
  )
}

export default DeviceWarning
