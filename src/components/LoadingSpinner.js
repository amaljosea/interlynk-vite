import { Flex, Spinner } from '@chakra-ui/react'

const LoadingSpinner = () => {
  return (
    <Flex
      width='100%'
      height='100%'
      display={'flex'}
      justifyContent='center'
      alignItems='center'
    >
      <Spinner size='md' color='blue.500' />
    </Flex>
  )
}

export default LoadingSpinner
