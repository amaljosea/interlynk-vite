import { Flex, Spinner } from '@chakra-ui/react'

const LoadingOverlay = ({ isLoading }) => {
  return (
    <Flex
      position='fixed'
      top={0}
      left={0}
      width='100%'
      height='100%'
      backgroundColor='rgba(0, 0, 0, 0.4)'
      display={isLoading ? 'flex' : 'none'}
      justifyContent='center'
      alignItems='center'
      zIndex={1000}
    >
      <Spinner size='md' color='blue.500' />
    </Flex>
  )
}

export default LoadingOverlay
