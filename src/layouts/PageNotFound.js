import { Flex, Text } from '@chakra-ui/react'

import { BsExclamationTriangle } from 'react-icons/bs'

const PageNotFound = () => {
  return (
    <Flex
      gap={2}
      height={'100vh'}
      flexDir={'column'}
      alignItems={'center'}
      justifyContent={'center'}
    >
      <BsExclamationTriangle size={44} />
      <Text mt={4} fontSize={'2xl'} fontWeight={'semibold'}>
        404. Page not found
      </Text>
      <Text>The page you are looking for does not exist.</Text>
    </Flex>
  )
}

export default PageNotFound
