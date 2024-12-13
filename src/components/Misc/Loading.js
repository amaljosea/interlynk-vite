import { Center, Spinner, Text } from '@chakra-ui/react'

const Loading = ({ type }) => {
  const style = { w: '100vw', h: '100vh', position: 'fixed', top: 0, left: 0 }
  return (
    <Center
      {...style}
      zIndex='overlay'
      flexDirection='column'
      bg='rgba(0, 0, 0, 0.6)'
    >
      <Spinner size='xl' color='white' mb={4} />
      <Text fontSize='lg' color='white'>
        {type === 'csv'
          ? 'Downloading Support Level...'
          : 'Downloading Original Sbom...'}
      </Text>
    </Center>
  )
}

export default Loading
