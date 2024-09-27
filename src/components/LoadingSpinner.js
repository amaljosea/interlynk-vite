import { Flex, Spinner } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const LoadingSpinner = () => {
  const { primaryBlueText } = useThemeColor(['primaryBlueText'])
  return (
    <Flex
      width='100%'
      height='100%'
      display={'flex'}
      justifyContent='center'
      alignItems='center'
    >
      <Spinner size='md' color={primaryBlueText} />
    </Flex>
  )
}

export default LoadingSpinner
