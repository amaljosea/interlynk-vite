import { Center, Spinner, Text } from '@chakra-ui/react'

const Loading = ({ type }) => {
  const style = { w: '100vw', h: '100vh', position: 'fixed', top: 0, left: 0 }

  const getStatus = (type) => {
    switch (type) {
      case 'signout':
        return 'Signing out'
      case 'support':
        return 'Downloading Support Level...'
      case 'excel':
        return 'Downloading SBOM Spreadsheet...'
      default:
        return 'Downloading Original SBOM...'
    }
  }

  return (
    <Center
      {...style}
      zIndex='overlay'
      flexDirection='column'
      bg='rgba(0, 0, 0, 0.8)'
    >
      <Spinner size='xl' color='white' mb={4} />
      <Text fontSize='lg' color='white'>
        {getStatus(type)}
      </Text>
    </Center>
  )
}

export default Loading
