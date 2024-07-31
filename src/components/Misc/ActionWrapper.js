import { Flex, useColorModeValue } from '@chakra-ui/react'

const ActionWrapper = (props) => {
  const bgColor = useColorModeValue('#F7FAFC', '#1A202C')
  const borderColor = useColorModeValue('#E2E8F0', '#4A5568')

  return (
    <Flex
      py={4}
      px={7}
      gap={3}
      left={0}
      right={0}
      bottom={0}
      bg={bgColor}
      pos={'fixed'}
      alignItems={'center'}
      justifyContent={'flex-end'}
      borderTop={`1px solid ${borderColor}`}
      {...props}
    >
      {props?.children}
    </Flex>
  )
}

export default ActionWrapper
