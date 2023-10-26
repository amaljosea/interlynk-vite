import { Flex, Skeleton } from '@chakra-ui/react'

const CustomLoader = () => {
  return (
    <Flex width={'100%'} gap={4} direction={'column'} mt={4}>
      <Skeleton width={'100%'} height='20px' />
      <Skeleton width={'100%'} height='20px' />
      <Skeleton width={'100%'} height='20px' />
      <Skeleton width={'100%'} height='20px' />
      <Skeleton width={'100%'} height='20px' />
    </Flex>
  )
}

export default CustomLoader
